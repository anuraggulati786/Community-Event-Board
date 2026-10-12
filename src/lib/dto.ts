import type { Category, CardTheme } from "@/generated/prisma/enums";

/**
 * Data Transfer Objects - the exact JSON shape the API returns.
 *
 * The mappers below take a plain structural record (any Prisma row satisfies
 * them) and convert Dates to ISO strings, so the response is stable JSON and
 * never leaks Prisma internals such as `passwordHash`.
 */

export type EventDTO = {
  id: string;
  title: string;
  category: Category;
  city: string;
  eventDate: string;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserDTO = {
  id: string;
  email: string;
  favoriteCategories: Category[];
  createdAt: string;
};

export type ReminderDTO = {
  id: string;
  eventId: string;
  createdAt: string;
  event: EventDTO;
};

export type CardDesignDTO = {
  eventId: string;
  theme: CardTheme;
  stickers: string[];
  saved: boolean;
  updatedAt: string | null;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type EventRecord = {
  id: string;
  title: string;
  category: Category;
  city: string;
  eventDate: Date;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type UserRecord = {
  id: string;
  email: string;
  favoriteCategories: Category[];
  createdAt: Date;
};

type ReminderRecord = {
  id: string;
  eventId: string;
  createdAt: Date;
  event: EventRecord;
};

type CardDesignRecord = {
  eventId: string;
  theme: CardTheme;
  stickers: string[];
  updatedAt: Date;
};

export function toEventDTO(event: EventRecord): EventDTO {
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    city: event.city,
    eventDate: event.eventDate.toISOString(),
    price: event.price,
    description: event.description,
    imageUrl: event.imageUrl,
    isActive: event.isActive,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

export function toUserDTO(user: UserRecord): UserDTO {
  return {
    id: user.id,
    email: user.email,
    favoriteCategories: user.favoriteCategories,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toReminderDTO(reminder: ReminderRecord): ReminderDTO {
  return {
    id: reminder.id,
    eventId: reminder.eventId,
    createdAt: reminder.createdAt.toISOString(),
    event: toEventDTO(reminder.event),
  };
}

export function toCardDesignDTO(design: CardDesignRecord): CardDesignDTO {
  return {
    eventId: design.eventId,
    theme: design.theme,
    stickers: design.stickers,
    saved: true,
    updatedAt: design.updatedAt.toISOString(),
  };
}

export function paginationMeta(page: number, pageSize: number, total: number): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
