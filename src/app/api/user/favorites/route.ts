import { ok, route } from "@/lib/api/http";
import { readJsonBody } from "@/lib/api/request";
import { requireUser } from "@/lib/auth/session";
import { updateFavoriteCategories } from "@/lib/services/auth.service";
import { favoriteCategoriesSchema } from "@/lib/validators/user";

/**
 * POST /api/user/favorites - replace the signed-in user's interests.
 * Used right after the first login ("pick what you like") and whenever the
 * user edits those choices later.
 */
export const POST = route(async (request) => {
  const session = await requireUser();
  const body = favoriteCategoriesSchema.parse(await readJsonBody(request));
  const user = await updateFavoriteCategories(session.sub, body.categories);
  return ok({ user });
});
