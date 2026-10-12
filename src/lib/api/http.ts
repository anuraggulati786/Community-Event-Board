import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError } from "@/lib/api/errors";

/**
 * One response envelope for the whole API:
 *
 *   success -> { "data": ..., "meta"?: ... }
 *   failure -> { "error": { "message", "code", "details"? } }
 *
 * The envelope, status codes and cookie/Bearer auth are all the mobile client
 * needs to reuse this API unchanged.
 */

export type ApiMeta = Record<string, unknown>;

export type ApiSuccessBody<T> = { data: T; meta?: ApiMeta };

export type ApiErrorBody = {
  error: { message: string; code: string; details?: unknown };
};

const NO_STORE = { "Cache-Control": "no-store" };

export function ok<T>(data: T, init?: { status?: number; meta?: ApiMeta }): NextResponse {
  const body: ApiSuccessBody<T> = init?.meta ? { data, meta: init.meta } : { data };
  return NextResponse.json(body, { status: init?.status ?? 200, headers: NO_STORE });
}

export function fail(status: number, message: string, code: string, details?: unknown): NextResponse {
  const body: ApiErrorBody = { error: { message, code, ...(details ? { details } : {}) } };
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export type RouteContext<P extends Record<string, string> = Record<string, never>> = {
  params: Promise<P>;
};

function zodDetails(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "_root",
    message: issue.message,
  }));
}

/**
 * Wraps a route handler so validation errors, ApiErrors and unexpected crashes
 * all produce the same structured JSON shape instead of an HTML error page.
 */
export function route<P extends Record<string, string> = Record<string, never>>(
  handler: (request: NextRequest, context: RouteContext<P>) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context: RouteContext<P>): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.status, error.message, error.code, error.details);
      }
      if (error instanceof ZodError) {
        return fail(400, "Please check the highlighted fields", "VALIDATION_ERROR", zodDetails(error));
      }
      // Unexpected: log server side, stay generic for the client.
      console.error("[api] unhandled error", { url: request.url, method: request.method, error });
      return fail(500, "Something went wrong. Please try again.", "INTERNAL_ERROR");
    }
  };
}
