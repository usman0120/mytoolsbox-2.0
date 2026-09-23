import { describe, it, expect } from "vitest";
import {
  RESOURCE_GUIDES,
  RESOURCE_TEMPLATES,
  CHEAT_SHEETS,
  RESOURCE_FAQS,
  getGuideBySlug,
  searchResources,
} from "@/features/resources/resources-data";

describe("Resources Module — Knowledge Hub, Templates & Cheat Sheets", () => {
  describe("1. Guides Catalog", () => {
    it("contains comprehensive in-depth guides with takeaways and tool recommendations", () => {
      expect(RESOURCE_GUIDES.length).toBeGreaterThanOrEqual(6);
      RESOURCE_GUIDES.forEach((guide) => {
        expect(guide.slug).toBeTruthy();
        expect(guide.title).toBeTruthy();
        expect(guide.description).toBeTruthy();
        expect(guide.takeaways.length).toBeGreaterThanOrEqual(2);
        expect(guide.sections.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("fetches guide accurately by slug and handles invalid slugs", () => {
      const gettingStarted = getGuideBySlug("getting-started");
      expect(gettingStarted).toBeDefined();
      expect(gettingStarted?.title).toContain("Getting Started");

      const pdfGuide = getGuideBySlug("pdf-tools-guide");
      expect(pdfGuide).toBeDefined();
      expect(pdfGuide?.category).toBe("multimedia");

      const invalid = getGuideBySlug("non-existent-slug");
      expect(invalid).toBeUndefined();
    });
  });

  describe("2. Templates Library", () => {
    it("provides functional templates in standard formats (DOCX, MD, CSV, JSON, TXT)", () => {
      expect(RESOURCE_TEMPLATES.length).toBeGreaterThanOrEqual(6);
      const formats = new Set(RESOURCE_TEMPLATES.map((t) => t.format));
      expect(formats.has("MD")).toBe(true);
      expect(formats.has("CSV")).toBe(true);
      expect(formats.has("JSON")).toBe(true);
      expect(formats.has("TXT")).toBe(true);

      RESOURCE_TEMPLATES.forEach((template) => {
        expect(template.content.length).toBeGreaterThan(50);
        expect(template.filename).toContain(".");
        expect(template.toolIntegration).toBeDefined();
      });
    });

    it("verifies budget CSV template contains proper headers and rows", () => {
      const budget = RESOURCE_TEMPLATES.find((t) => t.id === "budget-tracker-csv");
      expect(budget).toBeDefined();
      expect(budget?.content).toContain("Category,Subcategory,Budgeted Amount");
      expect(budget?.content).toContain("Income,Primary Salary");
    });

    it("verifies API specification template is valid parseable JSON", () => {
      const apiSpec = RESOURCE_TEMPLATES.find((t) => t.id === "api-doc-spec");
      expect(apiSpec).toBeDefined();
      expect(() => JSON.parse(apiSpec!.content)).not.toThrow();
    });
  });

  describe("3. Developer Cheat Sheets", () => {
    it("contains quick references for Regex, HTTP, Markdown, MIME, and Git", () => {
      expect(CHEAT_SHEETS.length).toBeGreaterThanOrEqual(15);
      const categories = new Set(CHEAT_SHEETS.map((c) => c.category));
      expect(categories.has("regex")).toBe(true);
      expect(categories.has("http")).toBe(true);
      expect(categories.has("markdown")).toBe(true);
      expect(categories.has("mime")).toBe(true);
      expect(categories.has("git")).toBe(true);
    });

    it("verifies regex syntax snippets are valid regular expressions", () => {
      const regexItems = CHEAT_SHEETS.filter((c) => c.category === "regex");
      regexItems.forEach((item) => {
        expect(() => new RegExp(item.syntax)).not.toThrow();
      });
    });
  });

  describe("4. Search & Filtering", () => {
    it("searches across all resource entities with query keyword", () => {
      const results = searchResources("JSON");
      expect(results.guides.length + results.templates.length + results.cheatSheets.length).toBeGreaterThan(0);

      const templateMatch = results.templates.some((t) => t.title.toLowerCase().includes("json") || t.id.includes("api"));
      expect(templateMatch).toBe(true);

      const cheatMatch = results.cheatSheets.some((c) => c.title.toLowerCase().includes("json") || c.syntax.includes("json"));
      expect(cheatMatch).toBe(true);
    });

    it("returns all resources when search query is empty", () => {
      const all = searchResources("");
      expect(all.guides.length).toBe(RESOURCE_GUIDES.length);
      expect(all.templates.length).toBe(RESOURCE_TEMPLATES.length);
      expect(all.cheatSheets.length).toBe(CHEAT_SHEETS.length);
      expect(all.faqs.length).toBe(RESOURCE_FAQS.length);
    });
  });
});
