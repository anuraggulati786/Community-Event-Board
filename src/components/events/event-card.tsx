"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Ticket } from "lucide-react";

import { CategoryBadge } from "@/components/events/category-badge";
import { EventImage } from "@/components/events/event-image";
import { RemindMeButton } from "@/components/events/remind-me-button";
import { Button } from "@/components/ui/button";
import { formatEventDate, formatPrice, formatRelativeToToday } from "@/lib/format";
import type { EventDTO } from "@/lib/dto";

export function EventCard({ event, index = 0 }: { event: EventDTO; index?: number }) {
  const relative = formatRelativeToToday(event.eventDate);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover"
    >
      <Link href={`/events/${event.id}`} className="relative block">
        <EventImage
          src={event.imageUrl}
          alt={event.title}
          category={event.category}
          className="h-44 w-full transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <CategoryBadge category={event.category} className="bg-card/95 backdrop-blur" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/events/${event.id}`}>
          <h3 className="font-display text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
            {event.title}
          </h3>
        </Link>

        <dl className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <dt className="sr-only">Date</dt>
              <dd className="font-medium text-foreground">{formatEventDate(event.eventDate)}</dd>
              {relative ? <span className="text-xs text-muted-foreground">{relative}</span> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <dt className="sr-only">City</dt>
            <dd>{event.city}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 shrink-0 text-primary" />
            <dt className="sr-only">Price</dt>
            <dd className="font-medium text-foreground">{formatPrice(event.price)}</dd>
          </div>
        </dl>

        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>

        <div className="mt-5 flex items-center gap-2 pt-1">
          <Button variant="secondary" size="sm" className="flex-1" asChild>
            <Link href={`/events/${event.id}`}>Details</Link>
          </Button>
          <RemindMeButton event={event} size="sm" className="flex-1" returnTo="/events" />
        </div>
      </div>
    </motion.article>
  );
}
