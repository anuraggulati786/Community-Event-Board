"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

import { MAX_STICKERS, STICKERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Five stickers, tap to add, tap one you already added to remove it.
 * A maximum of three are allowed at a time.
 */
export function StickerPicker({
  stickers,
  onChange,
  disabled,
}: {
  stickers: string[];
  onChange: (stickers: string[]) => void;
  disabled?: boolean;
}) {
  const atLimit = stickers.length >= MAX_STICKERS;

  function toggle(sticker: string) {
    if (stickers.includes(sticker)) {
      onChange(stickers.filter((item) => item !== sticker));
      return;
    }
    if (atLimit) return;
    onChange([...stickers, sticker]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">Stickers</span>
        <span
          className={cn(
            "text-xs",
            atLimit ? "font-medium text-primary" : "text-muted-foreground",
          )}
        >
          {stickers.length}/{MAX_STICKERS} selected
          {atLimit ? " — remove one to swap" : ""}
        </span>
      </div>

      <div role="group" aria-label="Stickers" className="flex flex-wrap gap-2.5">
        {STICKERS.map((sticker) => {
          const selected = stickers.includes(sticker);
          const blocked = atLimit && !selected;
          return (
            <button
              key={sticker}
              type="button"
              aria-pressed={selected}
              aria-label={`${selected ? "Remove" : "Add"} sticker ${sticker}`}
              disabled={disabled || blocked}
              onClick={() => toggle(sticker)}
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-xl border text-xl transition-all",
                selected
                  ? "border-primary bg-accent shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/60",
                (disabled || blocked) && "cursor-not-allowed opacity-50",
              )}
            >
              <motion.span
                whileTap={{ scale: 0.85 }}
                animate={{ scale: selected ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {sticker}
              </motion.span>
              {selected ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <X className="h-3 w-3" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
