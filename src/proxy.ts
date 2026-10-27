import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAbuse } from "@/lib/payments/abuse";
import { consolidatedPath } from "@/lib/catalog/consolidation";

// Non-default supported locale prefixes for localized URL rewriting
const LOCALES = ["es", "ur", "fr", "de", "pt", "hi", "ar"];

// Paths that require authentication
const PROTECTED_PATHS = ["/dashboard", "/settings", "/favorites", "/history", "/account", "/admin"];

// Paths that redirect to home if already authenticated
const AUTH_PATHS = ["/signin", "/signup"];

// Paths that trigger abuse checks (API routes + high-value pages)
const ABUSE_CHECK_PATHS = ["/api/", "/tools/", "/apps/"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // -------------------------------------------------------------------------
  // Multi-Language Subpath Detection & Normalization (e.g. /es/tools/... -> /tools/...)
  // -------------------------------------------------------------------------
  const pathSegments = pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0];
  const isLocalePrefix = firstSegment && LOCALES.includes(firstSegment);
  const locale = isLocalePrefix ? firstSegment : null;
  const normalizedPath = isLocalePrefix
    ? "/" + pathSegments.slice(1).join("/")
    : pathname;

  const replacement = consolidatedPath(normalizedPath);
  if (replacement) {
    const target = new URL(replacement, request.url);
    request.nextUrl.searchParams.forEach((value, key) => {
      if (!target.searchParams.has(key)) target.searchParams.set(key, value);
    });
    if (locale) target.pathname = `/${locale}${target.pathname}`;
    return NextResponse.redirect(target, 308);
  }

  // Check if the path is protected
  const isProtected = PROTECTED_PATHS.some(
    (path) => normalizedPath === path || normalizedPath.startsWith(path + "/")
  );

  // Check if it's an auth page (signin/signup)
  const isAuthPath = AUTH_PATHS.some(
    (path) => normalizedPath === path || normalizedPath.startsWith(path + "/")
  );

  const sessionCookie = request.cookies.get("__session");

  // -------------------------------------------------------------------------
  // Abuse prevention for API routes and high-value paths
  // -------------------------------------------------------------------------
  const shouldCheckAbuse = ABUSE_CHECK_PATHS.some(
    (path) => normalizedPath.startsWith(path)
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
      path: normalizedPath,
      timestamp: Date.now(),
    });

    if (!abuseCheck.allowed) {
      if (normalizedPath.startsWith("/api/")) {
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

      const blockedUrl = new URL("/?blocked=true", request.url);
      return NextResponse.redirect(blockedUrl);
    }
  }

  if (isProtected && !sessionCookie) {
    const signInUrl = new URL("/", request.url);
    signInUrl.searchParams.set("signin", "true");
    signInUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthPath && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // -------------------------------------------------------------------------
  // Internal rewrite for localized paths (preserves URL in browser for Googlebot)
  // -------------------------------------------------------------------------
  if (locale) {
    const targetUrl = new URL(normalizedPath === "" ? "/" : normalizedPath, request.url);
    targetUrl.searchParams.set("lang", locale);
    request.nextUrl.searchParams.forEach((val, key) => {
      if (key !== "lang") targetUrl.searchParams.set(key, val);
    });

    const response = NextResponse.rewrite(targetUrl);
    response.headers.set("x-locale", locale);
    return response;
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
