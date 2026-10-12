import type { LucideIcon } from "lucide-react";
import { CalendarX2 } from "lucide-react";

import { cn } from "@/lib/utils";

/** Friendly empty state - never leave the user staring at a blank page. */
export function EmptyState({
  title,
  description,
  icon: Icon = CalendarX2,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
