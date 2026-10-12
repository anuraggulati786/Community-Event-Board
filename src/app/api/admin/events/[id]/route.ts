import { ok, route } from "@/lib/api/http";
import { readJsonBody } from "@/lib/api/request";
import { requireAdmin } from "@/lib/auth/session";
import { updateEvent } from "@/lib/services/event.service";
import { updateEventSchema } from "@/lib/validators/event";

/**
 * PATCH /api/admin/events/[id]
 *
 * Partial update: the same endpoint powers "Edit event" and the
 * Active/Inactive toggle. Deleting is deliberately not supported.
 */
export const PATCH = route<{ id: string }>(async (request, context) => {
  await requireAdmin();
  const { id } = await context.params;
  const body = updateEventSchema.parse(await readJsonBody(request));
  const event = await updateEvent(id, body);
  return ok(event);
});
