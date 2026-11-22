"use client";

import "katex/dist/katex.min.css";
import { useMemo, useState } from "react";
import katex from "katex";
import { Copy, Printer, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SHEETS } from "./sheets";

const render = (tex: string) => katex.renderToString(tex, { displayMode: true, throwOnError: false });

export function FormulaSheets() {
  const [sheetId, setSheetId] = useState(SHEETS[0].id);
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const shown = useMemo(() => {
    if (!query) return SHEETS.filter((s) => s.id === sheetId);
    return SHEETS.map((s) => ({
      ...s,
      sections: s.sections.map((sec) => ({ ...sec, items: sec.items.filter((f) => `${f.name} ${f.note ?? ""} ${sec.title} ${s.title}`.toLowerCase().includes(query)) })).filter((sec) => sec.items.length),
    })).filter((s) => s.sections.length);
  }, [sheetId, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <label className="relative min-w-0 flex-1 basis-56">
          <span className="sr-only">Search formulas</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all sheets, e.g. quadratic, area, Ohm" className="h-10 w-full rounded-lg border bg-card pr-3 pl-9 text-sm outline-none focus-visible:border-foreground/30" />
        </label>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="size-4" /> Print sheet
        </Button>
      </div>

      {!query && (
        <div role="tablist" aria-label="Sheets" className="flex flex-wrap gap-1.5 print:hidden">
          {SHEETS.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={s.id === sheetId}
              onClick={() => setSheetId(s.id)}
              className={cn("rounded-full border px-3 py-1.5 text-sm", s.id === sheetId ? "border-foreground bg-foreground text-background" : "hover:border-foreground/30")}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      <div data-print-area className="space-y-8">
        {shown.length === 0 && <p className="text-sm text-muted-foreground">No formulas match “{q}”.</p>}
        {shown.map((sheet) => (
          <section key={sheet.id}>
            {(query || shown.length > 1) && <h2 className="mb-3 text-lg font-semibold">{sheet.title}</h2>}
            <div className="space-y-6">
              {sheet.sections.map((sec) => (
                <div key={sec.title}>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{sec.title}</h3>
                  <ul className="grid gap-2 md:grid-cols-2 print:grid-cols-2">
                    {sec.items.map((f) => (
                      <li key={f.name} className="group relative rounded-lg border bg-card px-4 py-3 break-inside-avoid">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{f.name}</p>
                          <button
                            type="button"
                            aria-label={`Copy LaTeX for ${f.name}`}
                            onClick={() => navigator.clipboard.writeText(f.tex).then(() => toast.success("LaTeX copied"))}
                            className="-mt-1 -mr-1 rounded-md p-1.5 text-muted-foreground opacity-60 hover:bg-muted hover:text-foreground group-hover:opacity-100 print:hidden"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                        <div className="overflow-x-auto text-[15px]" dangerouslySetInnerHTML={{ __html: render(f.tex) }} />
                        {f.note && <p className="text-xs text-muted-foreground">{f.note}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
