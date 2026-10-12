import { type NextRequest, NextResponse } from "next/server";

import { ADMIN_COOKIE, USER_COOKIE } from "@/lib/constants";
import { verifyAdminToken, verifyUserToken } from "@/lib/auth/tokens";

/**
 * First line of defence, running on the Edge runtime before any page or route
 * handler executes:
 *
 *   /admin/*            -> HTML pages, redirect to /admin/login when not signed in
 *   /api/admin/*        -> JSON 401 (except /api/admin/login)
 *   /feed, /onboarding  -> redirect to /login when not signed in
 *   user-only APIs      -> JSON 401
 *
 * Every protected route *also* re-checks the session in the handler
 * (requireUser / requireAdmin), so protection never depends on the client or on
 * middleware alone.
 */

export const config = {
  matcher: [
    "/admin/:path*",
    "/feed/:path*",
    "/onboarding/:path*",
    "/api/admin/:path*",
    "/api/feed/:path*",
    "/api/user/:path*",
    "/api/reminders/:path*",
    "/api/card-design/:path*",
  ],
};

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/admin/login"]);

/** Cookies for browsers, `Authorization: Bearer` for API/mobile clients. */
function readToken(request: NextRequest, cookieName: string): string | null {
  const fromCookie = request.cookies.get(cookieName)?.value;
  if (fromCookie) return fromCookie;
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim() || null;
  }
  return null;
}

function unauthorizedJson(message: string) {
  return NextResponse.json(
    { error: { message, code: "UNAUTHORIZED" } },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = readToken(request, ADMIN_COOKIE);
    const session = await verifyAdminToken(token);
    if (session?.role === "admin") return NextResponse.next();

    if (isApi) return unauthorizedJson("Admin sign-in required");
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Everything remaining is visitor + logged-in-user territory.
  const isUserOnlyApi =
    pathname.startsWith("/api/feed") ||
    pathname.startsWith("/api/user") ||
    pathname.startsWith("/api/reminders") ||
    pathname.startsWith("/api/card-design");

  const needsUserSession = isUserOnlyApi || pathname.startsWith("/feed") || pathname.startsWith("/onboarding");
  if (!needsUserSession) return NextResponse.next();

  const token = readToken(request, USER_COOKIE);
  const session = await verifyUserToken(token);
  if (session?.role === "user") return NextResponse.next();

  if (isApi) return unauthorizedJson("Sign in to continue");
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}
