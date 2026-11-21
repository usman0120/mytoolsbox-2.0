import { describe, expect, it } from "vitest";
import { evaluate, verifySolutions } from "./verify";

describe("evaluate", () => {
  it.each([
    ["2+3*4", {}, 14],
    ["(2+3)*4", {}, 20],
    ["2^3^2", {}, 512],
    ["-3^2", {}, -9],
    ["2x+5", { x: 4 }, 13],
    ["3(x+1)", { x: 2 }, 9],
    ["x^2-5x+6", { x: 3 }, 0],
    ["sqrt(16)+abs(-2)", {}, 6],
    ["2pi", {}, 2 * Math.PI],
    ["log(1000)", {}, 3],
    ["ln(e)", {}, 1],
    ["6/2(1+2)", {}, 9],
  ])("%s", (expr, vars, expected) => expect(evaluate(expr, vars)).toBeCloseTo(expected, 9));

  it("rejects code and unknown names", () => {
    expect(() => evaluate("alert(1)")).toThrow();
    expect(() => evaluate("2+;")).toThrow();
    expect(() => evaluate("y+1", { x: 1 })).toThrow();
  });
});

describe("verifySolutions", () => {
  it("confirms correct roots", () => {
    expect(verifySolutions("2*x+5=13", "x", [4])).toBe("match");
    expect(verifySolutions("x^2-5x+6=0", "x", [2, 3])).toBe("match");
  });
  it("flags a wrong root", () => {
    expect(verifySolutions("x^2-5x+6=0", "x", [2, 4])).toBe("mismatch");
  });
  it("does not guess when it cannot check", () => {
    expect(verifySolutions("not an equation", "x", [1])).toBe("unchecked");
    expect(verifySolutions("sqrt(x)=-1", "x", [-1])).toBe("unchecked");
  });
});
