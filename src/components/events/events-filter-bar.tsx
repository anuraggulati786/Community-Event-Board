"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

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
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";

export type EventFilters = {
  category: string;
  city: string;
  q: string;
};

const ALL = "__all__";

/**
 * Category + city + text search. Every change is written to the URL query
 * string, which the page turns into a single server-side request, so the three
 * filters always combine.
 */
export function EventsFilterBar({
  filters,
  availableCities,
  onChange,
}: {
  filters: EventFilters;
  availableCities: string[];
  onChange: (next: EventFilters) => void;
}) {
  const [search, setSearch] = useState(filters.q);

  // Keep the input in sync when the URL changes (back/forward, clear button).
  useEffect(() => {
    setSearch(filters.q);
  }, [filters.q]);

  // Debounce typing so we do not fire a request per keystroke.
  useEffect(() => {
    if (search === filters.q) return;
    const timer = setTimeout(() => onChange({ ...filters, q: search }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilters = Boolean(filters.category || filters.city || filters.q);

  return (
    <section
      aria-label="Filter events"
      className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="event-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="event-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try “night”, “workshop”, “biryani”…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-category">Category</Label>
          <Select
            value={filters.category || ALL}
            onValueChange={(value) =>
              onChange({ ...filters, category: value === ALL ? "" : value })
            }
          >
            <SelectTrigger id="filter-category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={CATEGORY_LABELS[category]}>
                  {CATEGORY_LABELS[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-city">City</Label>
          <Select
            value={filters.city || ALL}
            onValueChange={(value) => onChange({ ...filters, city: value === ALL ? "" : value })}
          >
            <SelectTrigger id="filter-city">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All cities</SelectItem>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={!hasFilters}
          onClick={() => {
            setSearch("");
            onChange({ category: "", city: "", q: "" });
          }}
          className="lg:mb-0"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </section>
  );
}
