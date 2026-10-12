import { ApiError } from "@/lib/api/errors";
import { ok, route } from "@/lib/api/http";
import { getAdminSession } from "@/lib/auth/session";
import { findEventById } from "@/lib/services/event.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/[id]
 *
 * Inactive events are hidden from visitors (404) but stay visible to a signed-in
 * admin so the same endpoint can pre-fill the admin edit form.
 */
export const GET = route<{ id: string }>(async (_request, context) => {
  const { id } = await context.params;

  const event = await findEventById(id);
  if (!event) throw ApiError.notFound("We could not find that event");

  if (!event.isActive) {
    const admin = await getAdminSession();
    if (!admin) throw ApiError.notFound("We could not find that event");
  }

  return ok(event);
});
