import { IST_TIME_ZONE } from "@/lib/constants";

/**
 * All user-facing formatting lives here so the web UI and any future mobile
 * client render prices and dates identically.
 */

const numberFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** 150000 -> "₹1,50,000" (Indian digit grouping). */
export function formatPrice(price: number): string {
  if (!Number.isFinite(price)) return "—";
  if (price <= 0) return "Free";
  return numberFormatter.format(price);
}

const IST_DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TIME_ZONE,
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const IST_DATE_ONLY = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TIME_ZONE,
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function toParts(date: Date) {
  return Object.fromEntries(
    IST_DATE_TIME.formatToParts(date).map((part) => [part.type, part.value]),
  ) as Record<string, string>;
}

/** "Sat, 18 Oct, 6:30 PM" - 12-hour clock with no leading zero on the hour. */
export function formatEventDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Date to be announced";
  const parts = toParts(date);
  const period = (parts.dayPeriod ?? "").toUpperCase();
  const hour = parts.hour.replace(/^0/, "");
  return `${parts.weekday}, ${parts.day} ${parts.month}, ${hour}:${parts.minute} ${period}`;
}

/** "Sat, 18 Oct 2026" - used inside the card designer preview. */
export function formatEventDateShort(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "TBA";
  return IST_DATE_ONLY.format(date);
}

/** "in 3 days" / "tomorrow" / "today" - a light relative hint next to dates. */
export function formatRelativeToToday(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const dayKey = (input: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: IST_TIME_ZONE }).format(input);
  const start = new Date(`${dayKey(new Date())}T00:00:00${"+05:30"}`);
  const target = new Date(`${dayKey(date)}T00:00:00${"+05:30"}`);
  const days = Math.round((target.getTime() - start.getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1 && days < 30) return `In ${days} days`;
  if (days < 0) return "Past event";
  return "";
}

/** Splits an instant into the `YYYY-MM-DD` / `HH:mm` pair the admin form edits. */
export function toISTFormValues(value: string | Date): { date: string; time: string } {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: IST_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${hour}:${parts.minute}` };
}

/** Combines an IST date + time from the admin form into a UTC instant. */
export function fromISTFormValues(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${"+05:30"}`);
}
