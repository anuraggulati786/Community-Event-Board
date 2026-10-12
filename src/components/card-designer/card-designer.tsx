"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";

import { EventCardPreview } from "@/components/card-designer/event-card-preview";
import { StickerPicker } from "@/components/card-designer/sticker-picker";
import { ThemePicker } from "@/components/card-designer/theme-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { useSession } from "@/hooks/use-session";
import { apiPost, errorMessage } from "@/lib/api/client";
import { MAX_STICKERS, type CardThemeValue } from "@/lib/constants";
import type { CardDesignDTO, EventDTO } from "@/lib/dto";

const DEFAULT_THEME: CardThemeValue = "PURPLE_MUSIC";

type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * "Design Your Card".
 *
 * The theme + stickers update the preview instantly and are saved per user and
 * event. Saves are debounced, and a failed save is reported instead of being
 * silently swallowed, so a refresh always reflects what was really stored.
 */
export function CardDesigner({ event }: { event: EventDTO }) {
  const { user, isLoading: sessionLoading } = useSession();

  const { data, isLoading, refetch } = useApi<CardDesignDTO>(
    user ? `/api/card-design/${event.id}` : null,
  );

  const [theme, setTheme] = useState<CardThemeValue>(DEFAULT_THEME);
  const [stickers, setStickers] = useState<string[]>([]);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  // The last payload the server confirmed - used to skip no-op saves.
  const persisted = useRef<string>(JSON.stringify({ theme: DEFAULT_THEME, stickers: [] }));
  const hydrated = useRef(false);

  useEffect(() => {
    if (!data || hydrated.current) return;
    setTheme(data.theme);
    setStickers(data.stickers.slice(0, MAX_STICKERS));
    persisted.current = JSON.stringify({ theme: data.theme, stickers: data.stickers });
    hydrated.current = true;
    setStatus(data.saved ? "saved" : "idle");
  }, [data]);

  // Debounced autosave whenever the design changes.
  useEffect(() => {
    if (!user || !hydrated.current) return;
    const payload = JSON.stringify({ theme, stickers });
    if (payload === persisted.current) return;

    setStatus("saving");
    setErrorText(null);

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const response = await apiPost<CardDesignDTO>("/api/card-design", {
            eventId: event.id,
            theme,
            stickers,
          });
          persisted.current = JSON.stringify({
            theme: response.data.theme,
            stickers: response.data.stickers,
          });
          setStatus("saved");
        } catch (caught) {
          setStatus("error");
          setErrorText(errorMessage(caught));
          toast.error("We could not save your card design.", {
            description: "Your changes are still on screen - try saving again.",
          });
        }
      })();
    }, 650);

    return () => clearTimeout(timer);
  }, [theme, stickers, user, event.id]);

  function retrySave() {
    if (!user) return;
    setStatus("saving");
    setErrorText(null);
    void (async () => {
      try {
        const response = await apiPost<CardDesignDTO>("/api/card-design", {
          eventId: event.id,
          theme,
          stickers,
        });
        persisted.current = JSON.stringify({
          theme: response.data.theme,
          stickers: response.data.stickers,
        });
        setStatus("saved");
      } catch (caught) {
        setStatus("error");
        setErrorText(errorMessage(caught));
      }
    })();
  }

  const loadingDesign = Boolean(user) && isLoading;
  const controlsDisabled = loadingDesign || sessionLoading;

  return (
    <section
      aria-labelledby="card-designer-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-7"
    >
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="card-designer-title"
            className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight"
          >
            <Palette className="h-5 w-5 text-primary" />
            Design Your Card
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a theme and add up to {MAX_STICKERS} stickers. Changes save automatically.
          </p>
        </div>
        <SaveIndicator status={status} errorText={errorText} signedIn={Boolean(user)} onRetry={retrySave} />
      </header>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="flex justify-center lg:justify-start">
          {loadingDesign ? (
            <Skeleton className="aspect-[4/5] w-full max-w-sm rounded-2xl" />
          ) : (
            <EventCardPreview event={event} theme={theme} stickers={stickers} className="w-full" />
          )}
        </div>

        <div className="space-y-7">
          <ThemePicker value={theme} onChange={setTheme} disabled={controlsDisabled} />
          <StickerPicker stickers={stickers} onChange={setStickers} disabled={controlsDisabled} />

          {!user && !sessionLoading ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-secondary/40 p-4">
              <p className="text-sm text-muted-foreground">
                Sign in to save this design to your account.
              </p>
              <Button size="sm" asChild>
                <Link href={`/login?next=${encodeURIComponent(`/events/${event.id}`)}`}>
                  Sign in to save
                </Link>
              </Button>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Could not save your design.</p>
                <p className="text-destructive/90">{errorText}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={retrySave}
                >
                  Try again
                </Button>
              </div>
            </div>
          ) : null}

          {!data?.saved && user && !loadingDesign && status === "idle" ? (
            <p className="text-xs text-muted-foreground">
              Nothing saved yet for this event — your first change will be stored right away.
            </p>
          ) : null}

          {status === "idle" && !user ? (
            <Button variant="ghost" size="sm" className="px-0" onClick={refetch}>
              Refresh saved design
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SaveIndicator({
  status,
  errorText,
  signedIn,
  onRetry,
}: {
  status: SaveStatus;
  errorText: string | null;
  signedIn: boolean;
  onRetry: () => void;
}) {
  if (!signedIn) {
    return <span className="text-xs text-muted-foreground">Preview mode — not saved</span>;
  }

  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600" aria-live="polite">
        <Check className="h-3.5 w-3.5" />
        Saved to your account
      </span>
    );
  }

  if (status === "error") {
    return (
      <button
        type="button"
        onClick={onRetry}
        title={errorText ?? undefined}
        className="inline-flex items-center gap-2 text-xs font-medium text-destructive underline-offset-4 hover:underline"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Save failed — retry
      </button>
    );
  }

  return <span className="text-xs text-muted-foreground">Changes save automatically</span>;
}
