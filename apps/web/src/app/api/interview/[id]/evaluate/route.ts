import { auth } from "@ai-mock-interview/auth";
import { db } from "@ai-mock-interview/db";
import {
  interview,
  interviewQuestion,
} from "@ai-mock-interview/db/schema/interview";
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60;

const feedbackSchema = z.object({
  overallScore: z.number().min(0).max(100),
  categoryScores: z.array(
    z.object({
      category: z.string(),
      score: z.number().min(0).max(100),
      feedback: z.string(),
    }),
  ),
  questionFeedbacks: z.array(
    z.object({
      questionNumber: z.number(),
      relevanceScore: z.number().min(0).max(100),
      strengthPoints: z.array(z.string()),
      improvementAreas: z.array(z.string()),
      suggestedAnswer: z.string(),
    }),
  ),
  summary: z.string(),
  topStrengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: interviewId } = await params;

    // Verify interview belongs to user
    const [interviewRecord] = await db
      .select()
      .from(interview)
      .where(
        and(
          eq(interview.id, interviewId),
          eq(interview.userId, session.user.id),
        ),
      )
      .limit(1);

    if (!interviewRecord) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }

    if (interviewRecord.status === "evaluated") {
      return NextResponse.json(
        { error: "Interview already evaluated" },
        { status: 400 },
      );
    }

    // Get all questions with answers
    const questions = await db
      .select()
      .from(interviewQuestion)
      .where(eq(interviewQuestion.interviewId, interviewId))
      .orderBy(interviewQuestion.questionNumber);

    const answered = questions.filter((q) => q.userAnswer);
    if (answered.length === 0) {
      return NextResponse.json(
        { error: "Please answer at least one question before submitting" },
        { status: 400 },
      );
    }

    // Build Q&A context for evaluation (include unanswered as skipped)
    const qaContext = questions
      .map(
        (q) =>
          `Question ${q.questionNumber} [${q.category}, ${q.difficulty}]: ${q.questionText}\nCandidate Answer: ${q.userAnswer || "(Skipped — no answer provided)"}`,
      )
      .join("\n\n");

    // Evaluate with Gemini
    const result = await generateText({
      model: google("gemini-3.1-flash-lite-preview"),
      output: Output.object({ schema: feedbackSchema }),
      prompt: `You are an expert technical interviewer evaluating a ${interviewRecord.jobRole} candidate.

Evaluate the following interview based on the candidate's resume and their answers to each question.

Score each answer on relevance (0-100), identify strengths and areas for improvement, and provide a suggested ideal answer.

Also provide an overall score, category-wise scores, a summary, top strengths, and key areas for improvement.

Be constructive but honest. Provide specific, actionable feedback.

Resume:
${interviewRecord.resumeText}

Interview Q&A:
${qaContext}

Provide structured evaluation feedback.`,
    });

    const feedback = result.output;

    if (!feedback) {
      return NextResponse.json(
        { error: "Failed to generate feedback" },
        { status: 500 },
      );
    }

    // Store feedback
    await db
      .update(interview)
      .set({
        status: "evaluated",
        overallScore: feedback.overallScore,
        feedbackSummary: feedback.summary,
        feedbackJson: feedback,
      })
      .where(eq(interview.id, interviewId));

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
