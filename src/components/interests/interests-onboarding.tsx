"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { InterestPicker } from "@/components/interests/interest-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";

/** Step after the first login: pick the categories that fill "My Feed". */
export function InterestsOnboarding() {
  const router = useRouter();
  const { user, isLoading, setUser } = useSession();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Your session has expired. Please sign in again to pick your interests.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            What are you interested in?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick as many as you like. We will use them to build your personal feed, and you can
            change them any time from My Feed.
          </p>
        </div>
      </div>

      <InterestPicker
        initialCategories={user.favoriteCategories}
        submitLabel="Save and go to my feed"
        onSaved={(updated) => {
          setUser(updated);
          router.push("/feed");
          router.refresh();
        }}
      />
    </div>
  );
}
