"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABEL, ELEMENTS, findElement, type Category, type Element } from "./engine";

// Muted category tints that work in light and dark themes.
const TINT: Record<Category, string> = {
  alkali: "bg-rose-500/15",
  "alkaline-earth": "bg-orange-500/15",
  transition: "bg-sky-500/12",
  "post-transition": "bg-teal-500/15",
  metalloid: "bg-lime-500/15",
  nonmetal: "bg-emerald-500/15",
  halogen: "bg-yellow-500/18",
  "noble-gas": "bg-violet-500/15",
  lanthanide: "bg-pink-500/12",
  actinide: "bg-fuchsia-500/12",
};

const massText = (e: Element) => (e.z > 94 || ["Tc", "Pm", "Po", "At", "Rn", "Fr", "Ra", "Ac"].includes(e.symbol) ? `(${Math.round(e.mass)})` : String(+e.mass.toFixed(3)));

export function PeriodicTable() {
  const [selected, setSelected] = useState<Element>(ELEMENTS[5]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | null>(null);
  const details = useRef<HTMLElement>(null);
  const pick = (e: Element) => {
    setSelected(e);
    // Below the xl breakpoint the details sit under the table; bring them into view.
    if (window.innerWidth < 1280) requestAnimationFrame(() => details.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };
  const matches = useMemo(() => new Set(findElement(q).map((e) => e.z)), [q]);
  const dim = (e: Element) => (q.trim() && !matches.has(e.z)) || (cat && e.category !== cat);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 basis-56">
          <span className="sr-only">Find an element</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              const hit = findElement(e.target.value)[0];
              if (hit) setSelected(hit);
            }}
            placeholder="Find by name, symbol or number"
            className="h-10 w-full rounded-lg border bg-card pr-3 pl-9 text-sm outline-none focus-visible:border-foreground/30"
          />
        </label>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 overflow-x-auto rounded-xl border bg-card p-2">
          <div role="grid" aria-label="Periodic table" className="grid min-w-[760px] grid-cols-18 gap-[3px]" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}>
            {ELEMENTS.map((e) => (
              <button
                key={e.z}
                type="button"
                role="gridcell"
                aria-label={`${e.name}, ${e.z}`}
                aria-selected={selected.z === e.z}
                onClick={() => pick(e)}
                style={{ gridRow: e.row, gridColumn: e.col }}
                className={cn(
                  "flex aspect-square min-w-0 flex-col items-center justify-center rounded-[5px] leading-none transition",
                  TINT[e.category],
                  selected.z === e.z ? "ring-2 ring-foreground" : "hover:ring-1 hover:ring-foreground/40",
                  dim(e) && "opacity-25",
                )}
              >
                <span className="text-[9px] text-muted-foreground">{e.z}</span>
                <span className="text-[15px] font-semibold">{e.symbol}</span>
              </button>
            ))}
            <span className="flex items-center justify-center text-[10px] text-muted-foreground" style={{ gridRow: 6, gridColumn: 3 }}>
              57–71
            </span>
            <span className="flex items-center justify-center text-[10px] text-muted-foreground" style={{ gridRow: 7, gridColumn: 3 }}>
              89–103
            </span>
            <div style={{ gridRow: 8, gridColumn: "1 / -1" }} className="h-2" />
          </div>
        </div>

        <aside ref={details} className="scroll-mt-20 self-start rounded-xl border bg-card p-4" aria-live="polite">
          <div className={cn("flex size-20 flex-col items-center justify-center rounded-lg", TINT[selected.category])}>
            <span className="text-xs text-muted-foreground">{selected.z}</span>
            <span className="text-3xl font-bold">{selected.symbol}</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold">{selected.name}</h2>
          <p className="text-sm text-muted-foreground">{CATEGORY_LABEL[selected.category]}</p>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ["Atomic number", String(selected.z)],
              ["Atomic mass", `${massText(selected)} u`],
              ["Period", String(selected.period)],
              ["Group", selected.group ? String(selected.group) : "f-block"],
              ["Block", `${selected.block}-block`],
              ["Electron configuration", selected.config],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-dashed pb-1.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="tabular text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <Link href={`/calc/molar-mass-calculator?formula=${encodeURIComponent(selected.symbol)}`} className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline">
            Molar mass of a compound →
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">Masses in brackets are for the most stable known isotope.</p>
        </aside>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Highlight a category">
        {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cat === c}
            onClick={() => setCat(cat === c ? null : c)}
            className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs", cat === c ? "border-foreground" : "hover:border-foreground/30")}
          >
            <span className={cn("size-3 rounded-sm", TINT[c])} />
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
    </div>
  );
}
