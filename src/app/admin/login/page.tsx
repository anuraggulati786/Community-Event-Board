import { Suspense } from "react";
import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
