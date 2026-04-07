import { auth } from "@ai-mock-interview/auth";
import { db } from "@ai-mock-interview/db";
import {
  interview,
  interviewQuestion,
} from "@ai-mock-interview/db/schema/interview";
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { z } from "zod";

export const maxDuration = 60;

const questionSchema = z.object({
  questions: z.array(
    z.object({
      questionText: z.string(),
      category: z.enum([
        "technical",
        "behavioral",
        "situational",
        "problem-solving",
        "system-design",
      ]),
      difficulty: z.enum(["easy", "medium", "hard"]),
    }),
  ),
});

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const jobRole = (formData.get("jobRole") as string) || "Software Developer";

    if (!file) {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 },
      );
    }

    // Parse PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const resumeText = await extractTextFromPdf(buffer);

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 400 },
      );
    }

    // Create interview record
    const [newInterview] = await db
      .insert(interview)
      .values({
        userId: session.user.id,
        resumeText,
        jobRole,
        status: "generating",
      })
      .returning();

    // Generate questions with Gemini structured output
    const result = await generateText({
      model: google("gemini-3.1-flash-lite-preview"),
      output: Output.object({ schema: questionSchema }),
      prompt: `You are an expert technical interviewer for ${jobRole} positions.

Based on the following resume, generate exactly 3 interview questions that are highly relevant to the candidate's experience, skills, and the job role.

Mix the categories across technical, behavioral, and problem-solving. Vary the difficulty (1 easy, 1 medium, 1 hard).

Each question should be specific and tailored to the resume content - avoid generic questions.

Resume:
${resumeText}

Generate 3 interview questions as structured output.`,
    });

    const generated = result.output;

    if (!generated || !generated.questions || generated.questions.length === 0) {
      await db
        .update(interview)
        .set({ status: "in_progress" })
        .where(eq(interview.id, newInterview.id));

      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: 500 },
      );
    }

    // Insert questions
    const questionValues = generated.questions.map(
      (q, index) => ({
        interviewId: newInterview.id,
        questionNumber: index + 1,
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty as "easy" | "medium" | "hard",
      }),
    );

    const insertedQuestions = await db
      .insert(interviewQuestion)
      .values(questionValues)
      .returning();

    // Update interview status
    await db
      .update(interview)
      .set({ status: "in_progress" })
      .where(eq(interview.id, newInterview.id));

    return NextResponse.json({
      interviewId: newInterview.id,
      questions: insertedQuestions,
    });
  } catch (error) {
    console.error("Interview upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
