"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@ai-mock-interview/ui/components/button";
import { Badge } from "@ai-mock-interview/ui/components/badge";
import { Progress } from "@ai-mock-interview/ui/components/progress";
import { Loader2, Send, Keyboard, Mic } from "lucide-react";
import { toast } from "sonner";

import SpeechRecorder from "./speech-recorder";

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  category: string;
  difficulty: string;
  userAnswer: string | null;
}

interface InterviewSessionProps {
  interviewId: string;
  questions: Question[];
}

const difficultyColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  easy: "secondary",
  medium: "default",
  hard: "destructive",
};

export default function InterviewSession({
  interviewId,
  questions: initialQuestions,
}: InterviewSessionProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const first = initialQuestions.findIndex((q) => !q.userAnswer);
    return first === -1 ? 0 : first;
  });
  const [answer, setAnswer] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const router = useRouter();

  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.filter((q) => q.userAnswer).length;
  const allAnswered = answeredCount === questions.length;
  const progress = (answeredCount / questions.length) * 100;

  const saveAnswer = useCallback(async () => {
    if (!answer.trim() || !currentQuestion) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/interview/${interviewId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: answer.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === currentQuestion.id
            ? { ...q, userAnswer: answer.trim() }
            : q,
        ),
      );

      toast.success(`Answer saved`);
      setAnswer("");

      // Auto-advance to next unanswered
      const nextUnanswered = questions.findIndex(
        (q, i) => i > currentIndex && !q.userAnswer,
      );
      if (nextUnanswered !== -1) {
        setCurrentIndex(nextUnanswered);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [answer, currentQuestion, interviewId, currentIndex, questions]);

  const evaluateInterview = useCallback(async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch(`/api/interview/${interviewId}/evaluate`, {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success("Evaluation complete");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setIsEvaluating(false);
    }
  }, [interviewId, router]);

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      {/* Progress bar */}
      <div className="animate-fade-up">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">
            Progress
          </p>
          <p className="text-xs text-muted-foreground">
            {answeredCount}/{questions.length}
          </p>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Question nav dots */}
      <div className="animate-fade-up delay-100 flex items-center gap-2">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => {
              setCurrentIndex(i);
              setAnswer(q.userAnswer || "");
            }}
            className={`
              size-8 rounded-md text-xs font-medium transition-all duration-200
              ${
                i === currentIndex
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : q.userAnswer
                    ? "bg-primary/15 text-primary"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }
            `}
          >
            {q.questionNumber}
          </button>
        ))}
      </div>

      {/* Active question */}
      {currentQuestion && (
        <div className="animate-scale-in rounded-xl border border-border/60 bg-card/50 overflow-hidden">
          {/* Question header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-[10px] tracking-wider uppercase">
                {currentQuestion.category}
              </Badge>
              <Badge variant={difficultyColors[currentQuestion.difficulty] || "default"} className="text-[10px] tracking-wider uppercase">
                {currentQuestion.difficulty}
              </Badge>
              {currentQuestion.userAnswer && (
                <span className="ml-auto text-xs text-primary font-medium">✓ Answered</span>
              )}
            </div>
            <p className="text-base leading-relaxed font-medium">
              {currentQuestion.questionText}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border/40" />

          {/* Answer section */}
          <div className="px-6 py-5 flex flex-col gap-4">
            {currentQuestion.userAnswer && !answer && (
              <div className="rounded-lg bg-muted/30 px-4 py-3">
                <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                  Saved Answer
                </p>
                <p className="text-sm leading-relaxed">{currentQuestion.userAnswer}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {currentQuestion.userAnswer ? "Update answer" : "Your answer"}
              </p>
              <button
                onClick={() => setShowTextInput(!showTextInput)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showTextInput ? <Mic className="size-3" /> : <Keyboard className="size-3" />}
                {showTextInput ? "Voice" : "Type"}
              </button>
            </div>

            {showTextInput ? (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer..."
                rows={4}
                className="w-full rounded-lg border border-border/50 bg-background/50 px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none transition-all"
              />
            ) : (
              <>
                <SpeechRecorder onTranscript={setAnswer} disabled={isSaving} />
                {answer && (
                  <div className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
                    <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                      Transcription
                    </p>
                    <p className="text-sm leading-relaxed">{answer}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer actions */}
          <div className="border-t border-border/40 px-6 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex((prev) => Math.max(0, prev - 1));
                setAnswer(questions[Math.max(0, currentIndex - 1)]?.userAnswer || "");
              }}
              className="text-xs"
            >
              ← Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={saveAnswer}
                disabled={!answer.trim() || isSaving}
                className="text-xs"
              >
                {isSaving ? (
                  <Loader2 data-icon="inline-start" className="animate-spin size-3.5" />
                ) : (
                  <Send data-icon="inline-start" className="size-3.5" />
                )}
                {isSaving ? "Saving..." : "Save"}
              </Button>

              {currentIndex < questions.length - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                    setAnswer(
                      questions[Math.min(questions.length - 1, currentIndex + 1)]?.userAnswer || "",
                    );
                  }}
                  className="text-xs"
                >
                  Next →
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit for evaluation */}
      {answeredCount > 0 && (
        <div className="animate-fade-up rounded-xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-medium">
              {allAnswered
                ? "All questions answered"
                : `${answeredCount} of ${questions.length} answered`}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {allAnswered
                ? "Submit for AI evaluation and detailed feedback."
                : "Submit now or continue answering."}
            </p>
            <Button
              onClick={evaluateInterview}
              disabled={isEvaluating}
              className="mt-1"
            >
              {isEvaluating ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Evaluating...
                </>
              ) : (
                "Get Feedback"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
