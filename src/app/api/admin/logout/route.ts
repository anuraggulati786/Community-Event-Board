import { ok, route } from "@/lib/api/http";
import { endAdminSession } from "@/lib/auth/session";

/** POST /api/admin/logout - clear the admin session cookie. */
export const POST = route(async () => {
  await endAdminSession();
  return ok({ signedOut: true });
});
