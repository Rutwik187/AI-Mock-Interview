import { auth } from "@ai-mock-interview/auth";
import { db } from "@ai-mock-interview/db";
import {
  interview,
  interviewQuestion,
} from "@ai-mock-interview/db/schema/interview";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
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

    const questions = await db
      .select()
      .from(interviewQuestion)
      .where(eq(interviewQuestion.interviewId, interviewId))
      .orderBy(interviewQuestion.questionNumber);

    return NextResponse.json({
      interview: interviewRecord,
      questions,
    });
  } catch (error) {
    console.error("Interview fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
