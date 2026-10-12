"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Loader2, SearchX } from "lucide-react";

import { EventCard } from "@/components/events/event-card";
import { EventsFilterBar, type EventFilters } from "@/components/events/events-filter-bar";
import { PaginationControls } from "@/components/events/pagination-controls";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { EventGridSkeleton } from "@/components/states/skeletons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { buildQuery } from "@/lib/api/client";
import { EVENTS_PAGE_SIZE } from "@/lib/constants";
import type { EventDTO } from "@/lib/dto";

/**
 * The events page. Filters and page number live in the URL
 * (/events?category=Music&city=Coimbatore&q=night&page=1) and every change
 * triggers one request to GET /api/events.
 */
export function EventsBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: EventFilters = {
    category: searchParams.get("category") ?? "",
    city: searchParams.get("city") ?? "",
    q: searchParams.get("q") ?? "",
  };
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const hasFilters = Boolean(filters.category || filters.city || filters.q);

  const query = buildQuery({
    category: filters.category,
    city: filters.city,
    q: filters.q,
    page,
    pageSize: EVENTS_PAGE_SIZE,
  });

  const { data, meta, error, isLoading, isRefreshing, refetch } = useApi<EventDTO[]>(
    `/api/events${query}`,
  );

  const events = useMemo(() => data ?? [], [data]);
  const availableCities = (meta?.availableCities as string[] | undefined) ?? [];
  const total = (meta?.total as number | undefined) ?? 0;
  const totalPages = (meta?.totalPages as number | undefined) ?? 1;

  function pushUrl(next: Partial<EventFilters> & { page?: number }) {
    const merged = {
      category: next.category ?? filters.category,
      city: next.city ?? filters.city,
      q: next.q ?? filters.q,
      page: next.page ?? 1,
    };
    router.replace(`${pathname}${buildQuery(merged)}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Upcoming events</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Hand-picked happenings near you. Filter by category, city or a keyword — the three work
          together.
        </p>
      </header>

      <EventsFilterBar
        filters={filters}
        availableCities={availableCities}
        onChange={(next) => pushUrl({ ...next, page: 1 })}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {isLoading && events.length === 0 ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading events…
            </span>
          ) : total > 0 ? (
            <>
              <span className="font-medium text-foreground">{total}</span>{" "}
              {total === 1 ? "event" : "events"}
              {hasFilters
                ? total === 1
                  ? " matches your filters"
                  : " match your filters"
                : " coming up"}
            </>
          ) : null}
        </p>
        {isRefreshing ? (
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating…
          </span>
        ) : null}
      </div>

      {error && events.length > 0 ? (
        <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
          {error} Showing the last results we loaded.
        </Alert>
      ) : null}

      {isLoading && events.length === 0 ? (
        <EventGridSkeleton count={EVENTS_PAGE_SIZE} />
      ) : error && events.length === 0 ? (
        <ErrorState
          title="Unable to fetch events."
          description={error}
          onRetry={refetch}
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={hasFilters ? "No matching events found." : "No events found."}
          description={
            hasFilters
              ? "Try a different category, city or keyword — clearing the filters always works."
              : "New events are added regularly. Please check back soon."
          }
          action={
            hasFilters ? (
              <Button
                variant="outline"
                onClick={() => pushUrl({ category: "", city: "", q: "", page: 1 })}
              >
                Clear filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      )}

      <PaginationControls
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={EVENTS_PAGE_SIZE}
        onPageChange={(nextPage) => pushUrl({ page: Math.min(Math.max(1, nextPage), totalPages) })}
      />
    </div>
  );
}
