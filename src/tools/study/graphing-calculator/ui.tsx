"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Download, Minus, Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { download } from "@/lib/image/canvas";
import { cn } from "@/lib/utils";
import { compile, intersections, niceStep, roots, sample } from "./engine";

const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#ea580c", "#0891b2"];
type View = { cx: number; cy: number; ppu: number };
const DEFAULT_VIEW: View = { cx: 0, cy: 0, ppu: 40 };
const fmt = (n: number) => (Math.abs(n) < 1e-9 ? "0" : +n.toPrecision(5) + "");

function initialExprs(): string[] {
  // Client-only component: restore functions from the share link.
  const q = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).getAll("f");
  return q && q.length ? q.slice(0, 6) : ["x^2 - 4", "2sin(x)"];
}

export function GraphingCalculator() {
  const { resolvedTheme } = useTheme();
  const [exprs, setExprs] = useState<string[]>(initialExprs);
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [hover, setHover] = useState<{ px: number; py: number; x: number } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 420 });
  const drag = useRef<{ x: number; y: number; v: View } | null>(null);

  const compiled = useMemo(
    () =>
      exprs.map((e) => {
        if (!e.trim()) return { fn: null, error: null };
        try {
          return { fn: compile(e), error: null };
        } catch (err) {
          return { fn: null, error: err instanceof Error ? err.message : "Invalid" };
        }
      }),
    [exprs],
  );

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: Math.max(320, Math.min(560, el.clientWidth * 0.62)) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const q = new URLSearchParams();
      exprs.filter((e) => e.trim()).forEach((e) => q.append("f", e));
      history.replaceState(history.state, "", `${location.pathname}?${q}`);
    }, 400);
    return () => clearTimeout(t);
  }, [exprs]);

  const toX = useCallback((px: number) => view.cx + (px - size.w / 2) / view.ppu, [view, size]);
  const range = { x0: toX(0), x1: toX(size.w), y0: view.cy - size.h / 2 / view.ppu, y1: view.cy + size.h / 2 / view.ppu };

  // Draw
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = size.w * dpr;
    c.height = size.h * dpr;
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement);
    const fg = css.getPropertyValue("--foreground").trim() || "#111";
    const muted = css.getPropertyValue("--muted-foreground").trim() || "#888";
    const border = css.getPropertyValue("--border").trim() || "#ddd";
    const sx = (x: number) => size.w / 2 + (x - view.cx) * view.ppu;
    const sy = (y: number) => size.h / 2 - (y - view.cy) * view.ppu;
    ctx.fillStyle = css.getPropertyValue("--card").trim() || "#fff";
    ctx.fillRect(0, 0, size.w, size.h);

    const step = niceStep(size.w / view.ppu, Math.max(6, size.w / 80));
    ctx.lineWidth = 1;
    ctx.strokeStyle = border;
    ctx.fillStyle = muted;
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.beginPath();
    for (let x = Math.ceil(range.x0 / step) * step; x <= range.x1; x += step) {
      ctx.moveTo(Math.round(sx(x)) + 0.5, 0);
      ctx.lineTo(Math.round(sx(x)) + 0.5, size.h);
    }
    for (let y = Math.ceil(range.y0 / step) * step; y <= range.y1; y += step) {
      ctx.moveTo(0, Math.round(sy(y)) + 0.5);
      ctx.lineTo(size.w, Math.round(sy(y)) + 0.5);
    }
    ctx.stroke();

    // Axes and labels
    ctx.strokeStyle = fg;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(sy(0)) + 0.5);
    ctx.lineTo(size.w, Math.round(sy(0)) + 0.5);
    ctx.moveTo(Math.round(sx(0)) + 0.5, 0);
    ctx.lineTo(Math.round(sx(0)) + 0.5, size.h);
    ctx.stroke();
    ctx.globalAlpha = 1;
    const ax = Math.min(Math.max(sy(0) + 14, 14), size.h - 4);
    const ay = Math.min(Math.max(sx(0) - 6, 30), size.w - 4);
    ctx.textAlign = "center";
    for (let x = Math.ceil(range.x0 / step) * step; x <= range.x1; x += step) if (Math.abs(x) > step / 2) ctx.fillText(fmt(x), sx(x), ax);
    ctx.textAlign = "right";
    for (let y = Math.ceil(range.y0 / step) * step; y <= range.y1; y += step) if (Math.abs(y) > step / 2) ctx.fillText(fmt(y), ay, sy(y) + 4);

    // Curves
    compiled.forEach(({ fn }, i) => {
      if (!fn || hidden.has(i)) return;
      ctx.strokeStyle = COLORS[i % COLORS.length];
      ctx.lineWidth = 2.25;
      ctx.lineJoin = "round";
      for (const seg of sample(fn, range.x0, range.x1, Math.ceil(size.w * 1.5), range.y1 - range.y0)) {
        ctx.beginPath();
        seg.forEach(([x, y], k) => {
          const py = Math.max(-1e4, Math.min(1e4, sy(y)));
          if (k === 0) ctx.moveTo(sx(x), py);
          else ctx.lineTo(sx(x), py);
        });
        ctx.stroke();
      }
    });

    // Trace
    if (hover) {
      ctx.strokeStyle = muted;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hover.px + 0.5, 0);
      ctx.lineTo(hover.px + 0.5, size.h);
      ctx.stroke();
      ctx.setLineDash([]);
      compiled.forEach(({ fn }, i) => {
        if (!fn || hidden.has(i)) return;
        const y = fn(hover.x);
        if (!Number.isFinite(y)) return;
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.beginPath();
        ctx.arc(sx(hover.x), sy(y), 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [compiled, hidden, view, size, hover, resolvedTheme, range.x0, range.x1, range.y0, range.y1]);

  // Points of interest in the visible range.
  const points = useMemo(() => {
    const out: { label: string; x: number; y: number; color: string }[] = [];
    const vis = compiled.map((c, i) => ({ ...c, i })).filter((c) => c.fn && !hidden.has(c.i));
    for (const { fn, i } of vis) {
      roots(fn!, range.x0, range.x1, 1500).slice(0, 8).forEach((x) => out.push({ label: `f${i + 1} = 0`, x, y: 0, color: COLORS[i] }));
      const y0 = fn!(0);
      if (Number.isFinite(y0) && range.x0 < 0 && range.x1 > 0) out.push({ label: `f${i + 1} y-intercept`, x: 0, y: y0, color: COLORS[i] });
    }
    for (let a = 0; a < vis.length; a++)
      for (let b = a + 1; b < vis.length; b++)
        intersections(vis[a].fn!, vis[b].fn!, range.x0, range.x1)
          .slice(0, 6)
          .forEach((x) => out.push({ label: `f${vis[a].i + 1} ∩ f${vis[b].i + 1}`, x, y: vis[a].fn!(x), color: COLORS[vis[a].i] }));
    return out.slice(0, 24);
  }, [compiled, hidden, range.x0, range.x1]);

  const zoom = (k: number, px = size.w / 2, py = size.h / 2) =>
    setView((v) => {
      const x = v.cx + (px - size.w / 2) / v.ppu, y = v.cy - (py - size.h / 2) / v.ppu;
      const ppu = Math.min(5000, Math.max(0.5, v.ppu * k));
      return { ppu, cx: x - (px - size.w / 2) / ppu, cy: y + (py - size.h / 2) / ppu };
    });

  // Wheel zoom needs a non-passive listener to stop the page scrolling.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = c.getBoundingClientRect();
      zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
    };
    c.addEventListener("wheel", onWheel, { passive: false });
    return () => c.removeEventListener("wheel", onWheel);
  });

  const hoverValues = hover
    ? compiled.map(({ fn }, i) => (fn && !hidden.has(i) ? { i, y: fn(hover.x) } : null)).filter((v): v is { i: number; y: number } => !!v && Number.isFinite(v.y))
    : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-2 self-start rounded-xl border bg-card p-3" aria-label="Functions">
        {exprs.map((e, i) => (
          <div key={i}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={hidden.has(i) ? `Show f${i + 1}` : `Hide f${i + 1}`}
                aria-pressed={!hidden.has(i)}
                onClick={() => setHidden((h) => (h.has(i) ? new Set([...h].filter((k) => k !== i)) : new Set([...h, i])))}
                className="size-4 shrink-0 rounded-full border-2"
                style={{ borderColor: COLORS[i], background: hidden.has(i) ? "transparent" : COLORS[i] }}
              />
              <span className="shrink-0 text-sm text-muted-foreground">y =</span>
              <input
                value={e}
                onChange={(ev) => setExprs(exprs.map((x, k) => (k === i ? ev.target.value : x)))}
                aria-label={`Function ${i + 1}`}
                spellCheck={false}
                className={cn("h-9 min-w-0 flex-1 rounded-md border bg-background px-2 font-mono text-sm outline-none focus-visible:border-foreground/40", compiled[i].error && "border-destructive/60")}
              />
              <button type="button" aria-label={`Remove function ${i + 1}`} onClick={() => setExprs(exprs.filter((_, k) => k !== i))} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>
            {compiled[i].error && <p className="mt-1 pl-6 text-xs text-destructive">{compiled[i].error}</p>}
          </div>
        ))}
        {exprs.length < 6 && (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setExprs([...exprs, ""])}>
            Add function
          </Button>
        )}
        <p className="pt-1 text-xs leading-5 text-muted-foreground">
          Use x, ^, sqrt, sin, cos, tan, ln, log, abs, pi and e. Write 2x and 3(x+1) without *.
        </p>
        {points.length > 0 && (
          <div className="border-t pt-2">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Points in view</p>
            <ul className="max-h-52 space-y-0.5 overflow-auto text-sm">
              {points.map((p, k) => (
                <li key={k}>
                  <button type="button" onClick={() => setView((v) => ({ ...v, cx: p.x, cy: p.y }))} className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-muted">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: p.color }} />
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="tabular ml-auto">
                      ({fmt(p.x)}, {fmt(p.y)})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <div className="min-w-0">
        <div ref={box} className="relative overflow-hidden rounded-xl border bg-card">
          <canvas
            ref={canvas}
            style={{ width: size.w, height: size.h, touchAction: "none" }}
            className="block cursor-crosshair"
            aria-label="Graph of the functions"
            role="img"
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, v: view };
            }}
            onPointerMove={(e) => {
              const r = canvas.current!.getBoundingClientRect();
              const px = e.clientX - r.left;
              if (drag.current) {
                const d = drag.current;
                setView({ ...d.v, cx: d.v.cx - (e.clientX - d.x) / d.v.ppu, cy: d.v.cy + (e.clientY - d.y) / d.v.ppu });
              }
              setHover({ px, py: e.clientY - r.top, x: toX(px) });
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerLeave={() => setHover(null)}
          />
          {hover && hoverValues.length > 0 && (
            <div className="pointer-events-none absolute top-2 left-2 rounded-md border bg-background/95 px-2 py-1 text-xs shadow-sm">
              <p className="tabular text-muted-foreground">x = {fmt(hover.x)}</p>
              {hoverValues.map((v) => (
                <p key={v.i} className="tabular" style={{ color: COLORS[v.i] }}>
                  f{v.i + 1} = {fmt(v.y)}
                </p>
              ))}
            </div>
          )}
          <div className="absolute right-2 bottom-2 flex gap-1">
            <Button variant="outline" size="icon" className="size-8 bg-background" aria-label="Zoom in" onClick={() => zoom(1.5)}>
              <Plus className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8 bg-background" aria-label="Zoom out" onClick={() => zoom(1 / 1.5)}>
              <Minus className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8 bg-background" aria-label="Reset view" onClick={() => setView(DEFAULT_VIEW)}>
              <RotateCcw className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8 bg-background" aria-label="Download PNG" onClick={() => canvas.current?.toBlob((b) => b && download(b, "graph.png"))}>
              <Download className="size-4" />
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Drag to move, scroll or pinch to zoom. Click a point in the list to centre it.</p>
      </div>
    </div>
  );
}
