import { ApiError } from "@/lib/api/errors";
import { ok, route } from "@/lib/api/http";
import { getAdminSession } from "@/lib/auth/session";
import { findEventById } from "@/lib/services/event.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/[id]
 *
 * Visitors only reach events that the listing would show them - active and
 * upcoming. Anything else is a 404 for them, but stays available to a signed-in
 * admin, which is what the admin edit form relies on.
 */
export const GET = route<{ id: string }>(async (_request, context) => {
  const { id } = await context.params;

  const event = await findEventById(id);
  if (!event) throw ApiError.notFound("We could not find that event");

  const isUpcoming = new Date(event.eventDate).getTime() > Date.now();
  if (!event.isActive || !isUpcoming) {
    const admin = await getAdminSession();
    if (!admin) throw ApiError.notFound("We could not find that event");
  }

  return ok(event);
});
