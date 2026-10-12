"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/states/error-state";

/** Last-resort error boundary so a crash still shows a friendly, useful screen. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ui] unexpected error", error);
  }, [error]);

  return (
    <div className="container-page py-16">
      <ErrorState
        title="Something went wrong."
        description="We could not render this page. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
