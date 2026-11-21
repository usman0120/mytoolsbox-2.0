import { describe, expect, it } from "vitest";
import { GUIDES, guideToolHref } from "./index";
import { getManifest } from "@/tools/registry";

const resolves = (href: string) => {
  if (href.startsWith("/search?q=")) return true;
  const [, space, slug] = href.split("/");
  return !!getManifest(space, slug ?? "");
};

describe("guides", () => {
  it("have unique slugs and real content", () => {
    expect(new Set(GUIDES.map((g) => g.slug)).size).toBe(GUIDES.length);
    for (const g of GUIDES) {
      expect(g.sections.length, g.slug).toBeGreaterThan(0);
      expect(g.metaDescription.length, g.slug).toBeGreaterThan(50);
    }
  });

  it("link every tool reference to a live tool or a search, never a dead /tools URL", () => {
    for (const g of GUIDES) {
      for (const href of [...g.tools.map((t) => t.href), ...g.sections.flatMap((s) => (s.tool ? [s.tool.href] : []))]) {
        expect(resolves(href), `${g.slug}: ${href}`).toBe(true);
      }
      for (const m of g.sections.flatMap((s) => [...s.content.matchAll(/\]\(\/tools\/([a-z0-9-]+)/g)])) {
        expect(resolves(guideToolHref(m[1])), `${g.slug}: /tools/${m[1]}`).toBe(true);
      }
    }
  });

  it("maps renamed tools to their current page", () => {
    expect(guideToolHref("pdf-merger")).toBe("/docs/merge-pdf");
    expect(guideToolHref("cron-generator")).toBe("/dev/cron-builder");
    expect(guideToolHref("svg-optimizer")).toBe("/search?q=svg%20optimizer");
  });
});
