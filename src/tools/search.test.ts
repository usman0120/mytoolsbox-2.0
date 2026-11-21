import { describe, expect, it } from "vitest";
import { searchTools, tokenize } from "./search";
import { buildSearchDocs } from "./search-docs";

const index = buildSearchDocs();
const top = (q: string, n = 3) => searchTools(index, q, n).map((d) => d.id);

describe("tool search", () => {
  it("drops filler words and maps everyday synonyms", () => {
    expect(tokenize("how to shrink my photo to 100 KB")).toEqual(["compress", "image", "compress"]);
  });

  it.each([
    ["merge pdf", "docs.merge-pdf"],
    ["compress a photo to 100 KB", "media.compress-image"],
    ["json formatter", "dev.json-formatter"],
    ["video to gif", "media.video-to-gif"],
    ["bmi", "calc.bmi-calculator"],
    ["qr code", "create.qr-code-generator"],
    ["solve equation", "study.equation-solver"],
  ])("“%s” finds %s near the top", (q, id) => {
    expect(top(q)).toContain(id);
  });

  it("returns nothing for gibberish", () => {
    expect(searchTools(index, "zzqx wvvk")).toEqual([]);
  });
});
