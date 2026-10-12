import { compare, hash } from "bcryptjs";

/**
 * Passwords are only ever stored as a bcrypt hash - never encrypted, never
 * logged. `bcryptjs` is a pure-JavaScript implementation of the same bcrypt
 * algorithm, which keeps the build free of native compilation steps.
 */

// 10 rounds is the usual production trade-off (~50-100ms per hash on modern hardware).
const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, passwordHash: string): Promise<boolean> {
  try {
    return await compare(plain, passwordHash);
  } catch {
    return false;
  }
}
