import "server-only";

import { cookies, headers } from "next/headers";

import { ApiError } from "@/lib/api/errors";
import {
  ADMIN_COOKIE,
  IST_UTC_OFFSET,
  USER_COOKIE,
} from "@/lib/constants";
import {
  type SessionPayload,
  sessionTtlSeconds,
  signAdminToken,
  signUserToken,
  verifyAdminToken,
  verifyUserToken,
} from "@/lib/auth/tokens";

/**
 * Session handling. Tokens are stored in httpOnly cookies for the browser and
 * are also accepted as `Authorization: Bearer <token>` so the very same API can
 * be consumed by a mobile app.
 */

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function bearerFromHeader(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim() || null;
}

async function readToken(cookieName: string): Promise<string | null> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(cookieName)?.value;
  if (fromCookie) return fromCookie;
  // Fall back to the Authorization header for API clients (mobile/curl).
  const headerStore = await headers();
  return bearerFromHeader(headerStore.get("authorization"));
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  const token = await readToken(USER_COOKIE);
  const session = await verifyUserToken(token);
  return session?.role === "user" ? session : null;
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const token = await readToken(ADMIN_COOKIE);
  const session = await verifyAdminToken(token);
  return session?.role === "admin" ? session : null;
}

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSessionUser();
  if (!session) throw ApiError.unauthorized();
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) throw ApiError.unauthorized("Admin sign-in required");
  return session;
}

/** Issues the visitor cookie and returns the raw token (login/signup responses). */
export async function startUserSession(userId: string, email: string): Promise<string> {
  const token = await signUserToken(userId, email);
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, token, { ...cookieOptions, maxAge: sessionTtlSeconds() });
  return token;
}

export async function endUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

export async function startAdminSession(email: string): Promise<string> {
  const token = await signAdminToken(email);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, { ...cookieOptions, maxAge: sessionTtlSeconds() });
  return token;
}

export async function endAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

/** Exported so tests/DTOs can show when a session expires. */
export const SESSION_IST_OFFSET = IST_UTC_OFFSET;
