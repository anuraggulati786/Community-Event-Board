import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

/** Total / Active / Inactive, straight from the admin events endpoint meta. */
export function StatCards({
  total,
  active,
  inactive,
  isLoading,
}: {
  total: number;
  active: number;
  inactive: number;
  isLoading: boolean;
}) {
  const cards = [
    {
      label: "Total events",
      value: total,
      icon: CalendarDays,
      tone: "bg-primary/10 text-primary",
      hint: "Every event ever posted",
    },
    {
      label: "Active events",
      value: active,
      icon: CheckCircle2,
      tone: "bg-emerald-100 text-emerald-700",
      hint: "Visible to visitors",
    },
    {
      label: "Inactive events",
      value: inactive,
      icon: XCircle,
      tone: "bg-amber-100 text-amber-700",
      hint: "Hidden, never deleted",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.tone}`}>
              <card.icon className="h-4 w-4" />
            </span>
          </div>
          {isLoading ? (
            <Skeleton className="mt-3 h-9 w-16" />
          ) : (
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">{card.value}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}
