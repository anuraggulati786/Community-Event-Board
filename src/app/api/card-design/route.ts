import { ok, route } from "@/lib/api/http";
import { readJsonBody } from "@/lib/api/request";
import { requireUser } from "@/lib/auth/session";
import { saveCardDesign } from "@/lib/services/card-design.service";
import { cardDesignBodySchema } from "@/lib/validators/user";

/**
 * POST /api/card-design { eventId, theme, stickers }
 * Upserts the design for the signed-in user + event.
 */
export const POST = route(async (request) => {
  const session = await requireUser();
  const body = cardDesignBodySchema.parse(await readJsonBody(request));
  const design = await saveCardDesign(session.sub, body.eventId, body.theme, body.stickers);
  return ok(design);
});
