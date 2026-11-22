// Shared calculator engine (blueprint section 22: a manifest of fields + a pure compute function).
// Engines import nothing heavy, so they run in Vitest and render on any page.

export interface Unit {
  id: string;
  label: string;
  /** Multiply a value in this unit by `factor` to get the base unit (offset for temperatures). */
  factor: number;
  offset?: number;
}

export type Field =
  | { key: string; label: string; type: "number"; default?: number; units?: Unit[]; min?: number; max?: number; step?: number; help?: string; optional?: boolean; prefix?: string; suffix?: string }
  | { key: string; label: string; type: "select"; options: [string, string][]; default: string; help?: string }
  | { key: string; label: string; type: "date" | "datetime"; default?: "today" | "now" | string; help?: string; optional?: boolean }
  | { key: string; label: string; type: "text"; default?: string; placeholder?: string; help?: string };

/** Values passed to compute: numbers already converted to the field's base unit; blank optional numbers are null. */
export type Values = Record<string, number | string | null>;

export interface Chart {
  kind: "line" | "bars";
  labels: string[];
  series: { name: string; values: number[] }[];
  /** Format for axis/tooltip values. */
  format?: "number" | "money" | "percent";
}

export interface CalcResult {
  primary: { label: string; value: string; sub?: string };
  rows?: { label: string; value: string }[];
  table?: { head: string[]; rows: string[][]; caption?: string };
  chart?: Chart;
  /** One or two plain sentences describing what the numbers mean. */
  note?: string;
}

export interface CalcDef {
  fields: Field[];
  compute: (v: Values) => CalcResult | { error: string };
  /** KaTeX source, one formula per entry. */
  formulas?: string[];
  /** How the result is worked out, in plain words. */
  method?: string;
  disclaimer?: "health" | "finance";
  sources?: { label: string; url: string }[];
}

export const num = (n: number, dp = 2) =>
  Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 }) : "—";
export const money = (n: number, dp = 0) =>
  Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: dp }) : "—";
export const pct = (n: number, dp = 1) => `${num(n, dp)}%`;

/** Significant-figure formatting for science results (avoids 0.000000123 and 1.23e+21 noise). */
export function sci(n: number, sig = 4): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const a = Math.abs(n);
  if (a >= 1e-3 && a < 1e7) return Number(n.toPrecision(sig)).toLocaleString("en-US", { maximumFractionDigits: 10 });
  const [m, e] = n.toExponential(sig - 1).split("e");
  return `${Number(m)} × 10^${Number(e)}`;
}

export const err = (error: string) => ({ error });
