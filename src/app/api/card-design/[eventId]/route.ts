import { ok, route } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/session";
import { getCardDesign } from "@/lib/services/card-design.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/card-design/[eventId]
 * Returns the saved theme + stickers for this user and event, or the defaults
 * with `saved: false` when they have not designed a card yet.
 */
export const GET = route<{ eventId: string }>(async (_request, context) => {
  const session = await requireUser();
  const { eventId } = await context.params;
  const design = await getCardDesign(session.sub, eventId);
  return ok(design);
});
