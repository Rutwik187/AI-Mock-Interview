import Link from "next/link";
import { Button } from "@ai-mock-interview/ui/components/button";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 -right-48 size-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/2 -left-32 size-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 size-[300px] rounded-full bg-accent/5 blur-[80px]" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          {/* Left — copy */}
          <div className="flex flex-col gap-8">
            <div className="animate-fade-up">
              <span className="inline-block rounded-full border border-border/80 bg-card/60 px-3.5 py-1 text-xs font-medium text-muted-foreground tracking-wide uppercase">
                AI-Powered Practice
              </span>
            </div>

            <h1 className="animate-fade-up delay-100 font-display text-5xl leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              Prepare for your
              <br />
              <span className="text-primary">next interview</span>
            </h1>

            <p className="animate-fade-up delay-200 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Upload your resume, receive tailored questions from AI, answer with
              your voice, and get detailed feedback — in under ten minutes.
            </p>

            <div className="animate-fade-up delay-300 flex items-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="px-8 text-sm font-medium tracking-wide">
                  Start Practicing
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg" className="text-sm tracking-wide text-muted-foreground">
                  Sign In →
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — visual element */}
          <div className="animate-fade-up delay-400 hidden lg:block">
            <div className="relative">
              {/* Decorative card stack */}
              <div className="absolute -top-4 -left-4 h-64 w-full rounded-xl border border-border/30 bg-card/30" />
              <div className="absolute -top-2 -left-2 h-64 w-full rounded-xl border border-border/50 bg-card/50" />
              <div className="relative rounded-xl border border-border bg-card p-8 shadow-lg">
                <div className="mb-6 flex items-center gap-3">
                  <div className="size-2 rounded-full bg-primary/80" />
                  <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                    Interview in Progress
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Question 1 of 3</p>
                    <p className="text-sm leading-relaxed">
                      Describe your experience with distributed systems and how you've handled data consistency challenges.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary/15 flex items-center justify-center">
                      <div className="size-3 rounded-full bg-primary animate-pulse" />
                    </div>
                    <div className="h-1.5 flex-1 rounded-full bg-muted">
                      <div className="h-full w-2/3 rounded-full bg-primary/60" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {["Technical", "Hard"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border/60 px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process strip */}
      <section className="relative border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="animate-fade-up delay-300 mb-10">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
              How it works
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Upload Resume",
                desc: "Drop your PDF resume. AI extracts skills, experience, and focus areas.",
              },
              {
                step: "02",
                title: "AI Questions",
                desc: "Gemini generates 3 tailored questions matched to your background.",
              },
              {
                step: "03",
                title: "Speak or Type",
                desc: "Answer using voice recognition or keyboard. Take your time.",
              },
              {
                step: "04",
                title: "Get Feedback",
                desc: "Receive scores, strengths, improvements, and suggested answers.",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`animate-fade-up delay-${(i + 3) * 100} flex flex-col gap-3`}
              >
                <span className="font-display text-3xl text-primary/40">
                  {item.step}
                </span>
                <h3 className="text-sm font-semibold tracking-wide">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="animate-fade-up flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            Ready to practice?
          </h2>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            Your next interview is an opportunity. Prepare with AI-powered
            practice that adapts to your experience.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="px-10 text-sm font-medium tracking-wide">
              Begin Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
