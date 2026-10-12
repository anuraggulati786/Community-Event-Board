"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { ApiClientError, apiPost, errorMessage } from "@/lib/api/client";
import type { UserDTO } from "@/lib/dto";

type Mode = "login" | "signup";

const COPY: Record<Mode, { title: string; subtitle: string; submit: string; endpoint: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to see your feed and saved reminders.",
    submit: "Log in",
    endpoint: "/api/auth/login",
  },
  signup: {
    title: "Create your account",
    subtitle: "Pick your interests once, then get a feed that fits.",
    submit: "Sign up",
    endpoint: "/api/auth/signup",
  },
};

/** One form for both flows - they differ only in copy and endpoint. */
export function CredentialsForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useSession();
  const copy = COPY[mode];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const response = await apiPost<{ user: UserDTO; token: string }>(copy.endpoint, {
        email,
        password,
      });
      await refresh();

      const nextPath = searchParams.get("next");
      const needsInterests = response.data.user.favoriteCategories.length === 0;
      const destination = nextPath ?? (needsInterests ? "/onboarding" : "/feed");

      router.push(destination);
      router.refresh();
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setFieldErrors(caught.fieldErrors);
        // A 400 already explains itself field by field; anything else gets a banner.
        if (caught.status !== 400) setFormError(caught.message);
      } else {
        setFormError(errorMessage(caught));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">{copy.title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{copy.subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {formError ? (
            <Alert className="border-destructive/25 bg-destructive/5 text-destructive">
              {formError}
            </Alert>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email ? (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password ? (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
            ) : (
              mode === "signup" && (
                <p className="text-xs text-muted-foreground">
                  Stored as a bcrypt hash — never in plain text.
                </p>
              )
            )}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Please wait…" : copy.submit}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              New here?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
