import { err, num, sci, type CalcDef, type Unit } from "../types";

/* ---------- Engineering ---------- */

const COLORS: [string, number | null, number | null, number | null][] = [
  // name, digit, multiplier exponent, tolerance %
  ["black", 0, 0, null],
  ["brown", 1, 1, 1],
  ["red", 2, 2, 2],
  ["orange", 3, 3, 0.05],
  ["yellow", 4, 4, 0.02],
  ["green", 5, 5, 0.5],
  ["blue", 6, 6, 0.25],
  ["violet", 7, 7, 0.1],
  ["grey", 8, 8, 0.01],
  ["white", 9, 9, null],
  ["gold", null, -1, 5],
  ["silver", null, -2, 10],
];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const digitOpts: [string, string][] = COLORS.filter((c) => c[1] !== null).map((c) => [c[0], `${cap(c[0])} (${c[1]})`]);
const multOpts: [string, string][] = COLORS.map((c) => [c[0], `${cap(c[0])} (×10${c[2]! < 0 ? "⁻" : ""}${"⁰¹²³⁴⁵⁶⁷⁸⁹"[Math.abs(c[2]!)]})`]);
const tolOpts: [string, string][] = [["none", "None (±20%)"], ...COLORS.filter((c) => c[3] !== null).map((c) => [c[0], `${cap(c[0])} (±${c[3]}%)`] as [string, string])];
const ohms = (r: number) => (r >= 1e6 ? `${num(r / 1e6, 3)} MΩ` : r >= 1e3 ? `${num(r / 1e3, 3)} kΩ` : `${num(r, 3)} Ω`);

export const resistor: CalcDef = {
  fields: [
    { key: "bands", label: "Number of bands", type: "select", default: "4", options: [["4", "4 bands"], ["5", "5 bands"]] },
    { key: "b1", label: "Band 1", type: "select", default: "brown", options: digitOpts },
    { key: "b2", label: "Band 2", type: "select", default: "black", options: [["black", "Black (0)"], ...digitOpts.filter(([v]) => v !== "black")] },
    { key: "b3", label: "Band 3 (5-band only)", type: "select", default: "black", options: [["black", "Black (0)"], ...digitOpts.filter(([v]) => v !== "black")] },
    { key: "mult", label: "Multiplier", type: "select", default: "red", options: multOpts },
    { key: "tol", label: "Tolerance", type: "select", default: "gold", options: tolOpts },
  ],
  compute: (v) => {
    const d = (k: string) => COLORS.find((c) => c[0] === v[k])![1] ?? 0;
    const digits = v.bands === "5" ? d("b1") * 100 + d("b2") * 10 + d("b3") : d("b1") * 10 + d("b2");
    const exp = COLORS.find((c) => c[0] === v.mult)![2]!;
    const r = digits * Math.pow(10, exp);
    const tol = v.tol === "none" ? 20 : COLORS.find((c) => c[0] === v.tol)![3]!;
    return {
      primary: { label: "Resistance", value: ohms(r), sub: `±${tol}%` },
      rows: [
        { label: "Minimum", value: ohms(r * (1 - tol / 100)) },
        { label: "Maximum", value: ohms(r * (1 + tol / 100)) },
      ],
      note: "Read from the end without the gap; the tolerance band (often gold) is usually set apart from the others.",
    };
  },
  formulas: ["R = (\\text{digits}) \\times 10^{\\text{multiplier}}"],
};

export const wireGauge: CalcDef = {
  fields: [
    { key: "awg", label: "AWG size", type: "select", default: "12", options: ["0000", "000", "00", "0", ...Array.from({ length: 40 }, (_, i) => String(i + 1))].map((g) => [g, g.length > 1 && g.startsWith("0") ? `${g.length}/0 (${g})` : `AWG ${g}`]) },
    { key: "metal", label: "Conductor", type: "select", default: "cu", options: [["cu", "Copper"], ["al", "Aluminium"]] },
    { key: "length", label: "Cable length (one way)", type: "number", optional: true, units: [{ id: "m", label: "m", factor: 1 }, { id: "ft", label: "ft", factor: 0.3048 }] },
  ],
  compute: (v) => {
    const g = String(v.awg);
    const n = g.startsWith("0") && g.length > 1 ? -(g.length - 1) : Number(g);
    const dmm = 0.127 * Math.pow(92, (36 - n) / 39);
    const area = (Math.PI / 4) * dmm * dmm;
    const rho = v.metal === "al" ? 2.82e-8 : 1.724e-8;
    const ohmPerKm = (rho / (area * 1e-6)) * 1000;
    const len = v.length as number | null;
    return {
      primary: { label: "Diameter", value: `${num(dmm, 3)} mm`, sub: `${num(dmm / 25.4, 4)} in` },
      rows: [
        { label: "Cross-section", value: `${num(area, 3)} mm²` },
        { label: "Area (kcmil)", value: num((dmm / 0.0254) ** 2 / 1000, 2) },
        { label: "Resistance", value: `${num(ohmPerKm, 3)} Ω/km` },
        ...(len ? [{ label: "Round-trip resistance", value: `${sci((ohmPerKm * 2 * len) / 1000)} Ω` }] : []),
      ],
      note: "Current rating depends on insulation, installation and local electrical code; check the code before choosing a cable.",
    };
  },
  formulas: ["d_{mm} = 0.127 \\times 92^{(36-n)/39} \\qquad R = \\frac{\\rho L}{A}"],
  method: "Resistivity at 20 °C: copper 1.724×10⁻⁸ Ω·m, aluminium 2.82×10⁻⁸ Ω·m.",
};

const LEN: Unit[] = [{ id: "m", label: "m", factor: 1 }, { id: "ft", label: "ft", factor: 0.3048 }, { id: "in", label: "in", factor: 0.0254 }, { id: "cm", label: "cm", factor: 0.01 }];
const MIXES: Record<string, [number, number, number, string]> = {
  "1:1.5:3": [1, 1.5, 3, "M20: columns, beams, slabs"],
  "1:2:4": [1, 2, 4, "M15: floors, light slabs"],
  "1:3:6": [1, 3, 6, "M10: foundations, levelling (PCC)"],
  "1:4:8": [1, 4, 8, "M7.5: lean concrete"],
};

export const concrete: CalcDef = {
  fields: [
    { key: "length", label: "Length", type: "number", default: 4, units: LEN, min: 0 },
    { key: "width", label: "Width", type: "number", default: 3, units: LEN, min: 0 },
    { key: "depth", label: "Thickness or depth", type: "number", default: 0.1, units: LEN, min: 0 },
    { key: "mix", label: "Mix ratio (cement : sand : aggregate)", type: "select", default: "1:2:4", options: Object.entries(MIXES).map(([k, m]) => [k, `${k} · ${m[3]}`]) },
    { key: "waste", label: "Wastage", type: "number", default: 5, suffix: "%", min: 0, max: 30 },
  ],
  compute: (v) => {
    const wet = (v.length as number) * (v.width as number) * (v.depth as number);
    if (!wet) return err("Enter all three dimensions.");
    const [c, s, a] = MIXES[v.mix as string];
    const dry = wet * 1.54 * (1 + (v.waste as number) / 100);
    const sum = c + s + a;
    const cementM3 = (dry * c) / sum;
    const bags = (cementM3 * 1440) / 50;
    const sand = (dry * s) / sum, agg = (dry * a) / sum;
    const cft = 35.3147;
    return {
      primary: { label: "Cement", value: `${num(Math.ceil(bags), 0)} bags`, sub: `50 kg bags (${num(bags, 1)} exact)` },
      rows: [
        { label: "Concrete volume", value: `${num(wet, 3)} m³ (${num(wet * cft, 1)} ft³)` },
        { label: "Sand", value: `${num(sand, 2)} m³ (${num(sand * cft, 0)} ft³)` },
        { label: "Aggregate (crush)", value: `${num(agg, 2)} m³ (${num(agg * cft, 0)} ft³)` },
        { label: "Water (approx.)", value: `${num(bags * 50 * 0.5, 0)} litres` },
      ],
      note: "Dry volume is 1.54 × wet volume to allow for voids and shrinkage. Water assumes a 0.5 water–cement ratio. Ask your engineer for structural work.",
    };
  },
  formulas: ["V_{dry} = 1.54\\,V_{wet}\\,(1+w) \\qquad \\text{Cement bags} = \\frac{V_{dry}\\cdot\\frac{c}{c+s+a}\\cdot 1440}{50}"],
  method: "Cement density 1440 kg/m³. 1 m³ = 35.31 ft³.",
};

/* ---------- Date and time ---------- */

const DAY = 86400000;
const toDay = (s: string) => {
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Whole months from a (clamped to month end, e.g. Jan 31 + 1 month = Feb 28/29), then leftover days. */
export function diffYMD(a: Date, b: Date) {
  const add = (months: number) => {
    const y = a.getUTCFullYear() + Math.floor((a.getUTCMonth() + months) / 12);
    const m = (((a.getUTCMonth() + months) % 12) + 12) % 12;
    const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    return new Date(Date.UTC(y, m, Math.min(a.getUTCDate(), last)));
  };
  let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
  if (add(months) > b) months--;
  const d = Math.round((b.getTime() - add(months).getTime()) / DAY);
  return { y: Math.floor(months / 12), m: months % 12, d };
}

export function businessDays(a: Date, b: Date) {
  let count = 0;
  for (let t = a.getTime(); t < b.getTime(); t += DAY) {
    const wd = new Date(t).getUTCDay();
    if (wd !== 0 && wd !== 6) count++;
  }
  return count;
}

export const dateDiff: CalcDef = {
  fields: [
    { key: "start", label: "Start date", type: "date", default: "2026-01-01" },
    { key: "end", label: "End date", type: "date", default: "today" },
    { key: "include", label: "Count the end date", type: "select", default: "no", options: [["no", "No (difference)"], ["yes", "Yes (inclusive)"]] },
  ],
  compute: (v) => {
    let a = toDay(v.start as string), b = toDay(v.end as string);
    if (!a || !b) return err("Enter both dates.");
    const swapped = a > b;
    if (swapped) [a, b] = [b, a];
    const extra = v.include === "yes" ? 1 : 0;
    const days = Math.round((b.getTime() - a.getTime()) / DAY) + extra;
    const { y, m, d } = diffYMD(a, new Date(b.getTime() + extra * DAY));
    const parts = [y && `${y} year${y > 1 ? "s" : ""}`, m && `${m} month${m > 1 ? "s" : ""}`, (d || (!y && !m)) && `${d} day${d === 1 ? "" : "s"}`].filter(Boolean).join(", ");
    return {
      primary: { label: "Difference", value: `${num(days, 0)} days`, sub: parts },
      rows: [
        { label: "Weeks", value: `${Math.floor(days / 7)} weeks ${days % 7} days` },
        { label: "Weekdays (Mon–Fri)", value: num(businessDays(a, new Date(b.getTime() + extra * DAY)), 0) },
        { label: "Hours", value: num(days * 24, 0) },
        { label: "Months (approx.)", value: num(days / 30.4375, 1) },
      ],
      note: swapped ? "The end date is before the start date; the dates were swapped." : undefined,
    };
  },
};

export const ZONES: [string, string][] = [
  ["UTC", "UTC"], ["America/Los_Angeles", "Los Angeles"], ["America/Denver", "Denver"], ["America/Chicago", "Chicago"], ["America/New_York", "New York"], ["America/Toronto", "Toronto"],
  ["America/Sao_Paulo", "São Paulo"], ["Europe/London", "London"], ["Europe/Paris", "Paris, Berlin"], ["Europe/Istanbul", "Istanbul"], ["Europe/Moscow", "Moscow"], ["Africa/Cairo", "Cairo"],
  ["Africa/Lagos", "Lagos"], ["Africa/Nairobi", "Nairobi"], ["Asia/Riyadh", "Riyadh"], ["Asia/Dubai", "Dubai"], ["Asia/Tehran", "Tehran"], ["Asia/Karachi", "Karachi"], ["Asia/Kolkata", "India"],
  ["Asia/Dhaka", "Dhaka"], ["Asia/Bangkok", "Bangkok, Jakarta"], ["Asia/Shanghai", "Beijing, Singapore"], ["Asia/Tokyo", "Tokyo"], ["Australia/Sydney", "Sydney"], ["Pacific/Auckland", "Auckland"],
];

/** Offset in minutes of `zone` at the given instant (positive east of UTC). */
export function zoneOffset(zone: string, at: Date): number {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(at).map((x) => [x.type, x.value]));
  return Math.round((Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - at.getTime()) / 60000);
}

/** Interprets a wall-clock "YYYY-MM-DDTHH:mm" in `zone` as an instant. */
export function wallToInstant(wall: string, zone: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(wall);
  if (!m) return null;
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let t = guess - zoneOffset(zone, new Date(guess)) * 60000;
  t = guess - zoneOffset(zone, new Date(t)) * 60000;
  return new Date(t);
}

const fmtIn = (d: Date, zone: string) => d.toLocaleString("en-US", { timeZone: zone, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const off = (min: number) => `UTC${min >= 0 ? "+" : "−"}${Math.floor(Math.abs(min) / 60)}${Math.abs(min) % 60 ? `:${String(Math.abs(min) % 60).padStart(2, "0")}` : ""}`;

export const timeZones: CalcDef = {
  fields: [
    { key: "when", label: "Date and time", type: "datetime", default: "now" },
    { key: "from", label: "In time zone", type: "select", default: "Asia/Karachi", options: ZONES },
    { key: "to", label: "Convert to", type: "select", default: "America/New_York", options: ZONES },
  ],
  compute: (v) => {
    const t = wallToInstant(String(v.when), String(v.from));
    if (!t) return err("Enter a date and time.");
    const to = String(v.to), from = String(v.from);
    const diff = (zoneOffset(to, t) - zoneOffset(from, t)) / 60;
    return {
      primary: { label: ZONES.find((z) => z[0] === to)![1], value: fmtIn(t, to), sub: `${off(zoneOffset(to, t))} · ${diff === 0 ? "same time" : `${Math.abs(diff)} h ${diff > 0 ? "ahead" : "behind"}`}` },
      table: { head: ["City", "Local time", "Offset"], rows: ZONES.filter((z) => z[0] !== "UTC").map(([id, name]) => [name, fmtIn(t, id), off(zoneOffset(id, t))]), caption: "Same moment around the world" },
      note: "Daylight saving time is applied automatically for the chosen date.",
    };
  },
};

/* ---------- Agriculture ---------- */

const PER_AREA: Unit[] = [{ id: "acre", label: "kg/acre", factor: 1 }, { id: "ha", label: "kg/ha", factor: 1 / 2.47105 }];
const AREA: Unit[] = [{ id: "acre", label: "acres", factor: 1 }, { id: "ha", label: "hectares", factor: 2.47105 }, { id: "kanal", label: "kanal", factor: 1 / 8 }];

export const fertilizer: CalcDef = {
  fields: [
    { key: "n", label: "Nitrogen needed (N)", type: "number", default: 50, units: PER_AREA, min: 0, help: "From your soil test or extension advice" },
    { key: "p", label: "Phosphorus needed (P₂O₅)", type: "number", default: 23, units: PER_AREA, min: 0 },
    { key: "k", label: "Potash needed (K₂O)", type: "number", default: 25, units: PER_AREA, min: 0 },
    { key: "area", label: "Area", type: "number", default: 1, units: AREA, min: 0 },
    { key: "potash", label: "Potash source", type: "select", default: "sop", options: [["sop", "SOP, sulphate of potash (0-0-50)"], ["mop", "MOP, muriate of potash (0-0-60)"]] },
    { key: "bag", label: "Bag size", type: "number", default: 50, suffix: "kg", min: 1 },
  ],
  compute: (v) => {
    const area = v.area as number;
    const P = (v.p as number) * area, N = (v.n as number) * area, K = (v.k as number) * area;
    // DAP (18-46-0) covers phosphorus and part of the nitrogen; urea (46-0-0) the rest of the nitrogen.
    const dap = P / 0.46;
    const nLeft = Math.max(0, N - dap * 0.18);
    const urea = nLeft / 0.46;
    const kFrac = v.potash === "mop" ? 0.6 : 0.5;
    const potash = K / kFrac;
    const bag = v.bag as number;
    const rows = [
      ["DAP (18-46-0)", dap],
      ["Urea (46-0-0)", urea],
      [v.potash === "mop" ? "MOP (0-0-60)" : "SOP (0-0-50)", potash],
    ] as [string, number][];
    return {
      primary: { label: "Total fertilizer", value: `${num(dap + urea + potash, 1)} kg`, sub: `for ${num(area, 2)} acres` },
      table: { head: ["Product", "Kilograms", `Bags (${bag} kg)`], rows: rows.map(([n, kg]) => [n, num(kg, 1), num(kg / bag, 2)]), caption: "Products to buy" },
      note: N < dap * 0.18 ? "DAP alone already supplies more nitrogen than needed." : "Split urea into 2–3 doses through the season; apply DAP and potash at sowing. Follow your soil test.",
    };
  },
  formulas: ["\\text{DAP} = \\frac{P_2O_5}{0.46} \\qquad \\text{Urea} = \\frac{N - 0.18\\,\\text{DAP}}{0.46} \\qquad \\text{Potash} = \\frac{K_2O}{0.5 \\text{ or } 0.6}"],
  method: "Nutrient amounts are per acre (or hectare) of the nutrient itself, not of the product. The area converts them to totals.",
};

export const LAND_UNITS: Record<string, [string, number]> = {
  // name, square feet
  sqft: ["Square feet", 1],
  sqm: ["Square metres", 10.7639104],
  sqyd: ["Square yards", 9],
  marla: ["Marla (272.25 sq ft)", 272.25],
  marla225: ["Marla (225 sq ft, housing schemes)", 225],
  kanal: ["Kanal (20 marla)", 5445],
  acre: ["Acre", 43560],
  hectare: ["Hectare", 107639.104],
  murabba: ["Murabba (25 acres)", 1089000],
  sqkarm: ["Square karam (sarsai × 9)", 30.25],
};

export const landArea: CalcDef = {
  fields: [
    { key: "value", label: "Area", type: "number", default: 1, min: 0 },
    { key: "unit", label: "Unit", type: "select", default: "kanal", options: Object.entries(LAND_UNITS).map(([k, [n]]) => [k, n]) },
  ],
  compute: (v) => {
    const sqft = (v.value as number) * LAND_UNITS[v.unit as string][1];
    return {
      primary: { label: "In square feet", value: `${num(sqft, 2)} sq ft`, sub: `${num(sqft / 10.7639104, 2)} m²` },
      table: { head: ["Unit", "Value"], rows: Object.entries(LAND_UNITS).filter(([k]) => k !== v.unit).map(([, [n, f]]) => [n, num(sqft / f, 4)]), caption: "Conversions" },
      note: "Marla size differs by area: revenue records use 272.25 sq ft; many housing societies use 225 sq ft. Check which one your document uses.",
    };
  },
  formulas: ["1\\ \\text{acre} = 8\\ \\text{kanal} = 160\\ \\text{marla} = 43{,}560\\ \\text{ft}^2"],
};
