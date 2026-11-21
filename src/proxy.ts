import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { consolidatedPath } from "@/lib/catalog/consolidation";

// Redirects only. Auth is enforced client-side and by Firestore rules; AI routes
// rate-limit themselves (src/server/quota.ts). Static redirects live in src/config/redirects.ts.
export function proxy(request: NextRequest) {
  const replacement = consolidatedPath(request.nextUrl.pathname);
  if (!replacement) return NextResponse.next();

  const target = new URL(replacement, request.url);
  request.nextUrl.searchParams.forEach((value, key) => {
    if (!target.searchParams.has(key)) target.searchParams.set(key, value);
  });
  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: ["/tools/:slug", "/apps/:slug", "/ai/compare", "/ai/personas", "/ai/prompts"],
};
