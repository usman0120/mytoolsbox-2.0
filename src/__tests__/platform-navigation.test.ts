import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { CATEGORIES } from "@/lib/constants";
import { FOOTER_TOOL_SECTIONS, FOOTER_PLATFORM_SECTIONS } from "@/lib/navigation/footer-directory";
import { getToolBySlug } from "@/content/tools/registry";
import { getAppBySlug, getActiveApps } from "@/content/apps/registry";
import { getHubBySlug } from "@/content/hubs/registry";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { safeReturnPath } from "@/lib/auth/auth-navigation";

describe("footer directory", () => {
  it("covers every major tool category", () => {
    expect(FOOTER_TOOL_SECTIONS.map((section) => section.href).sort()).toEqual(CATEGORIES.map((category) => `/tools?category=${category.id}`).sort());
  });
  it("makes every active app directly discoverable", () => {
    const appLinks = new Set(FOOTER_PLATFORM_SECTIONS.flatMap((section) => section.links.map((link) => link.href)));
    for (const app of getActiveApps()) expect(appLinks.has(`/apps/${app.slug}`), app.name).toBe(true);
  });
  it("links only to real active tools, apps, hubs, and platform routes", () => {
    for (const section of [...FOOTER_TOOL_SECTIONS, ...FOOTER_PLATFORM_SECTIONS]) {
      for (const href of [section.href, ...section.links.map((link) => link.href)]) {
        const [path] = href.split(/[?#]/);
        const [, module, slug] = path.split("/");
        if (module === "tools" && slug) expect(getToolBySlug(slug)?.status, href).toBe("active");
        else if (module === "apps" && slug) expect(getAppBySlug(slug)?.status, href).toBe("active");
        else if (module === "hubs" && slug) expect(getHubBySlug(slug), href).toBeDefined();
        else expect(existsSync(join(process.cwd(), "src/app", path, "page.tsx")), href).toBe(true);
      }
    }
  });
});

describe("auth feedback", () => {
  it("accepts local return URLs and rejects external and obfuscated redirects", () => {
    expect(safeReturnPath("/settings?tab=history", "https://mytoolsbox.me")).toBe("/settings?tab=history");
    for (const path of ["https://evil.example", "//evil.example", "/\\evil.example", "/\n/evil.example"]) {
      expect(safeReturnPath(path, "https://mytoolsbox.me")).toBeNull();
    }
  });
  it("reads Firebase error codes even when the error is not an Error object", () => {
    expect(getAuthErrorMessage({ code: "auth/popup-blocked" })).toMatch(/blocked.*window/);
    expect(getAuthErrorMessage({ code: "auth/network-request-failed" })).toMatch(/connection/i);
  });
  it("does not leak raw server errors", () => {
    expect(getAuthErrorMessage(new Error("secret token and internal data"))).not.toContain("secret");
  });
});
