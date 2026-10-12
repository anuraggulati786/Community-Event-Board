"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { apiDelete, apiPost, buildQuery, errorMessage } from "@/lib/api/client";
import type { EventDTO, ReminderDTO } from "@/lib/dto";
import { useSession } from "@/hooks/use-session";

/**
 * Owns the "Remind me" state for the whole app.
 *
 * The button flips instantly (optimistic update). If the API call fails the
 * change is rolled back and the user gets a toast, so the screen never claims
 * something was saved that was not.
 */

type RemindersValue = {
  remindedIds: Set<string>;
  reminders: ReminderDTO[];
  isLoading: boolean;
  isPending: (eventId: string) => boolean;
  toggle: (eventId: string, event?: EventDTO) => Promise<boolean>;
  refresh: () => Promise<void>;
};

const RemindersContext = createContext<RemindersValue | null>(null);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());
  const [reminders, setReminders] = useState<ReminderDTO[]>([]);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/reminders", {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) {
        // Signed-out visitors have no reminders; that is not an error state.
        setRemindedIds(new Set());
        setReminders([]);
        return;
      }
      const body = (await response.json()) as {
        data: ReminderDTO[];
        meta?: { eventIds?: string[] };
      };
      setReminders(body.data ?? []);
      setRemindedIds(new Set(body.meta?.eventIds ?? (body.data ?? []).map((item) => item.eventId)));
    } catch {
      setRemindedIds(new Set());
      setReminders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload whenever the signed-in identity changes.
  useEffect(() => {
    if (!user) {
      setRemindedIds(new Set());
      setReminders([]);
      return;
    }
    void load();
  }, [user, load]);

  const markPending = useCallback((eventId: string, pending: boolean) => {
    setPendingIds((current) => {
      const next = new Set(current);
      if (pending) next.add(eventId);
      else next.delete(eventId);
      return next;
    });
  }, []);

  const toggle = useCallback(
    async (eventId: string, event?: EventDTO): Promise<boolean> => {
      const wasReminded = remindedIds.has(eventId);

      // 1. Optimistic update - the UI changes immediately.
      setRemindedIds((current) => {
        const next = new Set(current);
        if (wasReminded) next.delete(eventId);
        else next.add(eventId);
        return next;
      });
      if (wasReminded) {
        setReminders((current) => current.filter((item) => item.eventId !== eventId));
      } else if (event) {
        setReminders((current) => [
          ...current,
          {
            id: `optimistic-${eventId}`,
            eventId,
            createdAt: new Date().toISOString(),
            event,
          },
        ]);
      }
      markPending(eventId, true);

      try {
        // 2. Persist.
        if (wasReminded) {
          await apiDelete(`/api/reminders${buildQuery({ eventId })}`);
        } else {
          const response = await apiPost<ReminderDTO>("/api/reminders", { eventId });
          setReminders((current) =>
            current.map((item) => (item.eventId === eventId ? response.data : item)),
          );
        }
        toast.success(
          wasReminded ? "Reminder removed" : "Reminder saved",
          wasReminded ? undefined : { description: "We will keep it in My reminders." },
        );
        return true;
      } catch (caught) {
        // 3. Rollback to the previous state and explain what happened.
        setRemindedIds((current) => {
          const next = new Set(current);
          if (wasReminded) next.add(eventId);
          else next.delete(eventId);
          return next;
        });
        if (wasReminded && event) {
          setReminders((current) =>
            current.some((item) => item.eventId === eventId)
              ? current
              : [
                  ...current,
                  { id: `rollback-${eventId}`, eventId, createdAt: new Date().toISOString(), event },
                ],
          );
        } else if (!wasReminded) {
          setReminders((current) => current.filter((item) => item.eventId !== eventId));
        }
        toast.error(errorMessage(caught), {
          description: wasReminded ? "The reminder is still saved." : "The reminder was not saved.",
        });
        return false;
      } finally {
        markPending(eventId, false);
      }
    },
    [remindedIds, markPending],
  );

  const value = useMemo<RemindersValue>(
    () => ({
      remindedIds,
      reminders,
      isLoading,
      isPending: (eventId: string) => pendingIds.has(eventId),
      toggle,
      refresh: load,
    }),
    [remindedIds, reminders, isLoading, pendingIds, toggle, load],
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders(): RemindersValue {
  const context = useContext(RemindersContext);
  if (!context) throw new Error("useReminders must be used inside <RemindersProvider>");
  return context;
}
