import { ok, route } from "@/lib/api/http";
import { readJsonBody } from "@/lib/api/request";
import { requireAdmin } from "@/lib/auth/session";
import { createEvent, listEventsForAdmin } from "@/lib/services/event.service";
import { createEventSchema } from "@/lib/validators/event";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/events - every event, active or not, plus the dashboard counts.
 * Protected twice: by middleware and again here on the server.
 */
export const GET = route(async () => {
  await requireAdmin();
  const { events, total, active, inactive } = await listEventsForAdmin();
  return ok(events, { meta: { total, active, inactive } });
});

/** POST /api/admin/events - publish a new event. */
export const POST = route(async (request) => {
  await requireAdmin();
  const body = createEventSchema.parse(await readJsonBody(request));
  const event = await createEvent(body);
  return ok(event, { status: 201 });
});
