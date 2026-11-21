import { describe, expect, it } from "vitest";
import { parseModelJson } from "./parse-json";

const BS = "\\";

describe("parseModelJson", () => {
  it("keeps LaTeX commands written with single backslashes", () => {
    const reply = `{"answer":"25${BS}pi ${BS}text{ cm}^2","half":"${BS}frac{1}{2}","times":"2 ${BS}times 3"}`;
    expect(parseModelJson(reply)).toEqual({ answer: `25${BS}pi ${BS}text{ cm}^2`, half: `${BS}frac{1}{2}`, times: `2 ${BS}times 3` });
  });

  it("leaves correctly escaped LaTeX and normal escapes alone", () => {
    const reply = `{"a":"${BS}${BS}frac{1}{2}","b":"line1${BS}nline2","q":"say ${BS}"hi${BS}""}`;
    expect(parseModelJson(reply)).toEqual({ a: `${BS}frac{1}{2}`, b: "line1\nline2", q: 'say "hi"' });
  });

  it("strips code fences and surrounding prose", () => {
    expect(parseModelJson('Here you go:\n```json\n{"x": 1}\n```')).toEqual({ x: 1 });
  });

  it("returns null for unusable replies", () => {
    expect(parseModelJson("no json here")).toBeNull();
    expect(parseModelJson('{"x": }')).toBeNull();
  });
});
