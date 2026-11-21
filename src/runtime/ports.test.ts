import { describe, expect, it } from "vitest";
import { acceptsFile, portTypeOf } from "./ports";
import { compactCatalog } from "@/tools/catalog";

describe("portTypeOf", () => {
  it.each([
    ["application/pdf", "a.pdf", "pdf"],
    ["image/webp", "a.webp", "image"],
    ["", "photo.HEIC", "image"],
    ["video/mp4", "clip.mp4", "video"],
    ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "a.docx", "docx"],
    ["text/csv", "a.csv", "csv"],
    ["application/zip", "a.zip", "zip"],
    ["text/plain", "a.txt", "text"],
    ["application/octet-stream", "a.bin", "any-file"],
  ])("%s %s → %s", (mime, name, type) => expect(portTypeOf(mime, name)).toBe(type));
});

describe("Send to / Continue with catalog", () => {
  const catalog = compactCatalog();
  const forType = (type: Parameters<typeof acceptsFile>[1]) => catalog.filter((t) => acceptsFile(t, type)).map((t) => t.id);

  it("offers image tools for an image and lists popular tools first", () => {
    const ids = forType("image");
    expect(ids.slice(0, 3)).toEqual(["media.compress-image", "media.resize-image", "media.convert-image"]);
    expect(ids).toContain("docs.jpg-to-pdf");
  });

  it("does not treat tools limited to one extension as wildcards", () => {
    expect(forType("image")).not.toContain("docs.powerpoint-to-pdf");
  });

  it("offers PDF tools for a PDF and nothing for a ZIP", () => {
    expect(forType("pdf")).toEqual(expect.arrayContaining(["docs.compress-pdf", "docs.merge-pdf", "docs.pdf-to-jpg"]));
    expect(forType("zip")).toEqual([]);
  });
});
