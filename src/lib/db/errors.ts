import { ApiError } from "@/lib/api/errors";

/**
 * Prisma reports known failures with a `P####` code. The two below matter here
 * because a JWT can outlive the user row it points at: after a database reset,
 * a deleted account or an environment switch the signature is still valid but
 * the user no longer exists.
 *
 *   P2003 - foreign key constraint failed (reminders/card_designs -> users)
 *   P2025 - record to update not found (user.update)
 *
 * Both are translated into a 401 so the client is told to sign in again instead
 * of receiving an opaque 500.
 */
export function prismaErrorCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === "string" && /^P\d{4}$/.test(code)) return code;
  }
  return null;
}

export function isStaleSessionError(error: unknown): boolean {
  const code = prismaErrorCode(error);
  return code === "P2003" || code === "P2025";
}

export function staleSessionError(): ApiError {
  return ApiError.unauthorized("Your session is no longer valid. Please sign in again.");
}
