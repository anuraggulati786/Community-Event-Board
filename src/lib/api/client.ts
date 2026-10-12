/**
 * The only way the UI reaches data: fetch a JSON endpoint.
 *
 * Every screen, the admin area and any future mobile client go through this
 * same contract - no component imports Prisma or touches the database.
 */

export type ApiErrorShape = { message: string; code: string; details?: unknown };

export type ApiEnvelope<T> = { data: T; meta?: Record<string, unknown> };

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Field-level messages returned by Zod validation errors. */
  get fieldErrors(): Record<string, string> {
    const details = this.details;
    if (!Array.isArray(details)) return {};
    const result: Record<string, string> = {};
    for (const item of details) {
      if (item && typeof item === "object" && "field" in item && "message" in item) {
        const field = String((item as { field: unknown }).field);
        // Keep the first message per field - the most specific one.
        if (!result[field]) result[field] = String((item as { message: unknown }).message);
      }
    }
    return result;
  }
}

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

async function parse<T>(response: Response): Promise<ApiEnvelope<T>> {
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const error = (body as { error?: ApiErrorShape } | null)?.error;
    throw new ApiClientError(
      response.status,
      error?.message ?? FALLBACK_MESSAGE,
      error?.code ?? "UNKNOWN",
      error?.details,
    );
  }

  if (!body || typeof body !== "object" || !("data" in body)) {
    throw new ApiClientError(response.status, FALLBACK_MESSAGE, "MALFORMED_RESPONSE");
  }

  return body as ApiEnvelope<T>;
}

function sendInit(method: string, json?: unknown): RequestInit {
  return {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(json === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(json === undefined ? {} : { body: JSON.stringify(json) }),
  };
}

function networkError(): ApiClientError {
  return new ApiClientError(0, "Unable to reach the server. Check your connection.", "NETWORK_ERROR");
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<ApiEnvelope<T>> {
  try {
    return await parse<T>(await fetch(path, { ...sendInit("GET"), signal }));
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw networkError();
  }
}

export async function apiPost<T>(path: string, json?: unknown): Promise<ApiEnvelope<T>> {
  return request<T>("POST", path, json);
}

export async function apiPatch<T>(path: string, json?: unknown): Promise<ApiEnvelope<T>> {
  return request<T>("PATCH", path, json);
}

export async function apiDelete<T>(path: string): Promise<ApiEnvelope<T>> {
  return request<T>("DELETE", path);
}

async function request<T>(method: string, path: string, json?: unknown): Promise<ApiEnvelope<T>> {
  try {
    return await parse<T>(await fetch(path, sendInit(method, json)));
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw networkError();
  }
}

/** Builds `?a=1&b=2`, skipping empty values. */
export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return FALLBACK_MESSAGE;
}
