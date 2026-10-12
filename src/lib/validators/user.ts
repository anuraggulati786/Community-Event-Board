import { z } from "zod";

import { CATEGORIES, MAX_STICKERS } from "@/lib/constants";
import { categorySchema } from "@/lib/validators/event";

export const favoriteCategoriesSchema = z.object({
  categories: z
    .array(categorySchema)
    .max(CATEGORIES.length, "You can pick at most every category")
    .transform((values) => Array.from(new Set(values))),
});

export const reminderBodySchema = z.object({
  eventId: z.string("Event id is required").trim().min(1, "Event id is required"),
});

export const reminderQuerySchema = z.object({
  eventId: z.string("Event id is required").trim().min(1, "Event id is required"),
});

export const cardDesignBodySchema = z.object({
  eventId: z.string("Event id is required").trim().min(1, "Event id is required"),
  theme: z.enum(["PURPLE_MUSIC", "GREEN_SPORTS", "DARK_MODERN"], "Unknown theme"),
  stickers: z
    .array(z.string().trim().min(1))
    .max(MAX_STICKERS, `You can add up to ${MAX_STICKERS} stickers`)
    .transform((values) => Array.from(new Set(values)).slice(0, MAX_STICKERS)),
});

export type FavoriteCategoriesInput = z.infer<typeof favoriteCategoriesSchema>;
export type CardDesignInput = z.infer<typeof cardDesignBodySchema>;
