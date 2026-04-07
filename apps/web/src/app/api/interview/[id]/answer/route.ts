import { auth } from "@ai-mock-interview/auth";
import { db } from "@ai-mock-interview/db";
import {
  interview,
  interviewQuestion,
} from "@ai-mock-interview/db/schema/interview";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const answerSchema = z.object({
  questionId: z.string(),
  answer: z.string().min(1),
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
    const body = await req.json();
    const parsed = answerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

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

    // Update question with answer
    const [updatedQuestion] = await db
      .update(interviewQuestion)
      .set({
        userAnswer: parsed.data.answer,
        answeredAt: new Date(),
      })
      .where(
        and(
          eq(interviewQuestion.id, parsed.data.questionId),
          eq(interviewQuestion.interviewId, interviewId),
        ),
      )
      .returning();

    if (!updatedQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ question: updatedQuestion });
  } catch (error) {
    console.error("Answer save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
