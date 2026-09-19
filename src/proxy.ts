import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require authentication
const PROTECTED_PATHS = ["/dashboard", "/settings", "/favorites", "/history"];

// Paths that redirect to home if already authenticated
const AUTH_PATHS = ["/signin", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // Check if it's an auth page (signin/signup)
  const isAuthPath = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // For now, we use a simple cookie-based check
  // Firebase Auth will handle the actual session on the client side
  // This middleware provides a basic server-side guard
  const sessionCookie = request.cookies.get("__session");

  if (isProtected && !sessionCookie) {
    const signInUrl = new URL("/", request.url);
    signInUrl.searchParams.set("signin", "true");
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthPath && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};