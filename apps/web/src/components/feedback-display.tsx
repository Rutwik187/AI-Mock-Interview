"use client";

import { Badge } from "@ai-mock-interview/ui/components/badge";
import { Progress } from "@ai-mock-interview/ui/components/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ai-mock-interview/ui/components/accordion";
import { CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";

interface QuestionFeedback {
  questionNumber: number;
  relevanceScore: number;
  strengthPoints: string[];
  improvementAreas: string[];
  suggestedAnswer: string;
}

interface CategoryScore {
  category: string;
  score: number;
  feedback: string;
}

interface Feedback {
  overallScore: number;
  categoryScores: CategoryScore[];
  questionFeedbacks: QuestionFeedback[];
  summary: string;
  topStrengths: string[];
  areasForImprovement: string[];
}

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  category: string;
  difficulty: string;
  userAnswer: string | null;
}

interface FeedbackDisplayProps {
  feedback: Feedback;
  questions: Question[];
}

function ScoreRing({ score }: { score: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "text-green-500 dark:text-green-400";
    if (s >= 60) return "text-amber-500 dark:text-amber-400";
    if (s >= 40) return "text-orange-500 dark:text-orange-400";
    return "text-red-500 dark:text-red-400";
  };

  return (
    <div className="relative size-28 animate-scale-in">
      <svg className="size-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="6"
          fill="none"
          className="stroke-muted/30"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${getColor(score)} stroke-current transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold tabular-nums ${getColor(score)}`}>
          {score}
        </span>
        <span className="text-[10px] text-muted-foreground tracking-wider">SCORE</span>
      </div>
    </div>
  );
}

export default function FeedbackDisplay({
  feedback,
  questions,
}: FeedbackDisplayProps) {
  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-8">
      {/* Overall */}
      <div className="animate-fade-up flex flex-col items-center text-center gap-4 py-8">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
          Interview Feedback
        </p>
        <ScoreRing score={feedback.overallScore} />
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
          {feedback.summary}
        </p>
      </div>

      {/* Strengths & Improvements — side by side */}
      <div className="animate-fade-up delay-100 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card/50 p-5">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-green-600 dark:text-green-400 mb-3">
            Strengths
          </p>
          <ul className="flex flex-col gap-2">
            {feedback.topStrengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="size-3.5 mt-0.5 shrink-0 text-green-500/70" />
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/50 p-5">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-3">
            Improvements
          </p>
          <ul className="flex flex-col gap-2">
            {feedback.areasForImprovement.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-amber-500/70" />
                <span className="leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Category scores */}
      {feedback.categoryScores.length > 0 && (
        <div className="animate-fade-up delay-200 rounded-xl border border-border/60 bg-card/50 p-5">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
            Category Breakdown
          </p>
          <div className="flex flex-col gap-4">
            {feedback.categoryScores.map((cat, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{cat.category}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{cat.score}%</span>
                </div>
                <Progress value={cat.score} className="h-1" />
                <p className="text-xs text-muted-foreground leading-relaxed">{cat.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-question accordion */}
      <div className="animate-fade-up delay-300 rounded-xl border border-border/60 bg-card/50 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground">
            Question Details
          </p>
        </div>
        <Accordion multiple>
          {feedback.questionFeedbacks.map((qf, i) => {
            const question = questions.find((q) => q.questionNumber === qf.questionNumber);
            return (
              <AccordionItem key={i} value={`q-${qf.questionNumber}`} className="border-border/40">
                <AccordionTrigger className="px-5 py-3 text-sm">
                  <div className="flex items-center gap-3 text-left">
                    <span
                      className={`
                        text-xs font-bold tabular-nums
                        ${qf.relevanceScore >= 70
                          ? "text-green-600 dark:text-green-400"
                          : qf.relevanceScore >= 40
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      `}
                    >
                      {qf.relevanceScore}%
                    </span>
                    <span className="text-sm">Q{qf.questionNumber}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <div className="flex flex-col gap-4">
                    {question && (
                      <>
                        <div className="rounded-lg bg-muted/30 p-3">
                          <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                            Question
                          </p>
                          <p className="text-sm leading-relaxed">{question.questionText}</p>
                        </div>
                        {question.userAnswer && (
                          <div className="rounded-lg border border-border/40 p-3">
                            <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                              Your Answer
                            </p>
                            <p className="text-sm leading-relaxed">{question.userAnswer}</p>
                          </div>
                        )}
                      </>
                    )}

                    {qf.strengthPoints.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium tracking-wider uppercase text-green-600 dark:text-green-400 mb-1.5">
                          Strengths
                        </p>
                        <ul className="flex flex-col gap-1">
                          {qf.strengthPoints.map((sp, j) => (
                            <li key={j} className="text-sm flex items-start gap-1.5 leading-relaxed">
                              <CheckCircle className="size-3 mt-0.5 shrink-0 text-green-500/60" />
                              {sp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {qf.improvementAreas.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-1.5">
                          Improvements
                        </p>
                        <ul className="flex flex-col gap-1">
                          {qf.improvementAreas.map((ia, j) => (
                            <li key={j} className="text-sm flex items-start gap-1.5 leading-relaxed">
                              <AlertTriangle className="size-3 mt-0.5 shrink-0 text-amber-500/60" />
                              {ia}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="rounded-lg border-l-2 border-primary/40 bg-primary/5 p-3">
                      <p className="text-[10px] font-medium tracking-wider uppercase text-primary/80 mb-1 flex items-center gap-1">
                        <Lightbulb className="size-3" />
                        Suggested Answer
                      </p>
                      <p className="text-sm leading-relaxed">{qf.suggestedAnswer}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
