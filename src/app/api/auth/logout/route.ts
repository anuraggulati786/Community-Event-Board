import { ok, route } from "@/lib/api/http";
import { endUserSession } from "@/lib/auth/session";

/** POST /api/auth/logout - clear the visitor session cookie. */
export const POST = route(async () => {
  await endUserSession();
  return ok({ signedOut: true });
});
