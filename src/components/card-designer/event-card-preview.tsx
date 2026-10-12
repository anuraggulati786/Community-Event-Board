"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";

import { CARD_THEME_META, CATEGORY_LABELS, type CardThemeValue } from "@/lib/constants";
import { formatEventDateShort, formatPrice } from "@/lib/format";
import type { EventDTO } from "@/lib/dto";
import { cn } from "@/lib/utils";

/**
 * The live preview. The theme crossfades and stickers pop in with a spring, so
 * every change is visible immediately without being flashy.
 */
export function EventCardPreview({
  event,
  theme,
  stickers,
  className,
}: {
  event: EventDTO;
  theme: CardThemeValue;
  stickers: string[];
  className?: string;
}) {
  const meta = CARD_THEME_META[theme];

  return (
    <motion.div
      layout
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-white/15 p-6 shadow-card-hover sm:p-7",
        "aspect-[4/5] max-w-sm",
        className,
      )}
    >
      {/* Theme layers crossfade instead of snapping. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={theme}
          className={cn("absolute inset-0 -z-10", meta.surfaceClass)}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>

      <div className="flex h-full flex-col justify-between text-white">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
            {CATEGORY_LABELS[event.category]}
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            {formatPrice(event.price)}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          <motion.h3
            layout
            className="font-display text-2xl font-bold leading-tight tracking-tight drop-shadow-sm sm:text-[1.75rem]"
          >
            {event.title}
          </motion.h3>
          <div className="flex flex-col gap-1 text-sm text-white/85">
            <span>{formatEventDateShort(event.eventDate)}</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.city}
            </span>
          </div>
        </div>

        <div className="mt-6 flex min-h-[3.5rem] items-end gap-2">
          <AnimatePresence mode="popLayout">
            {stickers.map((sticker) => (
              <motion.span
                key={sticker}
                layout
                initial={{ scale: 0, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-xl shadow-sm backdrop-blur"
                aria-hidden
              >
                {sticker}
              </motion.span>
            ))}
          </AnimatePresence>
          {stickers.length === 0 ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white/70"
            >
              Add up to 3 stickers to personalise this card.
            </motion.p>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
