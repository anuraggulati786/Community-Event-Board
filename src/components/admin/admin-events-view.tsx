"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarX2, Plus, Search } from "lucide-react";

import { AdminEventsTable } from "@/components/admin/admin-events-table";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { TableRowsSkeleton } from "@/components/states/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/hooks/use-api";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import type { EventDTO } from "@/lib/dto";

type StatusFilter = "all" | "active" | "inactive";

/** Admin event listing. Deleting is intentionally not offered. */
export function AdminEventsView() {
  const { data, meta, error, status, isLoading, refetch, setData } = useApi<EventDTO[]>(
    "/api/admin/events",
  );
  useAdminSessionGuard(status);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const events = useMemo(() => {
    const list = data ?? [];
    const term = search.trim().toLowerCase();
    return list.filter((event) => {
      if (statusFilter === "active" && !event.isActive) return false;
      if (statusFilter === "inactive" && event.isActive) return false;
      if (!term) return true;
      return (
        event.title.toLowerCase().includes(term) ||
        event.city.toLowerCase().includes(term) ||
        event.category.toLowerCase().includes(term)
      );
    });
  }, [data, search, statusFilter]);

  const total = (meta?.total as number | undefined) ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            All events
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} events in total. Toggle a row to hide or show it — nothing is ever deleted.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4" />
            Add event
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="admin-search">Search events</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="admin-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Title, city or category"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-status">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger id="admin-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="inactive">Inactive only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && !data ? (
        <TableRowsSkeleton rows={6} />
      ) : error && !data ? (
        <ErrorState title="Unable to fetch events." description={error} onRetry={refetch} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="No events match this view."
          description="Try a different search term or status filter."
        />
      ) : (
        <AdminEventsTable
          events={events}
          onEventUpdated={(updated) =>
            setData((current) =>
              (current ?? []).map((event) => (event.id === updated.id ? updated : event)),
            )
          }
        />
      )}
    </div>
  );
}
