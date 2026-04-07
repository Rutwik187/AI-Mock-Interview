"use client";

import { useState } from "react";
import { Button } from "@ai-mock-interview/ui/components/button";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="relative flex min-h-[calc(100svh-57px)] items-center justify-center px-4">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl tracking-tight">
            {showSignIn ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {showSignIn
              ? "Sign in to continue your interview practice"
              : "Start practicing for your next interview"}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/80 p-6 shadow-sm glass">
          {showSignIn ? (
            <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
