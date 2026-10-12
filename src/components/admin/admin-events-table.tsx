"use client";

import Link from "next/link";
import { PencilLine } from "lucide-react";

import { EventStatusToggle } from "@/components/admin/event-status-toggle";
import { CategoryBadge } from "@/components/events/category-badge";
import { EventImage } from "@/components/events/event-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDate, formatPrice } from "@/lib/format";
import type { EventDTO } from "@/lib/dto";

/**
 * Event listing for admins: image, title, category, city, status and an edit
 * action, plus the Active/Inactive switch. Rendered as rows so it stays usable
 * on a phone.
 */
export function AdminEventsTable({
  events,
  onEventUpdated,
}: {
  events: EventDTO[];
  /** Lets the parent swap one row for its updated copy after a status change. */
  onEventUpdated?: (updated: EventDTO) => void;
}) {
  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center"
        >
          <EventImage
            src={event.imageUrl}
            alt={event.title}
            category={event.category}
            className="h-24 w-full rounded-lg sm:h-16 sm:w-24"
          />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/events/${event.id}`}
                className="font-display text-base font-semibold leading-snug hover:text-primary"
              >
                {event.title}
              </Link>
              <CategoryBadge category={event.category} />
              {!event.isActive ? <Badge variant="muted">Hidden from visitors</Badge> : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {event.city} · {formatEventDate(event.eventDate)} · {formatPrice(event.price)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <EventStatusToggle
              event={event}
              onChange={(updated) => onEventUpdated?.(updated)}
            />
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/events/${event.id}/edit`}>
                <PencilLine className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
