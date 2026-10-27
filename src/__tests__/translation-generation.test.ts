import { describe, expect, it } from "vitest";
import { extractUiStrings, parseGenerationOptions, catalogPayload } from "../../scripts/translation-utils.mjs";

describe("bounded translation generation", () => {
  it("has finite default limits and rejects unbounded values", () => {
    expect(parseGenerationOptions([])).toEqual({ maxStrings: 50, maxMinutes: 5, batchSeconds: 60 });
    expect(() => parseGenerationOptions(["--max-minutes=Infinity"])).toThrow();
    expect(() => parseGenerationOptions(["--max-strings=0"])).toThrow();
    expect(() => parseGenerationOptions(["--batch-seconds=999999"])).toThrow();
  });
  it("extracts UI copy but excludes code, model prompts and sample documents", () => {
    const strings = extractUiStrings("screen.tsx", `
      const SAMPLE_RESUME = { name: "Sample person", description: "A sample biography" };
      const prompt = "You are a code generator. Write Python functions.";
      const code = '\"\"\" Function executes an operation. \"\"\"';
      const options = [{ label: "Modern template" }];
      export function Screen() { return <><h1>Build your resume</h1><input placeholder="Email address" /><button>{busy ? "Working..." : "Save"}</button><pre>Example code only</pre></>; }
    `);
    expect(strings).toEqual(expect.arrayContaining(["Build your resume", "Email address", "Modern template", "Working...", "Save"]));
    expect(strings).not.toEqual(expect.arrayContaining(["Sample person", "A sample biography", "Example code only"]));
    expect(strings.some((text: string) => text.includes("You are") || text.includes('"""'))).toBe(false);
  });
  it("keeps coverage truthful and removes obsolete generated entries", () => {
    expect(catalogPayload("es", ["Save", "Cancel"], { Save: "Guardar", obsolete: "Antiguo" })).toEqual({ language: "es", translations: { Save: "Guardar" }, coverage: { total: 2, missing: 1 } });
  });
});
