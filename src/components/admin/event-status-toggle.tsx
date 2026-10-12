"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ApiClientError, apiPatch, errorMessage } from "@/lib/api/client";
import type { EventDTO } from "@/lib/dto";
import { cn } from "@/lib/utils";

/**
 * Active / Inactive switch. The label flips immediately, the change is saved
 * with PATCH, and a failure puts it straight back where it was.
 * Events are never deleted - only hidden.
 */
export function EventStatusToggle({
  event,
  onChange,
}: {
  event: EventDTO;
  onChange: (event: EventDTO) => void;
}) {
  const [isActive, setIsActive] = useState(event.isActive);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const next = !isActive;
    setIsActive(next); // optimistic
    setPending(true);

    try {
      const response = await apiPatch<EventDTO>(`/api/admin/events/${event.id}`, { isActive: next });
      setIsActive(response.data.isActive);
      onChange(response.data);
      toast.success(next ? "Event set to Active" : "Event set to Inactive", {
        description: next
          ? "Visitors can see it again."
          : "It stays in the database and can be re-activated any time.",
      });
    } catch (caught) {
      setIsActive(!next); // rollback
      toast.error("Could not update the event status.", {
        description:
          caught instanceof ApiClientError && caught.status === 401
            ? "Your admin session expired — please sign in again."
            : errorMessage(caught),
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      onClick={() => void toggle()}
      disabled={pending}
      title={isActive ? "Set to Inactive" : "Set to Active"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        pending && "opacity-70",
      )}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            isActive ? "bg-emerald-500" : "bg-amber-500",
          )}
        />
      )}
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
