import { ok, route } from "@/lib/api/http";
import { readJsonBody } from "@/lib/api/request";
import { startUserSession } from "@/lib/auth/session";
import { authenticateUser } from "@/lib/services/auth.service";
import { loginSchema } from "@/lib/validators/auth";

/** POST /api/auth/login - verify credentials and return a JWT. */
export const POST = route(async (request) => {
  const body = loginSchema.parse(await readJsonBody(request));
  const user = await authenticateUser(body.email, body.password);
  const token = await startUserSession(user.id, user.email);
  return ok({ user, token });
});
