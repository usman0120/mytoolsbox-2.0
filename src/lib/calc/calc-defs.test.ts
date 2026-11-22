import { describe, expect, it } from "vitest";
import type { CalcDef, CalcResult, Values } from "./types";
import { compoundInterest, discount, mortgage, payment, sip, zakat } from "./defs/finance";
import { bmr, bodyFat, dueDate, egfr, egfrCkdEpi2021, idealWeight, mifflin } from "./defs/health";
import { dilution, fraction, idealGas, kinematics, molarMass, ohm, parseFormula, parseFraction, projectile, simplify } from "./defs/science";
import { businessDays, concrete, dateDiff, diffYMD, fertilizer, landArea, resistor, timeZones, wallToInstant, wireGauge } from "./defs/practical";

const run = (d: CalcDef, v: Values) => d.compute(v) as CalcResult;
const isErr = (d: CalcDef, v: Values) => "error" in d.compute(v);

describe("finance", () => {
  it("matches the standard amortisation payment", () => {
    // 240,000 at 6.5% over 30 years = 1,516.96 a month.
    expect(payment(240000, 6.5, 360)).toBeCloseTo(1516.96, 2);
    expect(payment(1200, 0, 12)).toBe(100);
    const r = run(mortgage, { price: 300000, down: 20, downMode: "pct", rate: 6.5, years: 30, extra: null });
    expect(r.primary.value).toBe("1,516.96");
    expect(r.table!.rows).toHaveLength(30);
    expect(r.table!.rows.at(-1)![3]).toBe("0");
    expect(isErr(mortgage, { price: 100, down: 100, downMode: "amt", rate: 5, years: 10, extra: null })).toBe(true);
  });

  it("compounds yearly like the textbook formula", () => {
    const r = run(compoundInterest, { principal: 1000, monthly: 0, rate: 10, years: 2, freq: "1" });
    expect(r.primary.value).toBe("1,210");
  });

  it("values a SIP as an annuity due", () => {
    // 1,000/month at 12% for 1 year: 1000 × ((1.01^12 − 1)/0.01) × 1.01 = 12,809.33
    const r = run(sip, { amount: 1000, rate: 12, years: 1, stepup: null });
    expect(r.primary.value).toBe("12,809");
  });

  it("applies zakat only above the nisab", () => {
    const base = { gold: 0, goldPrice: 0, silver: 0, silverPrice: 1, other: 0, debts: 0, nisab: "silver" };
    expect(run(zakat, { ...base, cash: 1000 }).primary.value).toBe("25.00");
    expect(run(zakat, { ...base, cash: 500 }).primary.value).toBe("0.00");
  });

  it("stacks discounts multiplicatively", () => {
    const r = run(discount, { price: 100, off: 20, extra: 10, tax: null });
    expect(r.primary.value).toBe("72.00");
  });
});

describe("health", () => {
  it("uses Mifflin-St Jeor", () => {
    expect(mifflin("male", 70, 175, 30)).toBeCloseTo(1648.75, 2);
    expect(mifflin("female", 60, 165, 30)).toBeCloseTo(1320.25, 2);
    expect(run(bmr, { sex: "male", age: 30, weight: 70, height: 175, activity: "1.2" }).primary.value).toBe("1,979 kcal/day");
  });

  it("computes U.S. Navy body fat", () => {
    const r = run(bodyFat, { sex: "male", height: 178, neck: 38, waist: 86, hip: null });
    expect(parseFloat(r.primary.value)).toBeGreaterThan(14);
    expect(parseFloat(r.primary.value)).toBeLessThan(20);
    expect(isErr(bodyFat, { sex: "female", height: 165, neck: 32, waist: 70, hip: null })).toBe(true);
  });

  it("gives the BMI-based healthy range", () => {
    expect(run(idealWeight, { sex: "female", height: 165 }).primary.value).toBe("50.4 – 67.8 kg");
  });

  it("adds 280 days to the last period", () => {
    const r = run(dueDate, { method: "lmp", date: "2026-01-01", cycle: 28, today: "2026-03-01" });
    expect(r.primary.value).toContain("October 8, 2026");
    expect(r.rows![0].value).toBe("8 weeks 3 days");
  });

  it("matches CKD-EPI 2021 reference values", () => {
    // Inker 2021: 50-year-old woman, creatinine 1.0 mg/dL ≈ 69.
    expect(Math.round(egfrCkdEpi2021(1.0, 50, true))).toBe(69);
    expect(run(egfr, { scr: 1.0, age: 50, sex: "female" }).primary.sub).toContain("G2");
  });
});

describe("maths and science", () => {
  it("parses and simplifies fractions", () => {
    expect(parseFraction("1 1/2")).toEqual([3, 2]);
    expect(parseFraction("0.25")).toEqual([25, 100]);
    expect(simplify([6, -8])).toEqual([-3, 4]);
    expect(run(fraction, { a: "3/4", op: "+", b: "2/3" }).primary.value).toBe("17/12");
    expect(isErr(fraction, { a: "1/2", op: "/", b: "0" })).toBe(true);
  });

  it("solves Ohm's law from any two values", () => {
    const r = run(ohm, { V: 12, I: null, R: 4, P: null });
    expect(r.rows!.find((x) => x.label.startsWith("Current"))!.value).toBe("3 A");
    expect(r.rows!.find((x) => x.label.startsWith("Power"))!.value).toBe("36 W");
    expect(isErr(ohm, { V: 12, I: 1, R: 4, P: null })).toBe(true);
  });

  it("solves SUVAT", () => {
    const r = run(kinematics, { s: null, u: 0, v: null, a: 9.8, t: 2 });
    expect(r.rows!.find((x) => x.label === "s")!.value).toBe("19.6 m");
    const r2 = run(kinematics, { s: null, u: null, v: 20, a: 2, t: 5 });
    expect(r2.rows!.find((x) => x.label === "u")!.value).toBe("10 m/s");
  });

  it("picks the physical root when an object lands below its start", () => {
    // Thrown up at 10 m/s, lands 20 m lower: v = −22.2 m/s, t ≈ 3.28 s.
    const r = run(kinematics, { s: -20, u: 10, v: null, a: -9.8, t: null });
    expect(parseFloat(r.rows!.find((x) => x.label === "t")!.value)).toBeCloseTo(3.285, 2);
    expect(r.rows!.find((x) => x.label === "v")!.value.startsWith("-")).toBe(true);
  });

  it("computes projectile range", () => {
    // 20 m/s at 45° on Earth: R = v²/g ≈ 40.79 m
    expect(run(projectile, { v0: 20, angle: 45, h0: 0, g: "9.80665" }).primary.value).toBe("40.79 m");
  });

  it("parses formulas with groups and hydrates", () => {
    expect(parseFormula("Ca(OH)2")).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(parseFormula("CuSO4·5H2O")).toEqual({ Cu: 1, S: 1, O: 9, H: 10 });
    expect(parseFormula("SO4^2-")).toEqual({ S: 1, O: 4 });
    expect(parseFormula("[Fe(CN)6]3-")).toEqual({ Fe: 1, C: 6, N: 6 });
    expect(parseFormula("NH4+")).toEqual({ N: 1, H: 4 });
    expect(run(molarMass, { formula: "H2O", mass: null }).primary.value).toBe("18.015 g/mol");
    expect(isErr(molarMass, { formula: "Xx2", mass: null })).toBe(true);
  });

  it("solves C1V1 = C2V2 and PV = nRT", () => {
    const r = run(dilution, { c1: 2, v1: null, c2: 0.5, v2: 100 });
    expect(r.primary.value).toBe("25 mL of stock");
    const g = run(idealGas, { P: 101.325, V: null, n: 1, T: 273.15 });
    expect(g.rows!.find((x) => x.label === "Volume")!.value).toBe("22.41 L");
  });
});

describe("engineering, dates, farming", () => {
  it("reads resistor bands", () => {
    expect(run(resistor, { bands: "4", b1: "yellow", b2: "violet", b3: "black", mult: "red", tol: "gold" }).primary.value).toBe("4.7 kΩ");
    expect(run(resistor, { bands: "5", b1: "brown", b2: "black", b3: "black", mult: "brown", tol: "brown" }).primary.value).toBe("1 kΩ");
  });

  it("converts AWG to diameter", () => {
    expect(run(wireGauge, { awg: "12", metal: "cu", length: null }).primary.value).toBe("2.053 mm");
  });

  it("estimates cement bags", () => {
    const r = run(concrete, { length: 1, width: 1, depth: 1, mix: "1:2:4", waste: 0 });
    // 1.54 m³ dry ÷ 7 × 1440 ÷ 50 = 6.336 bags → 7
    expect(r.primary.value).toBe("7 bags");
  });

  it("counts calendar differences and weekdays", () => {
    expect(diffYMD(new Date("2024-01-31T00:00:00Z"), new Date("2024-03-01T00:00:00Z"))).toEqual({ y: 0, m: 1, d: 1 });
    expect(businessDays(new Date("2026-11-16T00:00:00Z"), new Date("2026-11-23T00:00:00Z"))).toBe(5);
    expect(run(dateDiff, { start: "2026-01-01", end: "2026-12-31", include: "yes" }).primary.value).toBe("365 days");
  });

  it("converts time zones with daylight saving", () => {
    const t = wallToInstant("2026-07-01T12:00", "America/New_York")!;
    expect(t.toISOString()).toBe("2026-07-01T16:00:00.000Z");
    const r = run(timeZones, { when: "2026-01-15T09:00", from: "Asia/Karachi", to: "Europe/London" });
    expect(r.primary.value).toContain("4:00");
  });

  it("splits nutrients into products", () => {
    const r = run(fertilizer, { n: 46, p: 46, k: 50, area: 1, potash: "sop", bag: 50 });
    // P: 100 kg DAP (18 kg N), remaining 28 kg N → 60.9 kg urea; K: 100 kg SOP.
    expect(r.table!.rows.map((x) => x[1])).toEqual(["100", "60.9", "100"]);
  });

  it("converts kanal and marla", () => {
    const r = run(landArea, { value: 1, unit: "acre" });
    expect(r.table!.rows.find((x) => x[0].startsWith("Kanal"))![1]).toBe("8");
    expect(r.table!.rows.find((x) => x[0].startsWith("Marla (272"))![1]).toBe("160");
  });
});
