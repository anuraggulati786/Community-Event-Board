import { Suspense } from "react";
import type { Metadata } from "next";

import { EventDetailsView } from "@/components/events/event-details-view";
import { EventDetailsSkeleton } from "@/components/states/skeletons";

export const metadata: Metadata = {
  title: "Event details",
};

export default function EventDetailsPage() {
  return (
    <Suspense fallback={<EventDetailsSkeleton />}>
      <EventDetailsView />
    </Suspense>
  );
}
