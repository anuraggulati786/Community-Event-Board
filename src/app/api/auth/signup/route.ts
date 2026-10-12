import { ok, route } from "@/lib/api/http";
import { readJsonBody } from "@/lib/api/request";
import { startUserSession } from "@/lib/auth/session";
import { registerUser } from "@/lib/services/auth.service";
import { signupSchema } from "@/lib/validators/auth";

/** POST /api/auth/signup - create a visitor account and start a session. */
export const POST = route(async (request) => {
  const body = signupSchema.parse(await readJsonBody(request));
  const user = await registerUser(body.email, body.password);
  // The token is returned in the body (for API/mobile clients) *and* set as an
  // httpOnly cookie (for the browser).
  const token = await startUserSession(user.id, user.email);
  return ok({ user, token }, { status: 201 });
});
