import { getManifest } from "@/tools/registry";
import { getSpace } from "@/spaces";
import { LEGACY_APP_PATHS, LEGACY_TOOL_PATHS } from "@/config/legacy-tool-paths";
const resolveLegacy = (t: string) => { const m = /^\/(tools|apps)\/([a-z0-9-]+)(\?.*)?$/.exec(t); const map = m?.[1] === "tools" ? LEGACY_TOOL_PATHS : LEGACY_APP_PATHS; return m && map[m[2]] ? map[m[2]] + (m[3] ?? "") : t; };
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { RETIRED_TOOLS, RETIRED_APPS, consolidatedPath } from "@/lib/catalog/consolidation";
import { escapeDocumentStrings } from "@/lib/documents/escape-document";

describe("consolidated product catalog", () => {
  it("does not redirect inherited object-property names", () => {
    expect(consolidatedPath("/tools/constructor")).toBeUndefined();
    expect(consolidatedPath("/apps/__proto__")).toBeUndefined();
  });
  it("removes duplicate discoverable products and resolves old links to real products", () => {
    for (const [slug, target] of Object.entries(RETIRED_TOOLS)) {
      const final = resolveLegacy(target);
      expect(consolidatedPath(`/tools/${slug}`)).toBe(final);
      const [, module, canonical] = final.split("?")[0].split("/");
      expect(getManifest(module, canonical ?? "") ?? (canonical ? undefined : getSpace(module)), `${slug} → ${final}`).toBeDefined();
    }
    for (const [slug, target] of Object.entries(RETIRED_APPS)) {
      const [, module, canonical] = resolveLegacy(target).split("?")[0].split("/");
      expect(getManifest(module, canonical ?? ""), slug).toBeDefined();
    }
  });
  it("removes the comparison and persona features rather than just hiding their tabs", () => {
    expect(existsSync("src/app/ai/compare/page.tsx")).toBe(false);
    expect(existsSync("src/app/ai/personas/page.tsx")).toBe(false);
    expect(existsSync("src/features/ai/components/model-compare.tsx")).toBe(false);
    expect(readFileSync("src/features/ai/components/chat-input.tsx", "utf8")).not.toContain("AI_PERSONAS");
    expect(readFileSync("src/components/shell/site-header.tsx", "utf8")).not.toMatch(/\/ai\/(compare|personas)/);
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
