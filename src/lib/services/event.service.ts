import "server-only";

import { ApiError } from "@/lib/api/errors";
import { prisma } from "@/lib/db/prisma";
import { fromISTFormValues } from "@/lib/format";
import { type EventDTO, toEventDTO } from "@/lib/dto";
import type { CreateEventInput, UpdateEventInput } from "@/lib/validators/event";
import type { Category } from "@/generated/prisma/enums";

/**
 * Event data access. All SQL lives behind these functions - route handlers and
 * UI components never touch Prisma directly.
 */

export type EventFilters = {
  category?: Category;
  city?: string;
  q?: string;
  page: number;
  pageSize: number;
};

/**
 * The visitor query: active events in the future, combined filters ANDed
 * together. `category` is an equality on the enum, `city` is an equality and
 * `q` is a case-insensitive substring match on title OR description.
 */
type EventWhere = {
  isActive: boolean;
  eventDate: { gt: Date };
  category?: Category;
  city?: string;
  OR?: Array<{
    title?: { contains: string; mode: "insensitive" };
    description?: { contains: string; mode: "insensitive" };
  }>;
};

function buildVisitorWhere(filters: Pick<EventFilters, "category" | "city" | "q">): EventWhere {
  const where: EventWhere = {
    isActive: true,
    eventDate: { gt: new Date() },
  };
  if (filters.category) where.category = filters.category;
  if (filters.city) where.city = filters.city;
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  return where;
}

export async function listUpcomingEvents(
  filters: EventFilters,
): Promise<{ events: EventDTO[]; total: number }> {
  const where = buildVisitorWhere(filters);

  // One round trip: count for pagination + the page itself.
  const [total, rows] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: [{ eventDate: "asc" }, { id: "asc" }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
  ]);

  return { events: rows.map(toEventDTO), total };
}

/** Distinct cities that currently have an upcoming active event (for the filter). */
export async function listAvailableCities(): Promise<string[]> {
  const rows = await prisma.event.findMany({
    where: { isActive: true, eventDate: { gt: new Date() } },
    distinct: ["city"],
    select: { city: true },
    orderBy: { city: "asc" },
  });
  return rows.map((row) => row.city);
}

export async function findEventById(id: string): Promise<EventDTO | null> {
  const event = await prisma.event.findUnique({ where: { id } });
  return event ? toEventDTO(event) : null;
}

export async function listEventsForAdmin(): Promise<{
  events: EventDTO[];
  total: number;
  active: number;
  inactive: number;
}> {
  const [rows, active] = await Promise.all([
    prisma.event.findMany({ orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }] }),
    prisma.event.count({ where: { isActive: true } }),
  ]);

  return {
    events: rows.map(toEventDTO),
    total: rows.length,
    active,
    inactive: rows.length - active,
  };
}

export async function createEvent(input: CreateEventInput): Promise<EventDTO> {
  const event = await prisma.event.create({
    data: {
      title: input.title,
      category: input.category,
      city: input.city,
      eventDate: fromISTFormValues(input.date, input.time),
      price: input.price,
      description: input.description,
      imageUrl: input.imageUrl,
      isActive: input.isActive ?? true,
    },
  });
  return toEventDTO(event);
}

export async function updateEvent(id: string, input: UpdateEventInput): Promise<EventDTO> {
  const existing = await prisma.event.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw ApiError.notFound("That event no longer exists");

  const data: {
    title?: string;
    category?: Category;
    city?: string;
    eventDate?: Date;
    price?: number;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  } = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.category !== undefined) data.category = input.category;
  if (input.city !== undefined) data.city = input.city;
  if (input.price !== undefined) data.price = input.price;
  if (input.description !== undefined) data.description = input.description;
  if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.date !== undefined && input.time !== undefined) {
    data.eventDate = fromISTFormValues(input.date, input.time);
  }

  const event = await prisma.event.update({ where: { id }, data });
  return toEventDTO(event);
}
