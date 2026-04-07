import { auth } from "@ai-mock-interview/auth";
import { db } from "@ai-mock-interview/db";
import { interview } from "@ai-mock-interview/db/schema/interview";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviews = await db
      .select({
        id: interview.id,
        jobRole: interview.jobRole,
        status: interview.status,
        overallScore: interview.overallScore,
        createdAt: interview.createdAt,
      })
      .from(interview)
      .where(eq(interview.userId, session.user.id))
      .orderBy(desc(interview.createdAt));

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error("Interview list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
