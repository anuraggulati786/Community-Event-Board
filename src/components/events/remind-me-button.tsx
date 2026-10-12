"use client";

import { useRouter } from "next/navigation";
import { Bell, BellRing, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useReminders } from "@/hooks/use-reminders";
import { useSession } from "@/hooks/use-session";
import type { EventDTO } from "@/lib/dto";
import { cn } from "@/lib/utils";

/**
 * "Remind me". Clicking flips the button immediately, the state is persisted,
 * and a failed save rolls the button back with a toast (handled in
 * use-reminders).
 */
export function RemindMeButton({
  event,
  className,
  size = "default",
  returnTo,
}: {
  event: EventDTO;
  className?: string;
  size?: "sm" | "default" | "lg";
  returnTo?: string;
}) {
  const router = useRouter();
  const { user } = useSession();
  const { remindedIds, isPending, toggle } = useReminders();

  const reminded = remindedIds.has(event.id);
  const pending = isPending(event.id);

  function handleClick() {
    if (!user) {
      const next = returnTo ?? `/events/${event.id}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    void toggle(event.id, event);
  }

  return (
    <Button
      type="button"
      variant={reminded ? "default" : "outline"}
      size={size}
      className={cn("gap-2", className)}
      onClick={handleClick}
      disabled={pending}
      aria-pressed={reminded}
      aria-label={reminded ? `Remove reminder for ${event.title}` : `Remind me about ${event.title}`}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : reminded ? (
        <BellRing className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {reminded ? "Reminded" : "Remind me"}
    </Button>
  );
}
