"use client";

import Link from "next/link";
import { useState } from "react";
import { BellRing, Heart, Loader2, PencilLine, SearchX, Settings2 } from "lucide-react";

import { EventCard } from "@/components/events/event-card";
import { CategoryBadge } from "@/components/events/category-badge";
import { RemindMeButton } from "@/components/events/remind-me-button";
import { InterestPicker } from "@/components/interests/interest-picker";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { EventGridSkeleton } from "@/components/states/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/use-api";
import { useReminders } from "@/hooks/use-reminders";
import { useSession } from "@/hooks/use-session";
import { buildQuery } from "@/lib/api/client";
import { CATEGORY_LABELS, EVENTS_PAGE_SIZE } from "@/lib/constants";
import { formatEventDate, formatPrice } from "@/lib/format";
import type { EventDTO } from "@/lib/dto";

/**
 * "My Feed": upcoming active events from the user's favourite categories,
 * plus the reminders they have saved. Interests can be edited here at any time.
 */
export function FeedView() {
  const { user, isLoading: sessionLoading, setUser } = useSession();
  const { reminders, isLoading: remindersLoading } = useReminders();

  const [page, setPage] = useState(1);
  const [editingInterests, setEditingInterests] = useState(false);

  const { data, meta, error, isLoading, isRefreshing, refetch } = useApi<EventDTO[]>(
    user ? `/api/feed${buildQuery({ page, pageSize: EVENTS_PAGE_SIZE })}` : null,
  );

  const events = data ?? [];
  const total = (meta?.total as number | undefined) ?? 0;
  const totalPages = (meta?.totalPages as number | undefined) ?? 1;

  if (sessionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <EventGridSkeleton count={3} />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon={Heart}
        title="Sign in to see your feed."
        description="Your feed follows the categories you choose."
        action={
          <Button asChild>
            <Link href="/login?next=%2Ffeed">Log in</Link>
          </Button>
        }
      />
    );
  }

  const hasInterests = user.favoriteCategories.length > 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">My Feed</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Upcoming events from the categories you picked, nearest first.
          </p>
          {hasInterests ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Following
              </span>
              {user.favoriteCategories.map((category) => (
                <CategoryBadge key={category} category={category} />
              ))}
            </div>
          ) : null}
        </div>

        {hasInterests ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingInterests((editing) => !editing)}
            aria-expanded={editingInterests}
          >
            {editingInterests ? (
              <>
                <Settings2 className="h-4 w-4" />
                Close editor
              </>
            ) : (
              <>
                <PencilLine className="h-4 w-4" />
                Edit interests
              </>
            )}
          </Button>
        ) : null}
      </header>

      {editingInterests || !hasInterests ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {hasInterests ? "Edit your interests" : "Pick your interests"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InterestPicker
              initialCategories={user.favoriteCategories}
              submitLabel="Save interests"
              description={
                hasInterests
                  ? "Add or remove categories — your feed updates straight away."
                  : "Choose at least one category to fill your feed with events you care about."
              }
              onSaved={(updated) => {
                setUser(updated);
                setEditingInterests(false);
                setPage(1);
                refetch();
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="space-y-5" aria-label="Feed events">
          {isLoading && events.length === 0 ? (
            <>
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading feed…
              </p>
              <EventGridSkeleton count={4} />
            </>
          ) : error ? (
            <ErrorState
              title="Unable to fetch your feed."
              description={error}
              onRetry={refetch}
            />
          ) : events.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={
                hasInterests
                  ? "No events available for your selected interests."
                  : "No events available for your selected interests."
              }
              description={
                hasInterests
                  ? "Nothing is scheduled in those categories right now. Try following one more, or browse all events."
                  : "Pick one or more categories above and your feed will fill up."
              }
              action={
                <Button variant="outline" asChild>
                  <Link href="/events">Browse all events</Link>
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                {events.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {isRefreshing ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Updating…
                    </span>
                  ) : (
                    <>
                      Showing {events.length} of {total} events
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>

        <aside className="space-y-4" aria-label="My reminders">
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <BellRing className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">My reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {remindersLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : reminders.length === 0 ? (
                <EmptyState
                  icon={BellRing}
                  title="No reminders yet."
                  description="Tap “Remind me” on any event and it will show up here."
                  className="px-4 py-8"
                />
              ) : (
                reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="rounded-xl border border-border bg-card/60 p-3.5 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/events/${reminder.eventId}`}
                        className="font-medium leading-snug hover:text-primary"
                      >
                        {reminder.event.title}
                      </Link>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatEventDate(reminder.event.eventDate)} · {reminder.event.city}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {formatPrice(reminder.event.price)}
                      </span>
                      <RemindMeButton event={reminder.event} size="sm" returnTo="/feed" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Explore</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link href="/events" className="block text-muted-foreground hover:text-foreground">
                Browse all upcoming events
              </Link>
              {hasInterests ? (
                <p className="text-muted-foreground">
                  Following: {user.favoriteCategories.map((item) => CATEGORY_LABELS[item]).join(", ")}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
