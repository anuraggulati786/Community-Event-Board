/**
 * Every expected failure in the app is raised as an ApiError so route handlers
 * can translate it into a structured JSON response with a correct status code.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message = "Invalid request", details?: unknown) {
    return new ApiError(400, message, "BAD_REQUEST", details);
  }

  static unauthorized(message = "You need to sign in to continue") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "You do not have access to this resource") {
    return new ApiError(403, message, "FORBIDDEN");
  }

  static notFound(message = "We could not find what you were looking for") {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static conflict(message = "That already exists") {
    return new ApiError(409, message, "CONFLICT");
  }
}
