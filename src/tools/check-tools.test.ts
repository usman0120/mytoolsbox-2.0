// `npm run check:tools` — fails on any manifest error; prints warnings.
import { describe, expect, it } from "vitest";
import { SPACES } from "@/spaces";
import { TOOL_MANIFESTS } from "./registry";
import { validateManifests, type Issue } from "./validate";
import type { ToolManifest } from "./types";
import { LEGACY_APP_PATHS, LEGACY_TOOL_PATHS } from "@/config/legacy-tool-paths";

const fmt = (list: Issue[]) => list.map((i) => `${i.level.toUpperCase()} ${i.id}: ${i.message}`).join("\n");

describe("check:tools", () => {
  it("has 8 Spaces with unique ids and categories", () => {
    expect(SPACES).toHaveLength(8);
    expect(new Set(SPACES.map((s) => s.id)).size).toBe(8);
    for (const s of SPACES) expect(new Set(s.categories.map((c) => c.id)).size).toBe(s.categories.length);
  });

  it("every registered manifest passes validation", () => {
    const issues = validateManifests(TOOL_MANIFESTS);
    const warnings = issues.filter((i) => i.level === "warning");
    if (warnings.length) console.warn(fmt(warnings));
    expect(fmt(issues.filter((i) => i.level === "error"))).toBe("");
  });

  it("keeps src/config/legacy-tool-paths.ts in sync with manifest legacySlugs", () => {
    const expected: Record<string, string> = {};
    for (const m of TOOL_MANIFESTS) for (const l of m.legacySlugs ?? []) expected[l] = `/${m.space}/${m.slug}`;
    expect({ ...LEGACY_TOOL_PATHS, ...LEGACY_APP_PATHS }).toEqual(expected);
  });

  it("catches the rules it promises to enforce", () => {
    const bad: ToolManifest = {
      id: "docs.Bad",
      space: "docs",
      category: "nope",
      slug: "Bad",
      name: "Smallpdf clone",
      tagline: "",
      keywords: [],
      synonyms: [],
      jobs: [],
      template: "file",
      input: [],
      output: [{ type: "pdf" }],
      engine: "client",
      seo: { title: "x".repeat(61), description: "short", h1: "" },
      faq: [],
      related: ["docs.missing"],
      status: "live",
      offline: true,
    };
    const messages = validateManifests([bad]).map((i) => i.message).join("\n");
    for (const rule of ["unknown category", "kebab-case", "input port", "SEO title", "meta description", "missing h1", "another company", "FAQ needs", "missing keywords", "does not exist"]) {
      expect(messages).toContain(rule);
    }
  });
});
