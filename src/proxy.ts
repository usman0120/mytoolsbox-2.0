import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { consolidatedPath } from "@/lib/catalog/consolidation";

// Redirects only. Auth is enforced client-side and by Firestore rules; AI routes
// rate-limit themselves (src/server/quota.ts). Static redirects live in src/config/redirects.ts.
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/workflows") {
    const preset = searchParams.get("preset");
    const target = new URL(preset && /^[a-z0-9-]+$/.test(preset) ? `/flows/${preset}` : "/flows", request.url);
    return NextResponse.redirect(target, 308);
  }
  const replacement = consolidatedPath(pathname);
  if (!replacement) return NextResponse.next();

  const target = new URL(replacement, request.url);
  request.nextUrl.searchParams.forEach((value, key) => {
    if (!target.searchParams.has(key)) target.searchParams.set(key, value);
  });
  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: ["/workflows", "/tools/:slug", "/apps/:slug", "/ai/compare", "/ai/personas", "/ai/prompts"],
};
