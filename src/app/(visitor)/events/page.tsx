import { Suspense } from "react";
import type { Metadata } from "next";

import { EventsBrowser } from "@/components/events/events-browser";
import { EventGridSkeleton } from "@/components/states/skeletons";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Browse upcoming music nights, workshops, food fairs, sports and kids events. Filter by category, city and keyword.",
};

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-9 w-56 animate-pulse rounded-lg bg-secondary" />
          <div className="h-32 animate-pulse rounded-xl bg-secondary" />
          <EventGridSkeleton />
        </div>
      }
    >
      <EventsBrowser />
    </Suspense>
  );
}
