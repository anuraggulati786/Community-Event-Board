import "server-only";

import { ApiError } from "@/lib/api/errors";
import { isStaleSessionError, staleSessionError } from "@/lib/db/errors";
import { prisma } from "@/lib/db/prisma";
import { type ReminderDTO, toReminderDTO } from "@/lib/dto";

/** Reminders are per user + event; the unique constraint makes the button idempotent. */

const upcomingEventSelect = {
  include: {
    event: {
      select: {
        id: true,
        title: true,
        category: true,
        city: true,
        eventDate: true,
        price: true,
        description: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    },
  },
} as const;

/** Upcoming, still-active reminders for the "My reminders" list. */
export async function listUpcomingReminders(userId: string): Promise<ReminderDTO[]> {
  const reminders = await prisma.reminder.findMany({
    where: {
      userId,
      event: { isActive: true, eventDate: { gt: new Date() } },
    },
    orderBy: { event: { eventDate: "asc" } },
    ...upcomingEventSelect,
  });

  return reminders.map(toReminderDTO);
}

/** Just the ids - used to hydrate the "Remind me" button state on the events list. */
export async function listRemindedEventIds(userId: string): Promise<string[]> {
  const reminders = await prisma.reminder.findMany({
    where: { userId, event: { isActive: true, eventDate: { gt: new Date() } } },
    select: { eventId: true },
  });
  return reminders.map((reminder) => reminder.eventId);
}

export async function addReminder(
  userId: string,
  eventId: string,
): Promise<{ reminder: ReminderDTO; created: boolean }> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, isActive: true, eventDate: true },
  });

  if (!event || !event.isActive || event.eventDate.getTime() <= Date.now()) {
    throw ApiError.notFound("That event is no longer available");
  }

  const existing = await prisma.reminder.findUnique({
    where: { userId_eventId: { userId, eventId } },
    select: { id: true },
  });

  if (existing) {
    const reminder = await prisma.reminder.findUniqueOrThrow({
      where: { id: existing.id },
      ...upcomingEventSelect,
    });
    return { reminder: toReminderDTO(reminder), created: false };
  }

  try {
    const reminder = await prisma.reminder.create({
      data: { userId, eventId },
      ...upcomingEventSelect,
    });
    return { reminder: toReminderDTO(reminder), created: true };
  } catch (error) {
    // The account was deleted while the token was still valid.
    if (isStaleSessionError(error)) throw staleSessionError();
    throw error;
  }
}

export async function removeReminder(userId: string, eventId: string): Promise<boolean> {
  const result = await prisma.reminder.deleteMany({ where: { userId, eventId } });
  return result.count > 0;
}
