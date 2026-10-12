import { ok, route } from "@/lib/api/http";
import { readJsonBody, searchParamsToObject } from "@/lib/api/request";
import { requireUser } from "@/lib/auth/session";
import {
  addReminder,
  listRemindedEventIds,
  listUpcomingReminders,
  removeReminder,
} from "@/lib/services/reminder.service";
import { reminderBodySchema, reminderQuerySchema } from "@/lib/validators/user";

export const dynamic = "force-dynamic";

/**
 * GET /api/reminders - the signed-in user's upcoming reminders.
 * `meta.eventIds` is a flat list the events page uses to render the correct
 * "Remind me" state after a refresh.
 */
export const GET = route(async () => {
  const session = await requireUser();
  const [reminders, eventIds] = await Promise.all([
    listUpcomingReminders(session.sub),
    listRemindedEventIds(session.sub),
  ]);
  return ok(reminders, { meta: { eventIds } });
});

/** POST /api/reminders { eventId } - idempotent: 201 on create, 200 if it existed. */
export const POST = route(async (request) => {
  const session = await requireUser();
  const body = reminderBodySchema.parse(await readJsonBody(request));
  const { reminder, created } = await addReminder(session.sub, body.eventId);
  return ok(reminder, { status: created ? 201 : 200 });
});

/** DELETE /api/reminders?eventId=... - used when the user un-reminds an event. */
export const DELETE = route(async (request) => {
  const session = await requireUser();
  const query = reminderQuerySchema.parse(searchParamsToObject(request.nextUrl.searchParams));
  const removed = await removeReminder(session.sub, query.eventId);
  return ok({ eventId: query.eventId, removed });
});
