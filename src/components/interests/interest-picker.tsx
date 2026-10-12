"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiClientError, apiPost, errorMessage } from "@/lib/api/client";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import type { UserDTO } from "@/lib/dto";
import { cn } from "@/lib/utils";
import type { Category } from "@/generated/prisma/enums";

/**
 * Interests picker: shown once after the first login and editable later.
 * Choices are saved to the user's account via POST /api/user/favorites.
 */
export function InterestPicker({
  initialCategories,
  onSaved,
  submitLabel = "Save my interests",
  description,
}: {
  initialCategories: Category[];
  onSaved?: (user: UserDTO) => void;
  submitLabel?: string;
  description?: string;
}) {
  const [selected, setSelected] = useState<Category[]>(initialCategories);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-sync when the account changes underneath us.
  useEffect(() => {
    setSelected(initialCategories);
  }, [initialCategories]);

  function toggle(category: Category) {
    setSelected((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const response = await apiPost<{ user: UserDTO }>("/api/user/favorites", {
        categories: selected,
      });
      toast.success("Interests updated", {
        description: selected.length
          ? `Your feed now follows ${selected.map((item) => CATEGORY_LABELS[item]).join(", ")}.`
          : "Pick at least one interest to fill your feed.",
      });
      onSaved?.(response.data.user);
    } catch (caught) {
      const message =
        caught instanceof ApiClientError && caught.status === 401
          ? "Your session expired. Please sign in again."
          : errorMessage(caught);
      setError(message);
      toast.error("We could not save your interests.", { description: message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}

      <div role="group" aria-label="Favourite categories" className="flex flex-wrap gap-2.5">
        {CATEGORIES.map((category) => {
          const active = selected.includes(category);
          return (
            <button
              key={category}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(category)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-foreground hover:border-primary/40",
              )}
            >
              {active ? <Check className="h-4 w-4" /> : null}
              {CATEGORY_LABELS[category]}
            </button>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void save()} disabled={saving || selected.length === 0}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Saving…" : submitLabel}
        </Button>
        <span className="text-xs text-muted-foreground">
          {selected.length === 0
            ? "Select at least one category"
            : `${selected.length} selected`}
        </span>
      </div>
    </div>
  );
}
