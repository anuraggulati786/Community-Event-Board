import { SignJWT, jwtVerify } from "jose";

import { ADMIN_COOKIE, USER_COOKIE } from "@/lib/constants";

/**
 * JWT helpers built on `jose` so the exact same code runs in the Node.js
 * runtime (route handlers) and in the Edge runtime (middleware).
 *
 * Visitors and admins are signed with different secrets and different
 * audiences, so a visitor token can never be replayed as an admin token.
 */

export type TokenRole = "user" | "admin";

export type SessionPayload = {
  sub: string;
  email: string;
  role: TokenRole;
};

const ISSUER = "community-events-board";
export const USER_AUDIENCE = "ceb:user";
export const ADMIN_AUDIENCE = "ceb:admin";

export const COOKIE_NAMES = { user: USER_COOKIE, admin: ADMIN_COOKIE } as const;

function secretKey(secret: string | undefined, envName: string): Uint8Array {
  if (!secret || secret.length < 16) {
    throw new Error(
      `${envName} is missing or too short. Copy .env.example to .env and set a long random value.`,
    );
  }
  return new TextEncoder().encode(secret);
}

function userSecret() {
  return secretKey(process.env.JWT_SECRET, "JWT_SECRET");
}

function adminSecret() {
  return secretKey(process.env.ADMIN_JWT_SECRET, "ADMIN_JWT_SECRET");
}

export function sessionTtlSeconds(): number {
  const parsed = Number.parseInt(process.env.SESSION_TTL_SECONDS ?? "604800", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 604800;
}

async function sign(
  payload: SessionPayload,
  secret: Uint8Array,
  audience: string,
): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${sessionTtlSeconds()}s`)
    .sign(secret);
}

async function verify(
  token: string | undefined | null,
  secret: Uint8Array,
  audience: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience,
      algorithms: ["HS256"],
    });
    if (!payload.sub || typeof payload.email !== "string") return null;
    const role = payload.role === "admin" ? "admin" : "user";
    return { sub: payload.sub, email: payload.email, role };
  } catch {
    // Expired, tampered with or signed with another secret: treat as signed out.
    return null;
  }
}

export async function signUserToken(userId: string, email: string): Promise<string> {
  return sign({ sub: userId, email, role: "user" }, userSecret(), USER_AUDIENCE);
}

export async function verifyUserToken(token?: string | null): Promise<SessionPayload | null> {
  try {
    return await verify(token, userSecret(), USER_AUDIENCE);
  } catch {
    return null;
  }
}

export async function signAdminToken(email: string): Promise<string> {
  return sign({ sub: "admin", email, role: "admin" }, adminSecret(), ADMIN_AUDIENCE);
}

export async function verifyAdminToken(token?: string | null): Promise<SessionPayload | null> {
  try {
    return await verify(token, adminSecret(), ADMIN_AUDIENCE);
  } catch {
    return null;
  }
}
