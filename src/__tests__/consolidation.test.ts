import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { RETIRED_TOOLS, RETIRED_APPS, consolidatedPath } from "@/lib/catalog/consolidation";
import { toolRegistry, getToolBySlug } from "@/content/tools/registry";
import { appRegistry, getAppBySlug } from "@/content/apps/registry";
import { hubRegistry } from "@/content/hubs/registry";
import { escapeDocumentStrings } from "@/lib/documents/escape-document";

describe("consolidated product catalog", () => {
  it("does not redirect inherited object-property names", () => {
    expect(consolidatedPath("/tools/constructor")).toBeUndefined();
    expect(consolidatedPath("/apps/__proto__")).toBeUndefined();
  });
  it("removes duplicate discoverable products and resolves old links to real products", () => {
    for (const [slug, target] of Object.entries(RETIRED_TOOLS)) {
      expect(getToolBySlug(slug)).toBeUndefined(); expect(consolidatedPath(`/tools/${slug}`)).toBe(target);
      const [, module, canonical] = target.split("?")[0].split("/");
      expect(module === "apps" ? getAppBySlug(canonical) : getToolBySlug(canonical), target).toBeDefined();
    }
    for (const slug of Object.keys(RETIRED_APPS)) expect(getAppBySlug(slug)).toBeUndefined();
    expect(toolRegistry.some((item) => item.slug === "resume-builder")).toBe(false);
    expect(appRegistry.filter((item) => item.slug === "resume-builder")).toHaveLength(1);
  });
  it("keeps hubs valid after moving tools into apps", () => {
    const tools = new Set(toolRegistry.map((item) => item.id)); const apps = new Set(appRegistry.map((item) => item.id));
    for (const hub of hubRegistry) {
      hub.toolIds.forEach((id) => expect(tools.has(id), id).toBe(true));
      hub.appIds?.forEach((id) => expect(apps.has(id), id).toBe(true));
    }
  });
  it("removes the comparison and persona features rather than just hiding their tabs", () => {
    expect(existsSync("src/app/ai/compare/page.tsx")).toBe(false);
    expect(existsSync("src/app/ai/personas/page.tsx")).toBe(false);
    expect(existsSync("src/features/ai/components/model-compare.tsx")).toBe(false);
    expect(readFileSync("src/features/ai/components/chat-input.tsx", "utf8")).not.toContain("AI_PERSONAS");
    expect(readFileSync("src/components/navigation/navbar.tsx", "utf8")).not.toMatch(/\/ai\/(compare|personas)/);
  });
  it("retains existing resume and CV storage keys without destructive migrations", () => {
    for (const [file, key] of [["resume-editor", "mytoolsbox-resume-data"], ["cv-editor", "mytoolsbox-cv-data"], ["resume-ai-assistant", "mytoolsbox-ai-resume"]]) {
      expect(readFileSync(`src/features/apps/${file}.tsx`, "utf8")).toContain(key);
    }
  });
  it("escapes imported document data without changing the saved draft", () => {
    const draft = { name: '<script>alert("unsafe")</script>', skills: ["A & B"] };
    expect(escapeDocumentStrings(draft)).toEqual({ name: "&lt;script&gt;alert(&quot;unsafe&quot;)&lt;/script&gt;", skills: ["A &amp; B"] });
    expect(draft.name).toContain("<script>");
  });
});
