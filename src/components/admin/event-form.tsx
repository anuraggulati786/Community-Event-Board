"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { EventImage } from "@/components/events/event-image";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError, apiPatch, apiPost, errorMessage } from "@/lib/api/client";
import { CATEGORIES, CATEGORY_LABELS, CITIES } from "@/lib/constants";
import { formatPrice, toISTFormValues } from "@/lib/format";
import type { EventDTO } from "@/lib/dto";
import type { Category } from "@/generated/prisma/enums";

type FormState = {
  title: string;
  category: Category;
  city: string;
  date: string;
  time: string;
  price: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  category: "MUSIC",
  city: "Mumbai",
  date: "",
  time: "18:30",
  price: "0",
  description: "",
  imageUrl: "",
  isActive: true,
};

/**
 * One form for creating and editing. The server validates every field again -
 * the errors shown here come straight from the API response.
 */
export function EventForm({ event }: { event?: EventDTO }) {
  const router = useRouter();
  const isEdit = Boolean(event);

  const [form, setForm] = useState<FormState>(() => {
    if (!event) return EMPTY_FORM;
    // The admin always edits the IST date + time that visitors see.
    const { date, time } = toISTFormValues(event.eventDate);
    return {
      title: event.title,
      category: event.category,
      city: event.city,
      date,
      time,
      price: String(event.price),
      description: event.description,
      imageUrl: event.imageUrl,
      isActive: event.isActive,
    };
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(submitEvent: React.FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    const payload = {
      title: form.title,
      category: form.category,
      city: form.city,
      date: form.date,
      time: form.time,
      price: form.price,
      description: form.description,
      imageUrl: form.imageUrl,
      isActive: form.isActive,
    };

    try {
      if (isEdit && event) {
        await apiPatch<EventDTO>(`/api/admin/events/${event.id}`, payload);
        toast.success("Event updated", { description: form.title });
      } else {
        await apiPost<EventDTO>("/api/admin/events", payload);
        toast.success("Event created", { description: form.title });
      }
      router.push("/admin/events");
      router.refresh();
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setFieldErrors(caught.fieldErrors);
        if (caught.status !== 400) setFormError(caught.message);
      } else {
        setFormError(errorMessage(caught));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const priceNumber = Number.parseInt(form.price || "0", 10);
  const previewPrice = Number.isFinite(priceNumber) ? priceNumber : 0;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]" noValidate>
      <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-card sm:p-6">
        {formError ? (
          <Alert className="border-destructive/25 bg-destructive/5 text-destructive">
            {formError}
          </Alert>
        ) : null}

        <Field label="Title" htmlFor="title" error={fieldErrors.title}>
          <Input
            id="title"
            value={form.title}
            onChange={(changeEvent) => update("title", changeEvent.target.value)}
            placeholder="Neon Nights: Indie Music Fest"
            required
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category" htmlFor="category" error={fieldErrors.category}>
            <Select
              value={form.category}
              onValueChange={(value) => update("category", value as Category)}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="City" htmlFor="city" error={fieldErrors.city}>
            <Input
              id="city"
              list="city-options"
              value={form.city}
              onChange={(changeEvent) => update("city", changeEvent.target.value)}
              placeholder="Coimbatore"
              required
            />
            <datalist id="city-options">
              {CITIES.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Date" htmlFor="date" error={fieldErrors.date}>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(changeEvent) => update("date", changeEvent.target.value)}
              required
            />
          </Field>

          <Field label="Time (IST)" htmlFor="time" error={fieldErrors.time}>
            <Input
              id="time"
              type="time"
              value={form.time}
              onChange={(changeEvent) => update("time", changeEvent.target.value)}
              required
            />
          </Field>

          <Field
            label="Price (₹)"
            htmlFor="price"
            error={fieldErrors.price}
            hint={`Shown as ${formatPrice(previewPrice)}`}
          >
            <Input
              id="price"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={form.price}
              onChange={(changeEvent) => update("price", changeEvent.target.value)}
              required
            />
          </Field>
        </div>

        <Field label="Description" htmlFor="description" error={fieldErrors.description}>
          <Textarea
            id="description"
            value={form.description}
            onChange={(changeEvent) => update("description", changeEvent.target.value)}
            placeholder="What should visitors know about this event?"
            required
          />
        </Field>

        <Field label="Image URL" htmlFor="imageUrl" error={fieldErrors.imageUrl}>
          <Input
            id="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={(changeEvent) => update("imageUrl", changeEvent.target.value)}
            placeholder="https://example.com/event.jpg"
            required
          />
        </Field>

        <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-4">
          <input
            id="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={(changeEvent) => update("isActive", changeEvent.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div>
            <Label htmlFor="isActive">Active</Label>
            <p className="text-xs text-muted-foreground">
              Inactive events stay in the database but are hidden from visitors. Events are never
              deleted.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Publish event"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/admin/events")}>
            Cancel
          </Button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display text-sm font-semibold">Preview</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            How the image and price will look on the site.
          </p>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <EventImage
              src={form.imageUrl}
              alt={form.title || "Event image preview"}
              category={form.category}
              className="h-36 w-full"
            />
          </div>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium">{CATEGORY_LABELS[form.category]}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">City</dt>
              <dd className="font-medium">{form.city || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Price</dt>
              <dd className="font-medium">{formatPrice(previewPrice)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{form.isActive ? "Active" : "Inactive"}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
