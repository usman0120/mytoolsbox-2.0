import { getGuide } from "@/content/guides";
import { WORKFLOW_PRESETS } from "@/flows/presets";
import { appPath } from "@/config/legacy-tool-paths";
import { getManifest } from "@/tools/registry";
import { getSpace } from "@/spaces";
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { FOOTER_TOOL_SECTIONS, FOOTER_PLATFORM_SECTIONS } from "@/lib/navigation/footer-directory";
import { SPACES } from "@/spaces";
import { manifestsInSpace } from "@/tools/registry";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { safeReturnPath } from "@/lib/auth/auth-navigation";

describe("footer directory", () => {
  it("links to every Space", () => {
    const hrefs = new Set([...FOOTER_TOOL_SECTIONS, ...FOOTER_PLATFORM_SECTIONS].map((s) => s.href));
    for (const space of SPACES.filter((s) => s.id !== "ai")) expect(hrefs.has(`/${space.slug}`), space.name).toBe(true);
  });
  it("lists the main AI Studio apps", () => {
    const links = new Set(FOOTER_PLATFORM_SECTIONS.flatMap((section) => section.links.map((link) => link.href)));
    for (const id of ["math-solver", "farm-advisor", "chat", "project-ideas"]) expect(links.has(`/ai/${id}`), id).toBe(true);
    expect(manifestsInSpace("ai").length).toBeGreaterThan(5);
    void appPath;
  });
  it("links only to real active tools, apps, hubs, and platform routes", () => {
    for (const section of [...FOOTER_TOOL_SECTIONS, ...FOOTER_PLATFORM_SECTIONS]) {
      for (const href of [section.href, ...section.links.map((link) => link.href)]) {
        const [path] = href.split(/[?#]/);
        const [, module, slug] = path.split("/");
        if (getManifest(module, slug ?? "") || (getSpace(module) && !slug)) continue;
        if (module === "guides" && slug) { expect(getGuide(slug), href).toBeDefined(); continue; }
        if (module === "flows" && slug) { expect(WORKFLOW_PRESETS.some((f) => f.id === slug), href).toBe(true); continue; }
        expect(existsSync(join(process.cwd(), "src/app", path, "page.tsx")), href).toBe(true);
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
