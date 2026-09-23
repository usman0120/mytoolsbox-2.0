import { describe, it, expect } from "vitest";
import { applyCaseConversion } from "@/features/tools/case-converter";
import { cleanText } from "@/features/tools/text-cleaner";
import { generateLoremIpsum } from "@/features/tools/lorem-ipsum";
import { computeDiff } from "@/features/tools/diff-checker";
import { generateBusinessName } from "@/features/tools/business-name-generator";
import { generatePostContent } from "@/features/tools/social-media-content-generator";

describe("Writing & Text Analysis Tool Engines", () => {
  describe("Case Converter", () => {
    it("converts text to 12 cases correctly", () => {
      const sample = "hello world";
      expect(applyCaseConversion(sample, "upper")).toBe("HELLO WORLD");
      expect(applyCaseConversion(sample, "lower")).toBe("hello world");
      expect(applyCaseConversion(sample, "title")).toBe("Hello World");
      expect(applyCaseConversion(sample, "snake")).toBe("hello_world");
      expect(applyCaseConversion(sample, "constant")).toBe("HELLO_WORLD");
      expect(applyCaseConversion(sample, "kebab")).toBe("hello-world");
      expect(applyCaseConversion(sample, "camel")).toBe("helloWorld");
      expect(applyCaseConversion(sample, "pascal")).toBe("HelloWorld");
      expect(applyCaseConversion(sample, "dot")).toBe("hello.world");
      expect(applyCaseConversion(sample, "path")).toBe("hello/world");
      expect(applyCaseConversion("abc", "alternating")).toBe("AbC");
    });
  });

  describe("Text Cleaner", () => {
    it("strips HTML, deduplicates lines, and removes extra whitespace", () => {
      const dirty = "<p>Line 1</p>\n\n  \n<p>Line 1</p>\nLine 2   extra   spaces";
      const cleaned = cleanText(dirty, {
        removeHTML: true,
        removeDuplicateLines: true,
        removeEmptyLines: true,
        removeExtraSpaces: true,
        trimLines: true,
      });

      expect(cleaned).toContain("Line 1\nLine 2 extra spaces");
      expect(cleaned).not.toContain("<p>");
    });

    it("sorts lines alphabetically and numbers them", () => {
      const lines = "Zebra\nApple\nMango";
      const processed = cleanText(lines, {
        sortLines: "asc",
        numberLines: true,
      });
      expect(processed).toBe("1. Apple\n2. Mango\n3. Zebra");
    });
  });

  describe("Lorem Ipsum Generator", () => {
    it("generates requested paragraphs with Cicero and Tech themes", () => {
      const classic = generateLoremIpsum(2, 3, 6, { theme: "classic", unit: "paragraphs" });
      expect(classic.split("\n\n").length).toBe(2);
      expect(classic).toContain("Lorem ipsum");

      const tech = generateLoremIpsum(1, 2, 5, { theme: "tech", unit: "paragraphs", startWithLorem: false });
      expect(tech.length).toBeGreaterThan(10);
    });

    it("generates HTML list format", () => {
      const list = generateLoremIpsum(3, 3, 5, { unit: "list", count: 3, htmlTags: true });
      expect(list).toContain("<ul>");
      expect(list).toContain("<li>");
      expect(list).toContain("</ul>");
    });
  });

  describe("Diff Checker", () => {
    it("accurately computes additions, deletions, and unchanged parts", () => {
      const text1 = "Apple\nBanana\nOrange";
      const text2 = "Apple\nBlueberry\nOrange";

      const diff = computeDiff(text1, text2, "lines");
      const types = diff.map((d) => d.type);
      expect(types).toContain("removed");
      expect(types).toContain("added");
      expect(types).toContain("unchanged");
    });
  });

  describe("Business Name Generator", () => {
    it("generates unique business names across industries and styles", () => {
      const names = generateBusinessName("Tech & AI", 8, "Quantum", "compound");
      expect(names.length).toBeGreaterThanOrEqual(5);
      names.forEach((n) => {
        expect(n.toLowerCase()).toContain("quantum");
      });
    });
  });

  describe("Social Media Post Generator", () => {
    it("generates platform-compliant posts with character constraints", () => {
      const tweet = generatePostContent("Next.js App", "Twitter/X", "Educational", "Tech");
      expect(tweet.platform).toBe("Twitter/X");
      expect(tweet.content.length).toBeLessThanOrEqual(280);
      expect(tweet.hashtags.length).toBeGreaterThan(0);

      const linkedin = generatePostContent("AI Agents", "LinkedIn", "Storytelling", "Tech");
      expect(linkedin.platform).toBe("LinkedIn");
      expect(linkedin.content.length).toBeGreaterThan(100);
    });
  });
});
