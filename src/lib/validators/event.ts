import { z } from "zod";

import { CATEGORIES } from "@/lib/constants";

export const categorySchema = z.enum(CATEGORIES, "Choose one of the listed categories");

const titleSchema = z
  .string("Title is required")
  .trim()
  .min(3, "Title must be at least 3 characters")
  .max(120, "Title must be 120 characters or fewer");

const citySchema = z
  .string("City is required")
  .trim()
  .min(2, "City must be at least 2 characters")
  .max(60, "City must be 60 characters or fewer");

const dateSchema = z
  .string("Date is required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker or YYYY-MM-DD");

const timeSchema = z
  .string("Time is required")
  .regex(/^\d{2}:\d{2}$/, "Use the time picker or HH:MM");

const priceSchema = z.coerce
  .number("Price must be a number")
  .int("Price must be a whole number of rupees")
  .min(0, "Price cannot be negative")
  .max(10_000_000, "Price looks too large");

const descriptionSchema = z
  .string("Description is required")
  .trim()
  .min(10, "Description must be at least 10 characters")
  .max(2000, "Description must be 2000 characters or fewer");

const imageUrlSchema = z
  .string("Image URL is required")
  .trim()
  .min(1, "Image URL is required")
  .url("Enter a valid image URL (https://...)");

/** The admin form sends date and time separately; the service combines them. */
export const createEventSchema = z.object({
  title: titleSchema,
  category: categorySchema,
  city: citySchema,
  date: dateSchema,
  time: timeSchema,
  price: priceSchema,
  description: descriptionSchema,
  imageUrl: imageUrlSchema,
  isActive: z.boolean().optional().default(true),
});

export const updateEventSchema = createEventSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Send at least one field to update",
);

export const eventListQuerySchema = z.object({
  category: categorySchema.optional(),
  city: z.string().trim().min(1).max(60).optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(6),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventListQuery = z.infer<typeof eventListQuerySchema>;
