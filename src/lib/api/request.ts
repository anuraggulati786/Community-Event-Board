import { ApiError } from "@/lib/api/errors";

/** Turns a URL's search params into a plain object, dropping empty values. */
export function searchParamsToObject(searchParams: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (value !== "") result[key] = value;
  });
  return result;
}

/** Reads a JSON body, turning malformed payloads into a 400 instead of a 500. */
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    const text = await request.text();
    if (!text) return {};
    return JSON.parse(text) as unknown;
  } catch {
    throw ApiError.badRequest("Send a valid JSON body");
  }
}
