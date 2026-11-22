import { err, num, sci, type CalcDef, type Unit } from "../types";

/* ---------- Fractions ---------- */

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));

/** Parses "3/4", "1 1/2", "-2", "0.75" into [numerator, denominator]. */
export function parseFraction(s: string): [number, number] | null {
  const t = s.trim();
  let m = /^(-)?(\d+)\s+(\d+)\/(\d+)$/.exec(t);
  if (m) {
    const d = Number(m[4]);
    if (!d) return null;
    const n = Number(m[2]) * d + Number(m[3]);
    return [m[1] ? -n : n, d];
  }
  m = /^(-?\d+)\/(-?\d+)$/.exec(t);
  if (m) return Number(m[2]) ? [Number(m[1]), Number(m[2])] : null;
  if (/^-?\d*\.?\d+$/.test(t)) {
    const dec = (t.split(".")[1] ?? "").length;
    const d = 10 ** Math.min(dec, 9);
    return [Math.round(Number(t) * d), d];
  }
  return null;
}

export function simplify([n, d]: [number, number]): [number, number] {
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
}

const show = ([n, d]: [number, number]) => (d === 1 ? String(n) : `${n}/${d}`);
const mixed = ([n, d]: [number, number]) => {
  if (d === 1 || Math.abs(n) < d) return show([n, d]);
  const w = Math.trunc(n / d);
  return `${w} ${Math.abs(n % d)}/${d}`;
};

export const fraction: CalcDef = {
  fields: [
    { key: "a", label: "First fraction", type: "text", default: "3/4", placeholder: "e.g. 3/4 or 1 1/2" },
    { key: "op", label: "Operation", type: "select", default: "+", options: [["+", "Add (+)"], ["-", "Subtract (−)"], ["*", "Multiply (×)"], ["/", "Divide (÷)"]] },
    { key: "b", label: "Second fraction", type: "text", default: "2/3", placeholder: "e.g. 2/3" },
  ],
  compute: (v) => {
    const a = parseFraction(String(v.a ?? "")), b = parseFraction(String(v.b ?? ""));
    if (!a || !b) return err("Enter fractions like 3/4, 1 1/2 or 0.25.");
    let r: [number, number];
    if (v.op === "+") r = [a[0] * b[1] + b[0] * a[1], a[1] * b[1]];
    else if (v.op === "-") r = [a[0] * b[1] - b[0] * a[1], a[1] * b[1]];
    else if (v.op === "*") r = [a[0] * b[0], a[1] * b[1]];
    else {
      if (!b[0]) return err("You can't divide by zero.");
      r = [a[0] * b[1], a[1] * b[0]];
    }
    const s = simplify(r);
    return {
      primary: { label: "Result", value: show(s), sub: s[1] !== 1 && Math.abs(s[0]) > s[1] ? `Mixed number: ${mixed(s)}` : undefined },
      rows: [
        { label: "Decimal", value: num(s[0] / s[1], 6) },
        { label: "Before simplifying", value: show(r) },
        { label: "Percentage", value: `${num((s[0] / s[1]) * 100, 4)}%` },
      ],
    };
  },
  formulas: ["\\frac{a}{b} \\pm \\frac{c}{d} = \\frac{ad \\pm bc}{bd}", "\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd} \\qquad \\frac{a}{b} \\div \\frac{c}{d} = \\frac{ad}{bc}"],
  method: "The result is reduced by dividing the top and bottom by their greatest common divisor.",
};

/* ---------- Ohm's law ---------- */

export const ohm: CalcDef = {
  fields: [
    { key: "V", label: "Voltage", type: "number", optional: true, units: [{ id: "V", label: "V", factor: 1 }, { id: "mV", label: "mV", factor: 1e-3 }, { id: "kV", label: "kV", factor: 1e3 }] },
    { key: "I", label: "Current", type: "number", optional: true, units: [{ id: "A", label: "A", factor: 1 }, { id: "mA", label: "mA", factor: 1e-3 }] },
    { key: "R", label: "Resistance", type: "number", optional: true, units: [{ id: "ohm", label: "Ω", factor: 1 }, { id: "k", label: "kΩ", factor: 1e3 }, { id: "M", label: "MΩ", factor: 1e6 }] },
    { key: "P", label: "Power", type: "number", optional: true, units: [{ id: "W", label: "W", factor: 1 }, { id: "mW", label: "mW", factor: 1e-3 }, { id: "kW", label: "kW", factor: 1e3 }] },
  ],
  compute: (v) => {
    let { V, I, R, P } = v as Record<string, number | null>;
    const known = [V, I, R, P].filter((x) => x !== null).length;
    if (known !== 2) return err("Enter exactly two values; the other two are calculated.");
    if (V !== null && I !== null) { R = V / I; P = V * I; }
    else if (V !== null && R !== null) { I = V / R; P = (V * V) / R; }
    else if (V !== null && P !== null) { I = P / V; R = (V * V) / P; }
    else if (I !== null && R !== null) { V = I * R; P = I * I * R; }
    else if (I !== null && P !== null) { V = P / I; R = P / (I * I); }
    else if (R !== null && P !== null) { V = Math.sqrt(P * R); I = Math.sqrt(P / R); }
    if (![V, I, R, P].every((x) => Number.isFinite(x as number))) return err("These values can't be combined (division by zero).");
    return {
      primary: { label: "Results", value: `${sci(V!)} V · ${sci(I!)} A` },
      rows: [
        { label: "Voltage (V)", value: `${sci(V!)} V` },
        { label: "Current (I)", value: `${sci(I!)} A` },
        { label: "Resistance (R)", value: `${sci(R!)} Ω` },
        { label: "Power (P)", value: `${sci(P!)} W` },
      ],
    };
  },
  formulas: ["V = IR \\qquad P = VI = I^2R = \\frac{V^2}{R}"],
  method: "Enter any two of voltage, current, resistance and power. Leave the other two blank.",
};

/* ---------- Kinematics (SUVAT) ---------- */

const M: Unit[] = [{ id: "m", label: "m", factor: 1 }, { id: "km", label: "km", factor: 1000 }, { id: "ft", label: "ft", factor: 0.3048 }];
const MS: Unit[] = [{ id: "ms", label: "m/s", factor: 1 }, { id: "kmh", label: "km/h", factor: 1 / 3.6 }, { id: "mph", label: "mph", factor: 0.44704 }];

export const kinematics: CalcDef = {
  fields: [
    { key: "s", label: "Displacement (s)", type: "number", optional: true, units: M },
    { key: "u", label: "Initial velocity (u)", type: "number", optional: true, units: MS },
    { key: "v", label: "Final velocity (v)", type: "number", optional: true, units: MS },
    { key: "a", label: "Acceleration (a)", type: "number", optional: true, units: [{ id: "ms2", label: "m/s²", factor: 1 }, { id: "g", label: "g", factor: 9.80665 }] },
    { key: "t", label: "Time (t)", type: "number", optional: true, units: [{ id: "s", label: "s", factor: 1 }, { id: "min", label: "min", factor: 60 }, { id: "h", label: "h", factor: 3600 }] },
  ],
  compute: (vals) => {
    let { s, u, v, a, t } = vals as Record<string, number | null>;
    const k = [s, u, v, a, t].filter((x) => x !== null).length;
    if (k !== 3) return err("Enter exactly three of s, u, v, a and t.");
    if (u !== null && a !== null && t !== null) { v = u + a * t; s = u * t + 0.5 * a * t * t; }
    else if (u !== null && v !== null && t !== null) { a = (v - u) / t; s = ((u + v) / 2) * t; }
    else if (u !== null && v !== null && a !== null) { if (!a) return err("Acceleration can't be zero here."); t = (v - u) / a; s = (v * v - u * u) / (2 * a); }
    else if (s !== null && u !== null && t !== null) { a = (2 * (s - u * t)) / (t * t); v = u + a * t; }
    else if (s !== null && v !== null && t !== null) { a = (2 * (v * t - s)) / (t * t); u = v - a * t; }
    else if (s !== null && u !== null && v !== null) { if (u + v === 0) return err("u + v can't be zero."); t = (2 * s) / (u + v); a = (v - u) / t; }
    else if (s !== null && a !== null && t !== null) { u = s / t - 0.5 * a * t; v = u + a * t; }
    else if (s !== null && u !== null && a !== null) {
      const d = u * u + 2 * a * s;
      if (d < 0) return err("No real solution: the object never reaches that displacement.");
      v = Math.sqrt(d);
      t = a ? (v - u) / a : s / u;
    } else if (s !== null && v !== null && a !== null) {
      const d = v * v - 2 * a * s;
      if (d < 0) return err("No real solution for these values.");
      u = Math.sqrt(d);
      t = a ? (v - u) / a : s / v;
    } else if (v !== null && a !== null && t !== null) { u = v - a * t; s = v * t - 0.5 * a * t * t; }
    if (t !== null && t < 0) return err("These values give a negative time. Check the signs.");
    return {
      primary: { label: "Solved", value: `t = ${sci(t!)} s` },
      rows: [
        { label: "s", value: `${sci(s!)} m` },
        { label: "u", value: `${sci(u!)} m/s` },
        { label: "v", value: `${sci(v!)} m/s` },
        { label: "a", value: `${sci(a!)} m/s²` },
        { label: "t", value: `${sci(t!)} s` },
      ],
    };
  },
  formulas: ["v = u + at \\qquad s = ut + \\tfrac12 at^2 \\qquad v^2 = u^2 + 2as \\qquad s = \\tfrac{u+v}{2}\\,t"],
  method: "Equations for constant acceleration. Enter any three values; use negative numbers for the opposite direction.",
};

export const projectile: CalcDef = {
  fields: [
    { key: "v0", label: "Launch speed", type: "number", default: 20, units: MS, min: 0 },
    { key: "angle", label: "Launch angle", type: "number", default: 45, suffix: "°", min: 0, max: 90 },
    { key: "h0", label: "Launch height", type: "number", default: 0, units: M, min: 0 },
    { key: "g", label: "Gravity", type: "select", default: "9.80665", options: [["9.80665", "Earth (9.81 m/s²)"], ["1.62", "Moon (1.62 m/s²)"], ["3.721", "Mars (3.72 m/s²)"], ["24.79", "Jupiter (24.8 m/s²)"]] },
  ],
  compute: (v) => {
    const v0 = v.v0 as number, th = ((v.angle as number) * Math.PI) / 180, h0 = v.h0 as number, g = Number(v.g);
    const vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
    const T = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g;
    if (!Number.isFinite(T) || T <= 0) return err("Enter a launch speed above zero.");
    const range = vx * T, hMax = h0 + (vy * vy) / (2 * g);
    const steps = 30, labels: string[] = [], ys: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (T * i) / steps;
      labels.push(sci(vx * t, 3));
      ys.push(Math.max(0, h0 + vy * t - 0.5 * g * t * t));
    }
    return {
      primary: { label: "Range", value: `${sci(range)} m` },
      rows: [
        { label: "Time of flight", value: `${sci(T)} s` },
        { label: "Maximum height", value: `${sci(hMax)} m` },
        { label: "Time to peak", value: `${sci(vy / g)} s` },
        { label: "Impact speed", value: `${sci(Math.hypot(vx, vy - g * T))} m/s` },
      ],
      chart: { kind: "line", labels, series: [{ name: "Height (m) over distance (m)", values: ys }] },
      note: "Ignores air resistance.",
    };
  },
  formulas: ["T = \\frac{v_0\\sin\\theta + \\sqrt{(v_0\\sin\\theta)^2 + 2gh_0}}{g}", "R = v_0\\cos\\theta \\cdot T \\qquad H = h_0 + \\frac{(v_0\\sin\\theta)^2}{2g}"],
};

/* ---------- Chemistry ---------- */

// Standard atomic weights (IUPAC, abridged to 4–5 significant figures).
const W =
  "H 1.008 He 4.0026 Li 6.94 Be 9.0122 B 10.81 C 12.011 N 14.007 O 15.999 F 18.998 Ne 20.180 Na 22.990 Mg 24.305 Al 26.982 Si 28.085 P 30.974 S 32.06 Cl 35.45 Ar 39.948 K 39.098 Ca 40.078 Sc 44.956 Ti 47.867 V 50.942 Cr 51.996 Mn 54.938 Fe 55.845 Co 58.933 Ni 58.693 Cu 63.546 Zn 65.38 Ga 69.723 Ge 72.630 As 74.922 Se 78.971 Br 79.904 Kr 83.798 Rb 85.468 Sr 87.62 Y 88.906 Zr 91.224 Nb 92.906 Mo 95.95 Tc 98 Ru 101.07 Rh 102.91 Pd 106.42 Ag 107.87 Cd 112.41 In 114.82 Sn 118.71 Sb 121.76 Te 127.60 I 126.90 Xe 131.29 Cs 132.91 Ba 137.33 La 138.91 Ce 140.12 Pr 140.91 Nd 144.24 Pm 145 Sm 150.36 Eu 151.96 Gd 157.25 Tb 158.93 Dy 162.50 Ho 164.93 Er 167.26 Tm 168.93 Yb 173.05 Lu 174.97 Hf 178.49 Ta 180.95 W 183.84 Re 186.21 Os 190.23 Ir 192.22 Pt 195.08 Au 196.97 Hg 200.59 Tl 204.38 Pb 207.2 Bi 208.98 Po 209 At 210 Rn 222 Fr 223 Ra 226 Ac 227 Th 232.04 Pa 231.04 U 238.03 Np 237 Pu 244 Am 243 Cm 247 Bk 247 Cf 251 Es 252 Fm 257";
export const ATOMIC: Record<string, number> = Object.fromEntries(W.match(/[A-Z][a-z]? [\d.]+/g)!.map((p) => [p.split(" ")[0], Number(p.split(" ")[1])]));

/** Parses formulas like H2O, Ca(OH)2, CuSO4·5H2O, [Fe(CN)6]3- (charge ignored) into element counts. */
export function parseFormula(formula: string): Record<string, number> {
  const parts = formula.replace(/\s+/g, "").replace(/[+-]\d*$|\d*[+-]$/, "").split(/[·.*]/);
  const total: Record<string, number> = {};
  for (const part of parts) {
    const lead = /^(\d+)(.*)$/.exec(part);
    const mult = lead ? Number(lead[1]) : 1;
    const body = lead ? lead[2] : part;
    const stack: Record<string, number>[] = [{}];
    let i = 0;
    const count = () => {
      const m = /^\d+/.exec(body.slice(i));
      if (!m) return 1;
      i += m[0].length;
      return Number(m[0]);
    };
    while (i < body.length) {
      const ch = body[i];
      if (ch === "(" || ch === "[") {
        stack.push({});
        i++;
      } else if (ch === ")" || ch === "]") {
        i++;
        const n = count();
        const group = stack.pop()!;
        if (!stack.length) throw new Error("Unbalanced brackets");
        for (const [el, c] of Object.entries(group)) stack.at(-1)![el] = (stack.at(-1)![el] ?? 0) + c * n;
      } else {
        const m = /^[A-Z][a-z]?/.exec(body.slice(i));
        if (!m || !(m[0] in ATOMIC)) throw new Error(`Unknown element at "${body.slice(i, i + 3)}"`);
        i += m[0].length;
        stack.at(-1)![m[0]] = (stack.at(-1)![m[0]] ?? 0) + count();
      }
    }
    if (stack.length !== 1) throw new Error("Unbalanced brackets");
    for (const [el, c] of Object.entries(stack[0])) total[el] = (total[el] ?? 0) + c * mult;
  }
  return total;
}

export const molarMass: CalcDef = {
  fields: [
    { key: "formula", label: "Chemical formula", type: "text", default: "CuSO4·5H2O", placeholder: "e.g. H2SO4, Ca(OH)2", help: "Case matters: Co is cobalt, CO is carbon monoxide. Use · or . for hydrates." },
    { key: "mass", label: "Mass (to convert to moles)", type: "number", optional: true, units: [{ id: "g", label: "g", factor: 1 }, { id: "mg", label: "mg", factor: 1e-3 }, { id: "kg", label: "kg", factor: 1e3 }] },
  ],
  compute: (v) => {
    const f = String(v.formula ?? "").trim();
    if (!f) return err("Enter a formula.");
    let counts: Record<string, number>;
    try {
      counts = parseFormula(f);
    } catch (e) {
      return err(e instanceof Error ? e.message : "Couldn't read that formula.");
    }
    const mm = Object.entries(counts).reduce((s, [el, c]) => s + ATOMIC[el] * c, 0);
    if (!mm) return err("Couldn't read that formula.");
    const mass = v.mass as number | null;
    return {
      primary: { label: "Molar mass", value: `${num(mm, 3)} g/mol` },
      rows: mass ? [{ label: "Moles in that mass", value: `${sci(mass / mm)} mol` }] : undefined,
      table: {
        head: ["Element", "Atoms", "Mass (g/mol)", "Mass %"],
        rows: Object.entries(counts).map(([el, c]) => [el, String(c), num(ATOMIC[el] * c, 3), `${num(((ATOMIC[el] * c) / mm) * 100, 2)}%`]),
        caption: "Composition by element",
      },
    };
  },
  formulas: ["M = \\sum_i n_i\\,A_i \\qquad n = \\frac{m}{M}"],
  method: "Adds the standard atomic weight A of each element times the number of atoms n. Mass percent is each element's share of the total.",
};

const CONC: Unit[] = [{ id: "M", label: "M (mol/L)", factor: 1 }, { id: "mM", label: "mM", factor: 1e-3 }, { id: "uM", label: "µM", factor: 1e-6 }, { id: "pct", label: "% (w/v)", factor: 1 }];
const VOL: Unit[] = [{ id: "mL", label: "mL", factor: 1 }, { id: "L", label: "L", factor: 1000 }, { id: "uL", label: "µL", factor: 1e-3 }];

export const dilution: CalcDef = {
  fields: [
    { key: "c1", label: "Stock concentration (C₁)", type: "number", optional: true, units: CONC },
    { key: "v1", label: "Stock volume (V₁)", type: "number", optional: true, units: VOL },
    { key: "c2", label: "Final concentration (C₂)", type: "number", optional: true, units: CONC },
    { key: "v2", label: "Final volume (V₂)", type: "number", optional: true, units: VOL },
  ],
  compute: (v) => {
    let { c1, v1, c2, v2 } = v as Record<string, number | null>;
    const blank = [c1, v1, c2, v2].filter((x) => x === null).length;
    if (blank !== 1) return err("Fill in three values and leave the one to find blank.");
    if (c1 === null) c1 = (c2! * v2!) / v1!;
    else if (v1 === null) v1 = (c2! * v2!) / c1;
    else if (c2 === null) c2 = (c1 * v1) / v2!;
    else v2 = (c1 * v1) / c2;
    if (![c1, v1, c2, v2].every((x) => Number.isFinite(x!) && x! > 0)) return err("Values must be above zero.");
    if (c2! > c1!) return err("The final concentration can't be higher than the stock.");
    return {
      primary: { label: "Take", value: `${sci(v1!)} mL of stock`, sub: `and add ${sci(v2! - v1!)} mL of solvent to make ${sci(v2!)} mL` },
      rows: [
        { label: "C₁", value: sci(c1!) },
        { label: "C₂", value: sci(c2!) },
        { label: "Dilution factor", value: `1 : ${sci(c1! / c2!, 3)}` },
      ],
      note: "Concentrations are shown in the base unit of the first unit option (mol/L, or % if you used %). Use the same kind of unit for C₁ and C₂.",
    };
  },
  formulas: ["C_1V_1 = C_2V_2"],
};

export const idealGas: CalcDef = {
  fields: [
    { key: "P", label: "Pressure (P)", type: "number", optional: true, units: [{ id: "kPa", label: "kPa", factor: 1 }, { id: "atm", label: "atm", factor: 101.325 }, { id: "bar", label: "bar", factor: 100 }, { id: "mmHg", label: "mmHg", factor: 0.133322 }, { id: "psi", label: "psi", factor: 6.89476 }] },
    { key: "V", label: "Volume (V)", type: "number", optional: true, units: [{ id: "L", label: "L", factor: 1 }, { id: "mL", label: "mL", factor: 1e-3 }, { id: "m3", label: "m³", factor: 1000 }] },
    { key: "n", label: "Amount (n)", type: "number", optional: true, units: [{ id: "mol", label: "mol", factor: 1 }, { id: "mmol", label: "mmol", factor: 1e-3 }] },
    { key: "T", label: "Temperature (T)", type: "number", optional: true, units: [{ id: "K", label: "K", factor: 1 }, { id: "C", label: "°C", factor: 1, offset: 273.15 }, { id: "F", label: "°F", factor: 5 / 9, offset: 255.372 }] },
  ],
  compute: (v) => {
    const R = 8.314462618; // L·kPa/(mol·K)
    let { P, V, n, T } = v as Record<string, number | null>;
    if ([P, V, n, T].filter((x) => x === null).length !== 1) return err("Fill in three values and leave the one to find blank.");
    if (T !== null && T <= 0) return err("Temperature must be above absolute zero.");
    if (P === null) P = (n! * R * T!) / V!;
    else if (V === null) V = (n! * R * T!) / P;
    else if (n === null) n = (P * V) / (R * T!);
    else T = (P * V) / (n * R);
    return {
      primary: { label: "Result", value: `P ${sci(P!)} kPa · V ${sci(V!)} L` },
      rows: [
        { label: "Pressure", value: `${sci(P!)} kPa (${sci(P! / 101.325)} atm)` },
        { label: "Volume", value: `${sci(V!)} L` },
        { label: "Amount", value: `${sci(n!)} mol` },
        { label: "Temperature", value: `${sci(T!)} K (${num(T! - 273.15, 2)} °C)` },
      ],
    };
  },
  formulas: ["PV = nRT,\\quad R = 8.314\\ \\text{L·kPa·mol}^{-1}\\text{K}^{-1}"],
  method: "Assumes an ideal gas. Real gases deviate at high pressure and low temperature.",
};
