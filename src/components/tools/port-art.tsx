import type { Port, PortType } from "@/tools/types";
import { cn } from "@/lib/utils";

// Tiny "before → after" illustration drawn from a tool's real input/output ports
// (blueprint section 6: live cards, not icons in boxes).

function Sheet({ x, children, label, tint }: { x: number; children?: React.ReactNode; label: string; tint: string }) {
  return (
    <g transform={`translate(${x} 6)`}>
      <path d="M0 3a3 3 0 0 1 3-3h17l8 8v26a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3z" fill="var(--card)" stroke="currentColor" strokeOpacity=".35" />
      <path d="M20 0v8h8" fill="none" stroke="currentColor" strokeOpacity=".35" />
      {children}
      <rect x="-3" y="25" width={label.length * 5.2 + 8} height="11" rx="2.5" fill={tint} />
      <text x={label.length * 2.6 + 1} y="33" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#fff" fontFamily="var(--font-geist-mono)">
        {label}
      </text>
    </g>
  );
}

const LINES = (
  <g stroke="currentColor" strokeOpacity=".3" strokeLinecap="round">
    <path d="M5 12h14M5 16h16M5 20h10" />
  </g>
);

const MOUNTAIN = (
  <g>
    <circle cx="9" cy="12" r="2.4" fill="currentColor" fillOpacity=".3" />
    <path d="M3 22l6-6 4 4 3-3 7 7" fill="none" stroke="currentColor" strokeOpacity=".4" strokeLinejoin="round" />
  </g>
);

const GRID = (
  <g stroke="currentColor" strokeOpacity=".3">
    <path d="M4 11h20M4 16h20M4 21h20M11 11v13M18 11v13" />
  </g>
);

const META: Record<PortType, { label: string; tint: string; body: React.ReactNode }> = {
  pdf: { label: "PDF", tint: "#e5484d", body: LINES },
  image: { label: "JPG", tint: "#7c5cff", body: MOUNTAIN },
  video: { label: "MP4", tint: "#7c5cff", body: <path d="M10 11v10l8-5z" fill="currentColor" fillOpacity=".35" /> },
  audio: { label: "MP3", tint: "#7c5cff", body: <path d="M5 16h2l2-5 3 10 3-8 2 3h6" fill="none" stroke="currentColor" strokeOpacity=".4" /> },
  docx: { label: "DOCX", tint: "#2b6cb0", body: LINES },
  xlsx: { label: "XLSX", tint: "#15803d", body: GRID },
  csv: { label: "CSV", tint: "#57534e", body: GRID },
  zip: { label: "ZIP", tint: "#57534e", body: <path d="M14 9v14" stroke="currentColor" strokeOpacity=".4" strokeDasharray="2 2" /> },
  text: { label: "TXT", tint: "#57534e", body: LINES },
  markdown: { label: "MD", tint: "#57534e", body: LINES },
  json: { label: "JSON", tint: "#10b981", body: LINES },
  code: { label: "CODE", tint: "#10b981", body: LINES },
  table: { label: "TABLE", tint: "#15803d", body: GRID },
  number: { label: "123", tint: "#f59e0b", body: LINES },
  mermaid: { label: "DIAG", tint: "#ff5fa2", body: LINES },
  "design-scene": { label: "DSGN", tint: "#ff5fa2", body: MOUNTAIN },
  "any-file": { label: "FILE", tint: "#57534e", body: LINES },
};

function stack(port: Port, x: number, override?: string) {
  const m = META[port.type];
  const label = override ?? m.label;
  return (
    <g key={x}>
      {port.many && <Sheet x={x + 5} label="" tint="transparent" />}
      <Sheet x={x} label={label} tint={m.tint}>
        {m.body}
      </Sheet>
    </g>
  );
}

export function PortArt({ input, output, className, inputLabel, outputLabel }: { input: Port[]; output: Port[]; className?: string; inputLabel?: string; outputLabel?: string }) {
  const from = input[0] ?? { type: "any-file" as const };
  const to = output[0] ?? { type: "any-file" as const };
  return (
    <svg viewBox="0 0 120 48" className={cn("h-12 w-[120px] text-foreground", className)} aria-hidden="true">
      {stack(from, 8, inputLabel)}
      <path d="M50 24h18m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeOpacity=".45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {stack(to, 76, outputLabel)}
    </svg>
  );
}

/** Picture for any manifest: real ports for file/text tools, a template-specific pair otherwise. */
export function ToolArt({ tool, className }: { tool: { template: string; input: Port[]; output: Port[] }; className?: string }) {
  if (tool.template === "ai") return <PortArt input={[{ type: "text" }]} output={[{ type: "markdown" }]} inputLabel="ASK" outputLabel="AI" className={className} />;
  if (tool.template === "calculator") return <PortArt input={[{ type: "number" }]} output={[{ type: "table" }]} inputLabel="123" outputLabel="=" className={className} />;
  if (tool.template === "editor") return <PortArt input={[{ type: "design-scene" }]} output={tool.output.length ? tool.output : [{ type: "pdf" }]} inputLabel="EDIT" className={className} />;
  if (!tool.input.length) return <PortArt input={[{ type: "text" }]} output={tool.output.length ? tool.output : [{ type: "text" }]} className={className} />;
  return <PortArt input={tool.input} output={tool.output} className={className} />;
}
