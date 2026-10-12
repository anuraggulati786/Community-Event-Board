import { ApiError } from "@/lib/api/errors";
import { ok, route } from "@/lib/api/http";
import { readJsonBody } from "@/lib/api/request";
import { startAdminSession } from "@/lib/auth/session";
import { expectedAdminEmail, verifyAdminCredentials } from "@/lib/services/admin.service";
import { adminLoginSchema } from "@/lib/validators/auth";

/** POST /api/admin/login - the only unprotected /api/admin route. */
export const POST = route(async (request) => {
  const body = adminLoginSchema.parse(await readJsonBody(request));

  const valid = await verifyAdminCredentials(body.email, body.password);
  if (!valid) throw ApiError.unauthorized("Incorrect email or password");

  const email = expectedAdminEmail();
  const token = await startAdminSession(email);
  return ok({ admin: { email }, token });
});
