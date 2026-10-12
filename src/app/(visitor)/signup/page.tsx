import { Suspense } from "react";
import type { Metadata } from "next";

import { CredentialsForm } from "@/components/auth/credentials-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <CredentialsForm mode="signup" />
    </Suspense>
  );
}
