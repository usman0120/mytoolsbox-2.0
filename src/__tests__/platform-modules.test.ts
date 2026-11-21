import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { getAppBySlug } from "@/content/apps/registry";
import { consolidatedPath } from "@/lib/catalog/consolidation";
import sitemap from "@/app/sitemap";

describe("US English-only platform and AI app", () => {
  it("removes multilingual controllers, catalogs, scripts and the prompt library", () => {
    for (const file of ["src/lib/i18n/context.tsx", "src/components/common/language-switcher.tsx", "src/components/common/full-page-translations.tsx", "public/i18n/en.json", "scripts/generate-ui-translations.mjs", "src/app/ai/prompts/page.tsx", "src/features/ai/components/prompt-library.tsx", "src/features/ai/prompt-library-data.ts"]) expect(existsSync(file), file).toBe(false);
    expect(readFileSync("src/app/layout.tsx", "utf8")).toContain('lang="en-US"');
    expect(readFileSync("src/proxy.ts", "utf8")).not.toContain("LOCALES");
  });
  it("makes AI Chat a real app at /ai/chat and redirects the old entry points", () => {
    expect(getAppBySlug("ai-chat")?.productType).toBe("app"); expect(consolidatedPath("/ai")).toBeUndefined(); expect(consolidatedPath("/apps/ai-chat")).toBe("/ai/chat");
    expect(consolidatedPath("/ai/prompts")).toBe("/ai/chat");
    expect(readFileSync("src/features/ai/chat-store.ts", "utf8")).not.toMatch(/favoritePromptIds|pendingPrompt/);
  });
  it("exposes Flows and AI Studio in the header, with no prompt-library links", () => {
    const header = readFileSync("src/components/shell/site-header.tsx", "utf8");
    expect(header).toContain('href="/flows"');
    expect(header).toContain('href="/apps"');
    expect(header).not.toMatch(/href="\/ai\//);
  });
  it("publishes only canonical US English URLs in the sitemap", () => {
    const entries = sitemap();
    expect(entries.some((entry) => entry.url.endsWith("/flows"))).toBe(true);
    expect(entries.some((entry) => entry.url.endsWith("/ai/chat"))).toBe(true);
    expect(entries.some((entry) => /\/(es|ur|fr|de|pt|hi|ar)\//.test(entry.url))).toBe(false);
    expect(entries.some((entry) => entry.alternates?.languages)).toBe(false);
  });
});
