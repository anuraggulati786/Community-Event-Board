import "server-only";

import { timingSafeEqual } from "node:crypto";

/**
 * The single admin identity. Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD,
 * defaulting to the hard-coded values from the brief so the app works out of
 * the box. Admins are not rows in the database, so there is nothing to hash.
 */

const DEFAULT_ADMIN_EMAIL = "admin@community.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function expectedAdminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const expectedPassword = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  // Both comparisons always run so the response time does not reveal which
  // half of the pair was wrong.
  const emailMatches = safeEqual(email.trim().toLowerCase(), expectedAdminEmail());
  const passwordMatches = safeEqual(password, expectedPassword);
  return emailMatches && passwordMatches;
}
