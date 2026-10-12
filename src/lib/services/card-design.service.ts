import "server-only";

import { ApiError } from "@/lib/api/errors";
import { prisma } from "@/lib/db/prisma";
import { type CardDesignDTO, toCardDesignDTO } from "@/lib/dto";
import type { CardTheme } from "@/generated/prisma/enums";

/** One saved card design per user + event (enforced by a unique constraint). */

const DEFAULT_THEME: CardTheme = "PURPLE_MUSIC";

/**
 * Returns the saved design, or the defaults with `saved: false` when the user
 * has not designed a card for this event yet. Returning defaults instead of a
 * 404 keeps the client (and a future mobile app) to a single code path.
 */
export async function getCardDesign(userId: string, eventId: string): Promise<CardDesignDTO> {
  const design = await prisma.cardDesign.findUnique({
    where: { userId_eventId: { userId, eventId } },
    select: { eventId: true, theme: true, stickers: true, updatedAt: true },
  });

  if (!design) {
    return { eventId, theme: DEFAULT_THEME, stickers: [], saved: false, updatedAt: null };
  }
  return toCardDesignDTO(design);
}

export async function saveCardDesign(
  userId: string,
  eventId: string,
  theme: CardTheme,
  stickers: string[],
): Promise<CardDesignDTO> {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) throw ApiError.notFound("That event no longer exists");

  const design = await prisma.cardDesign.upsert({
    where: { userId_eventId: { userId, eventId } },
    create: { userId, eventId, theme, stickers },
    update: { theme, stickers },
    select: { eventId: true, theme: true, stickers: true, updatedAt: true },
  });

  return toCardDesignDTO(design);
}
