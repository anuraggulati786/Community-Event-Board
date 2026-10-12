import { ok, route } from "@/lib/api/http";
import { getSessionUser } from "@/lib/auth/session";
import { findUserById } from "@/lib/services/auth.service";

/**
 * GET /api/auth/me - who am I?
 * Returns `null` instead of a 401 so the UI can bootstrap a signed-out state
 * without treating it as an error.
 */
export const GET = route(async () => {
  const session = await getSessionUser();
  if (!session) return ok(null);

  const user = await findUserById(session.sub);
  if (!user) return ok(null);

  return ok({ user });
});
