import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { EventForm } from "@/components/admin/event-form";

export const metadata: Metadata = {
  title: "Add event",
};

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Add a new event
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything here is validated on the server before it is stored.
        </p>
      </div>

      <EventForm />
    </div>
  );
}
