import "server-only";

import { prisma } from "@/lib/db/prisma";
import { type EventDTO, toEventDTO } from "@/lib/dto";
import type { Category } from "@/generated/prisma/enums";

/** "My Feed": upcoming active events whose category is one of the user's picks. */

type FeedWhere = {
  isActive: boolean;
  eventDate: { gt: Date };
  category: { in: Category[] };
};

export async function getFeedForUser(
  userId: string,
  page: number,
  pageSize: number,
): Promise<{ events: EventDTO[]; total: number; favoriteCategories: Category[] }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { favoriteCategories: true },
  });
  if (!user) {
    return { events: [], total: 0, favoriteCategories: [] };
  }

  const favoriteCategories = user.favoriteCategories;
  if (favoriteCategories.length === 0) {
    // No interests picked yet - nothing to show, and the UI renders the
    // "No events available for your selected interests." empty state.
    return { events: [], total: 0, favoriteCategories };
  }

  const where: FeedWhere = {
    isActive: true,
    eventDate: { gt: new Date() },
    category: { in: favoriteCategories },
  };

  const [total, rows] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: [{ eventDate: "asc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { events: rows.map(toEventDTO), total, favoriteCategories };
}
