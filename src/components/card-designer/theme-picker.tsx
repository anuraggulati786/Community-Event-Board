"use client";

import { Check } from "lucide-react";

import { CARD_THEMES, CARD_THEME_META, type CardThemeValue } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Exactly three themes, per the brief. */
export function ThemePicker({
  value,
  onChange,
  disabled,
}: {
  value: CardThemeValue;
  onChange: (theme: CardThemeValue) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-sm font-medium text-foreground">Background theme</legend>
      <div className="flex flex-wrap gap-3">
        {CARD_THEMES.map((theme) => {
          const meta = CARD_THEME_META[theme];
          const selected = value === theme;
          return (
            <button
              key={theme}
              type="button"
              onClick={() => onChange(theme)}
              aria-pressed={selected}
              className={cn(
                "group flex items-center gap-3 rounded-xl border p-2 pr-4 text-left transition-all",
                selected
                  ? "border-primary bg-accent shadow-sm"
                  : "border-border bg-card hover:border-primary/40",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg shadow-inner",
                  meta.swatchClass,
                )}
              >
                {selected ? <Check className="h-4 w-4 text-white" /> : null}
              </span>
              <span className="text-sm font-medium">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
