"use client";

import "katex/dist/katex.min.css";
import { useEffect, useMemo, useState } from "react";
import katex from "katex";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSavedItem } from "@/lib/workspace/use-saved-item";
import { cn } from "@/lib/utils";
import type { CalcDef, CalcResult, Chart, Field, Values } from "@/lib/calc/types";

type Raw = Record<string, string>;

const today = () => new Date().toLocaleDateString("en-CA");
const now = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

function initial(fields: Field[]): { raw: Raw; units: Raw } {
  const raw: Raw = {};
  const units: Raw = {};
  // Client-only component (see ui-registry): the share link's query string seeds the inputs.
  const q = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  for (const f of fields) {
    const d =
      f.type === "date" ? (f.default === "today" || !f.default ? (f.optional ? "" : today()) : f.default) : f.type === "datetime" ? (f.default === "now" || !f.default ? now() : f.default) : f.default;
    raw[f.key] = q.get(f.key) ?? (d === undefined ? "" : String(d));
    if (f.type === "number" && f.units) units[f.key] = q.get(`${f.key}_u`) ?? f.units[0].id;
  }
  return { raw, units };
}

function parse(fields: Field[], raw: Raw, units: Raw): { values: Values } | { error: string } {
  const v: Values = {};
  for (const f of fields) {
    const s = (raw[f.key] ?? "").trim();
    if (f.type === "number") {
      if (!s) {
        if (f.optional) {
          v[f.key] = null;
          continue;
        }
        return { error: `Enter ${f.label.toLowerCase()}.` };
      }
      const n = Number(s.replace(/,/g, ""));
      if (!Number.isFinite(n)) return { error: `${f.label} must be a number.` };
      const u = f.units?.find((x) => x.id === units[f.key]) ?? f.units?.[0];
      const base = u ? n * u.factor + (u.offset ?? 0) : n;
      if (f.min !== undefined && base < f.min) return { error: `${f.label} must be at least ${f.min}${u ? ` ${f.units![0].label}` : ""}.` };
      if (f.max !== undefined && base > f.max) return { error: `${f.label} must be at most ${f.max}${u ? ` ${f.units![0].label}` : ""}.` };
      v[f.key] = base;
    } else if ((f.type === "date" || f.type === "datetime") && !s && !f.optional) return { error: `Enter ${f.label.toLowerCase()}.` };
    else v[f.key] = s || null;
  }
  return { values: v };
}

export function CalcTemplate({ def, toolId, title }: { def: CalcDef; toolId: string; title: string }) {
  const [{ raw, units }, setState] = useState(() => initial(def.fields));
  const set = (key: string, value: string) => setState((s) => ({ ...s, raw: { ...s.raw, [key]: value } }));
  const setUnit = (key: string, unit: string) => setState((s) => ({ ...s, units: { ...s.units, [key]: unit } }));

  const result = useMemo(() => {
    const p = parse(def.fields, raw, units);
    if ("error" in p) return p;
    try {
      return def.compute(p.values);
    } catch {
      return { error: "Check the values; this combination can't be calculated." };
    }
  }, [def, raw, units]);

  // Keep the address bar in sync so the page URL is always a share link.
  useEffect(() => {
    const t = setTimeout(() => {
      const q = new URLSearchParams();
      for (const f of def.fields) {
        if (raw[f.key]) q.set(f.key, raw[f.key]);
        if (f.type === "number" && f.units && units[f.key] !== f.units[0].id) q.set(`${f.key}_u`, units[f.key]);
      }
      history.replaceState(history.state, "", `${location.pathname}?${q}`);
    }, 400);
    return () => clearTimeout(t);
  }, [def, raw, units]);

  const { save, saving } = useSavedItem("calc", toolId, () => undefined);
  const ok = !("error" in result);

  const summary = () => {
    if (!ok) return "";
    const r = result as CalcResult;
    const inputs = def.fields.map((f) => `${f.label}: ${raw[f.key]}${f.type === "number" && f.units ? ` ${f.units.find((u) => u.id === units[f.key])?.label ?? ""}` : f.type === "select" ? "" : ""}`).join("\n");
    return `${title}\n\n${inputs}\n\n${r.primary.label}: ${r.primary.value}${r.primary.sub ? ` (${r.primary.sub})` : ""}\n${(r.rows ?? []).map((x) => `${x.label}: ${x.value}`).join("\n")}\n\n${location.href}`;
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <form className="space-y-4 self-start rounded-xl border bg-card p-4" onSubmit={(e) => e.preventDefault()} aria-label="Inputs">
        {def.fields.map((f) => (
          <FieldInput key={f.key} f={f} value={raw[f.key] ?? ""} unit={units[f.key]} onChange={(v) => set(f.key, v)} onUnit={(u) => setUnit(f.key, u)} />
        ))}
      </form>

      <div className="min-w-0 space-y-4">
        <section aria-live="polite" className="rounded-xl border bg-card p-5">
          {ok ? (
            <ResultView r={result as CalcResult} />
          ) : (
            <p className="text-sm text-muted-foreground">{(result as { error: string }).error}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
            <Button variant="outline" size="sm" disabled={!ok} onClick={() => navigator.clipboard.writeText(location.href).then(() => toast.success("Link copied. It opens with these numbers."))}>
              Copy link
            </Button>
            <Button variant="ghost" size="sm" disabled={!ok} onClick={() => navigator.clipboard.writeText(summary()).then(() => toast.success("Result copied"))}>
              Copy result
            </Button>
            <Button variant="ghost" size="sm" disabled={!ok || saving} onClick={() => save(`${title}: ${(result as CalcResult).primary.value}`, summary())}>
              Save
            </Button>
          </div>
        </section>

        {(def.formulas?.length || def.method) && (
          <section className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold">How it&apos;s calculated</h2>
            {def.formulas?.map((tex) => (
              <div key={tex} className="mt-3 overflow-x-auto" dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: true, throwOnError: false }) }} />
            ))}
            {def.method && <p className="mt-3 text-sm leading-6 text-muted-foreground">{def.method}</p>}
          </section>
        )}

        {def.disclaimer && (
          <p className="text-xs leading-5 text-muted-foreground">
            {def.disclaimer === "health"
              ? "For general information only, not medical advice. Results are estimates for healthy adults; ask a doctor or dietitian about your situation."
              : "Estimates for planning only, not financial advice. Real rates, fees and rules vary by lender and country."}
            {def.sources?.length ? (
              <>
                {" "}
                Sources:{" "}
                {def.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && ", "}
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                      {s.label}
                    </a>
                  </span>
                ))}
                .
              </>
            ) : null}
          </p>
        )}
      </div>
    </div>
  );
}

function FieldInput({ f, value, unit, onChange, onUnit }: { f: Field; value: string; unit?: string; onChange: (v: string) => void; onUnit: (u: string) => void }) {
  const id = `f-${f.key}`;
  const base = "h-10 w-full min-w-0 rounded-lg border bg-background px-3 text-[15px] outline-none focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/30";
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {f.label}
        {"optional" in f && f.optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
      </Label>
      {f.type === "select" ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={base}>
          {f.options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      ) : f.type === "number" ? (
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            {f.prefix && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">{f.prefix}</span>}
            <input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className={cn(base, "tabular", f.prefix && "pl-8", f.suffix && "pr-10")} autoComplete="off" />
            {f.suffix && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">{f.suffix}</span>}
          </div>
          {f.units && f.units.length > 1 && (
            <select aria-label={`${f.label} unit`} value={unit} onChange={(e) => onUnit(e.target.value)} className="h-10 shrink-0 rounded-lg border bg-background px-2 text-sm">
              {f.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          )}
          {f.units && f.units.length === 1 && <span className="flex h-10 items-center text-sm text-muted-foreground">{f.units[0].label}</span>}
        </div>
      ) : (
        <input
          id={id}
          type={f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : "text"}
          value={value}
          placeholder={f.type === "text" ? f.placeholder : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={base}
          autoComplete="off"
          spellCheck={false}
        />
      )}
      {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
    </div>
  );
}

function ResultView({ r }: { r: CalcResult }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">{r.primary.label}</p>
        <p className="tabular mt-1 text-[34px] leading-tight font-bold break-words md:text-[40px]">{r.primary.value}</p>
        {r.primary.sub && <p className="mt-1 text-sm text-muted-foreground">{r.primary.sub}</p>}
      </div>
      {r.rows && r.rows.length > 0 && (
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {r.rows.map((x) => (
            <div key={x.label} className="flex items-baseline justify-between gap-3 border-b border-dashed py-1.5 text-sm">
              <dt className="text-muted-foreground">{x.label}</dt>
              <dd className="tabular text-right font-medium">{x.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {r.note && <p className="text-sm leading-6 text-muted-foreground">{r.note}</p>}
      {r.chart && <ChartView c={r.chart} />}
      {r.table && (
        <div className="max-h-80 overflow-auto rounded-lg border">
          <table className="tabular w-full text-sm">
            {r.table.caption && <caption className="sr-only">{r.table.caption}</caption>}
            <thead className="sticky top-0 bg-muted text-left">
              <tr>
                {r.table.head.map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.table.rows.map((row, i) => (
                <tr key={i} className="border-t">
                  {row.map((c, j) => (
                    <td key={j} className="px-3 py-1.5">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const SERIES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];
const short = (n: number) => {
  const a = Math.abs(n);
  return a >= 1e9 ? `${+(n / 1e9).toFixed(1)}B` : a >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : a >= 1e3 ? `${+(n / 1e3).toFixed(1)}k` : `${+n.toFixed(2)}`;
};

function ChartView({ c }: { c: Chart }) {
  const W = 640, H = 220, L = 48, B = 24, T = 8, R = 8;
  const n = c.labels.length;
  const stacked = c.kind === "bars";
  const totals = c.labels.map((_, i) => (stacked ? c.series.reduce((s, x) => s + Math.max(0, x.values[i] ?? 0), 0) : Math.max(...c.series.map((x) => x.values[i] ?? 0))));
  const min = stacked ? 0 : Math.min(0, ...c.series.flatMap((s) => s.values));
  const max = Math.max(...totals, min + 1e-9);
  const y = (v: number) => T + (H - T - B) * (1 - (v - min) / (max - min));
  const x = (i: number) => L + ((W - L - R) * (n <= 1 ? 0.5 : i / (n - 1)));
  const bw = Math.max(2, ((W - L - R) / Math.max(n, 1)) * 0.7);
  const bx = (i: number) => L + ((W - L - R) * (i + 0.5)) / n - bw / 2;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => min + (max - min) * k);
  const every = Math.max(1, Math.ceil(n / 8));

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={c.series.map((s) => s.name).join(" and ")}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-border" strokeWidth="1" />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
              {short(t)}
            </text>
          </g>
        ))}
        {c.labels.map((l, i) =>
          i % every === 0 || i === n - 1 ? (
            <text key={i} x={stacked ? bx(i) + bw / 2 : x(i)} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[11px]">
              {l}
            </text>
          ) : null,
        )}
        {stacked
          ? c.labels.map((_, i) => {
              let acc = 0;
              return c.series.map((s, k) => {
                const v = Math.max(0, s.values[i] ?? 0);
                const top = y(acc + v), bottom = y(acc);
                acc += v;
                return <rect key={`${i}-${k}`} x={bx(i)} y={top} width={bw} height={Math.max(0, bottom - top)} fill={SERIES[k % 3]} rx="1.5" />;
              });
            })
          : c.series.map((s, k) => <polyline key={s.name} fill="none" stroke={SERIES[k % 3]} strokeWidth="2.5" strokeLinejoin="round" points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />)}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {c.series.map((s, k) => (
          <span key={s.name} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: SERIES[k % 3] }} />
            {s.name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
