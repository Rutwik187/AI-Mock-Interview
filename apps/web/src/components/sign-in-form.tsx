import { Button } from "@ai-mock-interview/ui/components/button";
import { Input } from "@ai-mock-interview/ui/components/input";
import { Label } from "@ai-mock-interview/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Welcome back");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <form.Field name="email">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name} className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
              Email
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-10"
              placeholder="you@example.com"
            />
            {field.state.meta.errors.map((error) => (
              <p key={error?.message} className="text-xs text-destructive">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name} className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
              Password
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-10"
              placeholder="••••••••"
            />
            {field.state.meta.errors.map((error) => (
              <p key={error?.message} className="text-xs text-destructive">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button type="submit" className="mt-2 w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        )}
      </form.Subscribe>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Need an account? <span className="text-primary font-medium">Sign Up</span>
        </button>
      </div>
    </form>
  );
}
