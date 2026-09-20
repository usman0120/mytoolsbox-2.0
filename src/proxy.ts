import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAbuse } from "@/lib/payments/abuse";

// Paths that require authentication
const PROTECTED_PATHS = ["/dashboard", "/settings", "/favorites", "/history", "/account"];

// Paths that redirect to home if already authenticated
const AUTH_PATHS = ["/signin", "/signup"];

// Paths that trigger abuse checks (API routes + high-value pages)
const ABUSE_CHECK_PATHS = ["/api/", "/tools/", "/apps/"];

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

  // -------------------------------------------------------------------------
  // Abuse prevention for API routes and high-value paths
  // -------------------------------------------------------------------------
  const shouldCheckAbuse = ABUSE_CHECK_PATHS.some(
    (path) => pathname.startsWith(path)
  );

  if (shouldCheckAbuse) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIP = forwardedFor?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "127.0.0.1";
    const isGuest = !sessionCookie;

    const abuseCheck = checkAbuse({
      ip: clientIP,
      userId: sessionCookie?.value,
      isGuest,
      userAgent: request.headers.get("user-agent") ?? undefined,
      tier: "free",
      path: pathname,
      timestamp: Date.now(),
    });

    if (!abuseCheck.allowed) {
      // For API routes, return JSON error
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            error: abuseCheck.reason ?? "Request blocked by abuse prevention.",
            code: abuseCheck.code ?? "BLOCKED",
            requiresCaptcha: abuseCheck.requiresCaptcha,
            retryAfterMs: abuseCheck.retryAfterMs,
          },
          {
            status: abuseCheck.code === "IP_BLOCKED" || abuseCheck.code === "SUSPICIOUS_ACTIVITY" ? 403 : 429,
            headers: abuseCheck.retryAfterMs
              ? { "Retry-After": String(Math.ceil(abuseCheck.retryAfterMs / 1000)) }
              : {},
          }
        );
      }

      // For page routes, redirect to a blocked page or show error
      const blockedUrl = new URL("/?blocked=true", request.url);
      return NextResponse.redirect(blockedUrl);
    }
  }

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