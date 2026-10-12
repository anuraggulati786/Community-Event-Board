"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, IndianRupee, MapPin, SearchX } from "lucide-react";

import { CardDesigner } from "@/components/card-designer/card-designer";
import { CategoryBadge } from "@/components/events/category-badge";
import { EventImage } from "@/components/events/event-image";
import { RemindMeButton } from "@/components/events/remind-me-button";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { EventDetailsSkeleton } from "@/components/states/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { formatEventDate, formatPrice, formatRelativeToToday } from "@/lib/format";
import type { EventDTO } from "@/lib/dto";

/** Event details: `/events/[id]`, fetched from `GET /api/events/[id]`. */
export function EventDetailsView() {
  const params = useParams<{ id: string }>();
  const eventId = params?.id;

  const { data: event, error, status, isLoading, refetch } = useApi<EventDTO>(
    eventId ? `/api/events/${eventId}` : null,
  );

  if (isLoading && !event) {
    return (
      <div className="space-y-6">
        <BackLink />
        <EventDetailsSkeleton />
      </div>
    );
  }

  if (status === 404 || (!isLoading && !event && !error)) {
    return (
      <div className="space-y-6">
        <BackLink />
        <EmptyState
          icon={SearchX}
          title="Event not found."
          description="This event may have been unpublished or the link is incorrect."
          action={
            <Button asChild>
              <Link href="/events">Back to events</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <BackLink />
        <ErrorState
          title="Unable to load this event."
          description={error ?? "Please try again."}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BackLink />

      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <EventImage
          src={event.imageUrl}
          alt={event.title}
          category={event.category}
          className="h-56 w-full sm:h-80 lg:h-96"
          sizes="100vw"
        />

        <div className="space-y-6 p-5 sm:p-7">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={event.category} />
              {formatRelativeToToday(event.eventDate) ? (
                <Badge variant="muted">{formatRelativeToToday(event.eventDate)}</Badge>
              ) : null}
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {event.title}
            </h1>
          </div>

          <dl className="grid gap-4 border-y border-border py-5 sm:grid-cols-3">
            <Detail
              icon={<CalendarDays className="h-4 w-4" />}
              label="Date & time"
              value={formatEventDate(event.eventDate)}
            />
            <Detail
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={event.city}
            />
            <Detail
              icon={<IndianRupee className="h-4 w-4" />}
              label="Price"
              value={formatPrice(event.price)}
            />
          </dl>

          <div className="space-y-2">
            <h2 className="font-display text-base font-semibold">About this event</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
              {event.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <RemindMeButton event={event} returnTo={`/events/${event.id}`} />
            <Button variant="outline" asChild>
              <Link href="/events">Browse more events</Link>
            </Button>
          </div>
        </div>
      </article>

      <CardDesigner event={event} />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/events"
      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to events
    </Link>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </span>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}
