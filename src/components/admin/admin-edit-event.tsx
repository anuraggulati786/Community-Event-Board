"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { EventForm } from "@/components/admin/event-form";
import { ErrorState } from "@/components/states/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/use-api";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import type { EventDTO } from "@/lib/dto";

/**
 * Loads the event (inactive ones are visible to a signed-in admin) and hands it
 * to the shared form in edit mode.
 */
export function AdminEditEvent() {
  const params = useParams<{ id: string }>();
  const eventId = params?.id;

  const { data: event, error, status, isLoading, refetch } = useApi<EventDTO>(
    eventId ? `/api/events/${eventId}` : null,
  );
  useAdminSessionGuard(status);

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
          Edit event
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Changes are published as soon as you save.
        </p>
      </div>

      {isLoading && !event ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4 rounded-xl border border-border bg-card p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : error || !event ? (
        <ErrorState
          title="Unable to load this event."
          description={error ?? "It may have been removed."}
          onRetry={refetch}
        />
      ) : (
        <EventForm event={event} />
      )}
    </div>
  );
}
