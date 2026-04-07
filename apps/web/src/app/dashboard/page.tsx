import { auth } from "@ai-mock-interview/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import ResumeUpload from "@/components/resume-upload";
import InterviewHistory from "@/components/interview-history";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-12 animate-fade-up">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-2">
          Dashboard
        </p>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          Hi, {session.user.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Upload your resume to start a mock interview, or review your past sessions below.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {/* Upload section */}
        <div className="animate-fade-up delay-100">
          <ResumeUpload />
        </div>

        {/* History section */}
        <div className="animate-fade-up delay-200">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
              Past Interviews
            </p>
          </div>
          <InterviewHistory />
        </div>
      </div>
    </div>
  );
}
