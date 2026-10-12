/** Domain constants shared by the UI, the API layer and the seed script. */

import type { Category } from "@/generated/prisma/enums";

export const CATEGORIES = ["MUSIC", "WORKSHOP", "FOOD", "SPORTS", "KIDS"] as const;

export const CATEGORY_LABELS: Record<Category, string> = {
  MUSIC: "Music",
  WORKSHOP: "Workshop",
  FOOD: "Food",
  SPORTS: "Sports",
  KIDS: "Kids",
};

/** Tailwind classes per category, so badges look consistent everywhere. */
export const CATEGORY_STYLES: Record<Category, string> = {
  MUSIC: "bg-violet-100 text-violet-700 border-violet-200",
  WORKSHOP: "bg-sky-100 text-sky-700 border-sky-200",
  FOOD: "bg-amber-100 text-amber-700 border-amber-200",
  SPORTS: "bg-emerald-100 text-emerald-700 border-emerald-200",
  KIDS: "bg-pink-100 text-pink-700 border-pink-200",
};

export const CATEGORY_GRADIENTS: Record<Category, string> = {
  MUSIC: "from-violet-500 to-fuchsia-500",
  WORKSHOP: "from-sky-500 to-indigo-500",
  FOOD: "from-amber-500 to-orange-500",
  SPORTS: "from-emerald-500 to-lime-500",
  KIDS: "from-pink-500 to-rose-500",
};

export const CARD_THEMES = ["PURPLE_MUSIC", "GREEN_SPORTS", "DARK_MODERN"] as const;

export type CardThemeValue = (typeof CARD_THEMES)[number];

export const CARD_THEME_META: Record<
  CardThemeValue,
  { label: string; swatchClass: string; surfaceClass: string; textClass: string }
> = {
  PURPLE_MUSIC: {
    label: "Purple Music",
    swatchClass: "bg-gradient-to-br from-violet-700 to-fuchsia-500",
    surfaceClass: "card-theme-purple-music",
    textClass: "text-white",
  },
  GREEN_SPORTS: {
    label: "Green Sports",
    swatchClass: "bg-gradient-to-br from-emerald-800 to-lime-400",
    surfaceClass: "card-theme-green-sports",
    textClass: "text-white",
  },
  DARK_MODERN: {
    label: "Dark Modern",
    swatchClass: "bg-gradient-to-br from-slate-900 to-slate-600",
    surfaceClass: "card-theme-dark-modern",
    textClass: "text-white",
  },
};

export const STICKERS = ["🎵", "🍔", "⚽", "🎉", "🎨"] as const;

export const MAX_STICKERS = 3;

/** Seeded cities, used to pre-fill the admin form and as filter hints. */
export const CITIES = [
  "Mumbai",
  "Pune",
  "Bangalore",
  "Chennai",
  "Coimbatore",
  "Delhi",
] as const;

export const EVENTS_PAGE_SIZE = 6;

/** All event times are authored and displayed in Indian Standard Time. */
export const IST_TIME_ZONE = "Asia/Kolkata";
export const IST_UTC_OFFSET = "+05:30";

export const USER_COOKIE = "ceb_session";
export const ADMIN_COOKIE = "ceb_admin";
