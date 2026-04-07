import { auth } from "@ai-mock-interview/auth";
import { db } from "@ai-mock-interview/db";
import {
  interview,
  interviewQuestion,
} from "@ai-mock-interview/db/schema/interview";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import InterviewSession from "@/components/interview-session";
import FeedbackDisplay from "@/components/feedback-display";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const [interviewRecord] = await db
    .select()
    .from(interview)
    .where(
      and(
        eq(interview.id, id),
        eq(interview.userId, session.user.id),
      ),
    )
    .limit(1);

  if (!interviewRecord) {
    notFound();
  }

  const questions = await db
    .select()
    .from(interviewQuestion)
    .where(eq(interviewQuestion.interviewId, id))
    .orderBy(interviewQuestion.questionNumber);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 animate-fade-up">
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {interviewRecord.status === "evaluated" && interviewRecord.feedbackJson ? (
        <FeedbackDisplay
          feedback={interviewRecord.feedbackJson as any}
          questions={questions}
        />
      ) : (
        <InterviewSession
          interviewId={interviewRecord.id}
          questions={questions}
        />
      )}
    </div>
  );
}
