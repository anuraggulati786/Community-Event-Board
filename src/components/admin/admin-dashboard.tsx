"use client";

import Link from "next/link";
import { ArrowRight, CalendarPlus, Plus } from "lucide-react";

import { StatCards } from "@/components/admin/stat-cards";
import { CategoryBadge } from "@/components/events/category-badge";
import { ErrorState } from "@/components/states/error-state";
import { TableRowsSkeleton } from "@/components/states/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { formatEventDate, formatPrice } from "@/lib/format";
import type { EventDTO } from "@/lib/dto";

/** Admin dashboard: totals for the whole board plus the next few events. */
export function AdminDashboard() {
  const { data, meta, error, status, isLoading, refetch } = useApi<EventDTO[]>("/api/admin/events");
  useAdminSessionGuard(status);

  const events = data ?? [];
  const total = (meta?.total as number | undefined) ?? 0;
  const active = (meta?.active as number | undefined) ?? 0;
  const inactive = (meta?.inactive as number | undefined) ?? 0;

  const upcoming = [...events]
    .filter((event) => new Date(event.eventDate).getTime() > Date.now())
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A quick look at everything happening on the board.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4" />
            Add event
          </Link>
        </Button>
      </header>

      {error && !data ? (
        <ErrorState
          title="Unable to load the dashboard."
          description={error}
          onRetry={refetch}
        />
      ) : (
        <>
          <StatCards total={total} active={active} inactive={inactive} isLoading={isLoading && !data} />

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarPlus className="h-4 w-4 text-primary" />
                Next events
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/events">
                  Manage all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading && !data ? (
                <TableRowsSkeleton rows={4} />
              ) : upcoming.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No upcoming events yet. Add one to get started.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {upcoming.map((event) => (
                    <li key={event.id} className="flex flex-wrap items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="font-medium hover:text-primary"
                        >
                          {event.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatEventDate(event.eventDate)} · {event.city} ·{" "}
                          {formatPrice(event.price)}
                        </p>
                      </div>
                      <CategoryBadge category={event.category} />
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/events/${event.id}/edit`}>Edit</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
