import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { consolidatedPath } from "@/lib/catalog/consolidation";

// Redirects only. Auth is enforced client-side and by Firestore rules; AI routes
// rate-limit themselves (src/server/quota.ts). Static redirects live in src/config/redirects.ts.
// Blog and resources became Guides; role hubs became Spaces (blueprint section 25).
const HUBS: Record<string, string> = {
  students: "/study", developers: "/dev", business: "/work", writers: "/work", designers: "/create",
  researchers: "/study", farmers: "/ai/farm-advisor", everyone: "/",
};
function contentRedirect(pathname: string): string | undefined {
  const [, section, slug, extra] = pathname.split("/");
  if (extra !== undefined) return undefined;
  if (section === "blog" || section === "resources") return slug ? `/guides/${slug}` : "/guides";
  if (section === "hubs") return slug ? HUBS[slug] ?? "/" : "/";
  if (section === "apps" && !slug) return "/ai";
  return undefined;
}

const CATEGORY_SPACES: Record<string, string> = {
  documents: "/docs", images: "/media", video: "/media", audio: "/media", developer: "/dev", security: "/dev",
  calculators: "/calc", academic: "/study", writing: "/work", productivity: "/work", design: "/create", ai: "/ai", misc: "/tools",
};

// Old account pages now live in the Workspace at /me.
const ACCOUNT_PAGES: Record<string, string> = { "/settings": "settings", "/favorites": "favorites", "/history": "history", "/account": "settings", "/dashboard": "" };
const SETTINGS_TABS: Record<string, string> = { account: "settings", favorites: "favorites", history: "history" };

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/workflows") {
    const preset = searchParams.get("preset");
    const target = new URL(preset && /^[a-z0-9-]+$/.test(preset) ? `/flows/${preset}` : "/flows", request.url);
    return NextResponse.redirect(target, 308);
  }
  if (pathname === "/tools" && searchParams.get("category")) {
    const space = CATEGORY_SPACES[searchParams.get("category") ?? ""] ?? "/tools";
    return NextResponse.redirect(new URL(space, request.url), 308);
  }
  const content = contentRedirect(pathname);
  if (content) return NextResponse.redirect(new URL(content, request.url), 308);
  const account = ACCOUNT_PAGES[pathname];
  if (account !== undefined) {
    const tab = pathname === "/settings" ? SETTINGS_TABS[searchParams.get("tab") ?? ""] ?? "settings" : account;
    return NextResponse.redirect(new URL(tab ? `/me?tab=${tab}` : "/me", request.url), 308);
  }
  const replacement = consolidatedPath(pathname);
  if (!replacement) {
    // An old /tools/{slug} we no longer have: search for it instead of a dead end.
    const unknown = /^\/tools\/([a-z0-9-]+)$/.exec(pathname);
    if (unknown) return NextResponse.redirect(new URL(`/search?q=${encodeURIComponent(unknown[1].replace(/-/g, " "))}`, request.url), 307);
    return NextResponse.next();
  }

  const target = new URL(replacement, request.url);
  request.nextUrl.searchParams.forEach((value, key) => {
    if (!target.searchParams.has(key)) target.searchParams.set(key, value);
  });
  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: ["/tools", "/blog", "/blog/:slug", "/resources", "/resources/:slug", "/hubs", "/hubs/:slug", "/apps", "/settings", "/favorites", "/history", "/account", "/dashboard", "/workflows", "/tools/:slug", "/apps/:slug", "/ai/compare", "/ai/personas", "/ai/prompts"],
};
