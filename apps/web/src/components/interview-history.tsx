"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@ai-mock-interview/ui/components/skeleton";
import { ArrowRight, Clock } from "lucide-react";

interface Interview {
  id: string;
  jobRole: string;
  status: string;
  overallScore: number | null;
  createdAt: string;
}

const statusLabel: Record<string, string> = {
  generating: "Generating",
  in_progress: "In Progress",
  completed: "Completed",
  evaluated: "Evaluated",
};

export default function InterviewHistory() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchInterviews() {
      try {
        const res = await fetch("/api/interview/list");
        const data = await res.json();
        if (res.ok) setInterviews(data.interviews);
      } catch {
        console.error("Failed to fetch interviews");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInterviews();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No interviews yet — upload a resume to start.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {interviews.map((interview) => (
        <button
          key={interview.id}
          onClick={() => router.push(`/interview/${interview.id}`)}
          className="group flex items-center justify-between rounded-lg border border-border/40 bg-card/30 px-4 py-3.5 text-left transition-all duration-200 hover:bg-card/60 hover:border-border/60"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{interview.jobRole}</span>
              <span className="rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
                {statusLabel[interview.status] || interview.status}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {new Date(interview.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {interview.overallScore !== null && (
              <div className="text-right">
                <p className="text-lg font-bold tabular-nums">{interview.overallScore}</p>
                <p className="text-[10px] text-muted-foreground tracking-wider">SCORE</p>
              </div>
            )}
            <ArrowRight className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>
      ))}
    </div>
  );
}
