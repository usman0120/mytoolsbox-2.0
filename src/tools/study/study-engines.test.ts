import { describe, expect, it } from "vitest";
import { DAY, NEW_STATE, nextLabel, parseCards, queue, review, toCsv, type Card } from "./flashcards/engine";
import { compile, intersections, niceStep, roots, sample } from "./graphing-calculator/engine";
import { ELEMENTS, electronConfig, findElement } from "./periodic-table/engine";

const now = Date.UTC(2026, 0, 1);

describe("spaced repetition", () => {
  it("graduates a new card and grows the interval", () => {
    let s = review(NEW_STATE, 3, now);
    expect(s.interval).toBe(1);
    s = review(s, 3, now);
    expect(s.interval).toBe(6);
    s = review(s, 3, now);
    expect(s.interval).toBe(15);
    expect(s.due).toBe(now + 15 * DAY);
  });

  it("relearns a forgotten card and lowers its ease", () => {
    const learned = review(review(NEW_STATE, 3, now), 3, now);
    const lapse = review(learned, 1, now);
    expect(lapse.interval).toBe(0);
    expect(lapse.lapses).toBe(1);
    expect(lapse.ease).toBeCloseTo(2.3);
    expect(lapse.due).toBe(now + 60_000);
  });

  it("orders due cards before new ones and limits new cards", () => {
    const mk = (id: string, due: number): Card => ({ ...NEW_STATE, id, front: id, back: id, due });
    const q = queue([mk("new1", 0), mk("late", now - 5), mk("future", now + DAY), mk("new2", 0), mk("older", now - 50)], now, 1);
    expect(q.map((c) => c.id)).toEqual(["older", "late", "new1"]);
  });

  it("labels the next interval", () => {
    expect(nextLabel(NEW_STATE, 1, now)).toBe("1 min");
    expect(nextLabel(NEW_STATE, 2, now)).toBe("10 min");
    expect(nextLabel(NEW_STATE, 4, now)).toBe("4 d");
  });

  it("keeps commas inside colon definitions", () => {
    expect(parseCards("Mitochondria: powerhouse, of the cell")).toEqual([{ front: "Mitochondria", back: "powerhouse, of the cell" }]);
  });

  it("parses pasted lists and CSV", () => {
    expect(parseCards("cell - basic unit of life\nATP: energy currency\nDNA\tgenetic material\n\"a, b\",c")).toEqual([
      { front: "cell", back: "basic unit of life" },
      { front: "ATP", back: "energy currency" },
      { front: "DNA", back: "genetic material" },
      { front: "a, b", back: "c" },
    ]);
    expect(toCsv([{ front: "a, b", back: "say \"hi\"" }])).toBe('"a, b","say ""hi"""');
  });
});

describe("graphing", () => {
  it("compiles with implicit multiplication and functions", () => {
    expect(compile("y = 2x^2 + 3x - 1")(2)).toBe(13);
    expect(compile("sin(pi/2)")(0)).toBeCloseTo(1);
    expect(compile("2(x+1)(x-1)")(3)).toBe(16);
    expect(compile("|x - 5|")(2)).toBe(3);
    expect(compile("e^x")(1)).toBeCloseTo(Math.E);
    expect(() => compile("2 ** foo")).toThrow(/Unknown/);
    expect(() => compile("(x+1")).toThrow(/Expected/);
  });

  it("finds roots and intersections, not asymptotes", () => {
    expect(roots(compile("x^2 - 4"), -10, 10).map((r) => +r.toFixed(6))).toEqual([-2, 2]);
    expect(roots(compile("1/x"), -5, 5)).toEqual([]);
    expect(intersections(compile("x"), compile("x^2"), -5, 5).map((r) => +r.toFixed(6))).toEqual([0, 1]);
  });

  it("splits curves at asymptotes", () => {
    expect(sample(compile("1/x"), -1, 1, 200, 2).length).toBe(2);
  });

  it("picks nice grid steps", () => {
    expect(niceStep(20)).toBe(2);
    expect(niceStep(0.9)).toBe(0.1);
  });
});

describe("periodic table", () => {
  it("has all 118 elements in the right places", () => {
    expect(ELEMENTS).toHaveLength(118);
    const fe = ELEMENTS[25];
    expect([fe.symbol, fe.period, fe.group, fe.category, fe.block]).toEqual(["Fe", 4, 8, "transition", "d"]);
    expect(ELEMENTS[56]).toMatchObject({ symbol: "La", group: null, category: "lanthanide", row: 9 });
    expect(ELEMENTS[71]).toMatchObject({ symbol: "Hf", group: 4, period: 6 });
    expect(ELEMENTS.every((e) => e.mass > 0)).toBe(true);
  });

  it("writes electron configurations, including exceptions", () => {
    expect(electronConfig(8)).toBe("[He] 2s² 2p⁴");
    expect(electronConfig(26)).toBe("[Ar] 3d⁶ 4s²");
    expect(electronConfig(29)).toBe("[Ar] 3d¹⁰ 4s¹");
    expect(electronConfig(82)).toBe("[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²");
  });

  it("searches by symbol, name or number", () => {
    expect(findElement("fe")[0].name).toBe("Iron");
    expect(findElement("gol")[0].symbol).toBe("Au");
    expect(findElement("92")[0].symbol).toBe("U");
  });
});
