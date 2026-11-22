"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Maximize2, Minimize2 } from "lucide-react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { download } from "@/lib/image/canvas";
import { checkMermaid, renderMermaid, svgToPng } from "@/lib/diagram/mermaid";
import { streamAiTask } from "@/lib/ai/tasks-client";
import { useSavedItem } from "@/lib/workspace/use-saved-item";
import { cn } from "@/lib/utils";
import { MERMAID_EXAMPLES, extractMermaid } from "./examples";

// Excalidraw fonts are self-hosted (copied to /public/excalidraw at build). Must be set before Excalidraw loads.
if (typeof window !== "undefined") (window as unknown as { EXCALIDRAW_ASSET_PATH: string }).EXCALIDRAW_ASSET_PATH = "/excalidraw/";

const Whiteboard = dynamic(() => import("./whiteboard"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading whiteboard…</div>,
});

type Tab = "code" | "whiteboard";
const CODE_KEY = "diagram:code";
const TAB_KEY = "diagram:tab";
const KINDS = ["auto", "flowchart", "sequence", "class", "er", "state", "gantt", "mindmap", "timeline"] as const;

/** Elements waiting for the whiteboard. `replace` swaps the whole scene (opening a saved item); otherwise they are added beside it. */
type Pending = { elements: unknown[]; files?: Record<string, unknown>; replace?: boolean };

export function DiagramStudio() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  // Client-only component (see ui-registry), so browser storage can seed the initial state.
  const [tab, setTab] = useState<Tab>(() => (stored(TAB_KEY) === "whiteboard" ? "whiteboard" : "code"));
  const [boardMounted, setBoardMounted] = useState(() => tab === "whiteboard");
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [code, setCode] = useState(() => stored(CODE_KEY) || MERMAID_EXAMPLES[0].code);
  const [full, setFull] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pending = useRef<Pending | null>(null);

  useEffect(() => {
    const onFs = () => setFull(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CODE_KEY, code);
    } catch {}
  }, [code]);

  function show(t: Tab) {
    setTab(t);
    if (t === "whiteboard") setBoardMounted(true);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {}
  }

  const applyPending = useCallback(async (a: ExcalidrawImperativeAPI) => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    const { CaptureUpdateAction } = await import("@excalidraw/excalidraw");
    if (p.files) a.addFiles(Object.values(p.files) as Parameters<typeof a.addFiles>[0]);
    if (p.replace) {
      const els = p.elements as ReturnType<typeof a.getSceneElements>;
      a.updateScene({ elements: els, captureUpdate: CaptureUpdateAction.IMMEDIATELY });
      if (els.length) a.scrollToContent(els, { fitToContent: true });
      return;
    }
    const existing = a.getSceneElements();
    const els = p.elements as { x: number; y: number; width: number }[];
    const right = existing.reduce((m, e) => Math.max(m, e.x + e.width), -Infinity);
    const left = els.reduce((m, e) => Math.min(m, e.x), Infinity);
    const dx = Number.isFinite(right) ? right + 120 - left : 0;
    const shifted = els.map((e) => ({ ...e, x: e.x + dx })) as unknown as typeof existing;
    a.updateScene({ elements: [...existing, ...shifted], captureUpdate: CaptureUpdateAction.IMMEDIATELY });
    a.scrollToContent(shifted, { fitToContent: true, animate: true });
  }, []);

  const onApi = useCallback(
    (a: ExcalidrawImperativeAPI) => {
      setApi(a);
      // Give the scene a tick to restore from autosave before appending.
      setTimeout(() => void applyPending(a), 300);
    },
    [applyPending],
  );

  const toShapes = async (source: string) => {
    try {
      const [{ parseMermaidToExcalidraw }, { convertToExcalidrawElements }] = await Promise.all([import("@excalidraw/mermaid-to-excalidraw"), import("@excalidraw/excalidraw")]);
      const { elements, files } = await parseMermaidToExcalidraw(source, { themeVariables: { fontSize: "16px" } });
      pending.current = { elements: convertToExcalidrawElements(elements), files };
      show("whiteboard");
      if (api) void applyPending(api);
    } catch {
      toast.error("Fix the diagram code first, then try again.");
    }
  };

  // Format of the account item this session is tied to; saving the other format creates a new item.
  const itemFormat = useRef<"mermaid" | "excalidraw" | null>(null);
  const { save, saving } = useSavedItem("diagram", "create.diagram", (content) => {
    try {
      const data = JSON.parse(content) as { format: string; code?: string; scene?: string };
      if (data.format === "mermaid" && data.code) {
        setCode(data.code);
        itemFormat.current = "mermaid";
        show("code");
      } else if (data.format === "excalidraw" && data.scene) {
        const scene = JSON.parse(data.scene);
        pending.current = { elements: scene.elements ?? [], files: scene.files, replace: true };
        itemFormat.current = "excalidraw";
        show("whiteboard");
        if (api) void applyPending(api);
      }
    } catch {
      toast.error("That saved diagram couldn't be read.");
    }
  });

  const saveToAccount = async () => {
    const format = tab === "code" ? "mermaid" : "excalidraw";
    const asNew = itemFormat.current !== null && itemFormat.current !== format;
    itemFormat.current = format;
    if (tab === "code") return save(code.split("\n").find((l) => l.trim() && !/^(flowchart|graph|sequenceDiagram)/.test(l.trim()))?.trim().slice(0, 60) || "Diagram", JSON.stringify({ format: "mermaid", code }), { asNew });
    if (!api) return;
    const { serializeAsJSON } = await import("@excalidraw/excalidraw");
    await save("Whiteboard", JSON.stringify({ format: "excalidraw", scene: serializeAsJSON(api.getSceneElements(), api.getAppState(), api.getFiles(), "local") }), { asNew });
  };

  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.current?.requestFullscreen?.();
  };

  return (
    <div ref={root} className={cn("flex flex-col overflow-hidden rounded-xl border bg-background", full ? "h-dvh rounded-none border-0" : "h-[min(84vh,900px)] min-h-[560px]")}>
      <div className="flex items-center justify-between gap-2 border-b px-2 py-1.5">
        <div role="tablist" aria-label="Editor" className="flex gap-1">
          {(["code", "whiteboard"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => show(t)}
              className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors", tab === t ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {t === "code" ? "Diagram from text" : "Whiteboard"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={saveToAccount} disabled={saving}>
            {saving ? "Saving…" : "Save to account"}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFull} aria-label={full ? "Exit full screen" : "Full screen"}>
            {full ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </div>
      </div>

      <div className={cn("min-h-0 flex-1", tab === "code" ? "block" : "hidden")} role="tabpanel">
        <CodeTab code={code} setCode={setCode} dark={dark} onShapes={toShapes} />
      </div>
      <div className={cn("relative min-h-0 flex-1", tab === "whiteboard" ? "block" : "hidden")} role="tabpanel">
        {boardMounted && <Whiteboard dark={dark} onApi={onApi} />}
      </div>
    </div>
  );
}

function CodeTab({ code, setCode, dark, onShapes }: { code: string; setCode: (c: string) => void; dark: boolean; onShapes: (c: string) => void }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("auto");
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    let live = true;
    const t = setTimeout(async () => {
      const r = await renderMermaid(code, dark);
      if (!live) return;
      if (r.svg) {
        setSvg(r.svg);
        setError(null);
      } else setError(r.error ?? null);
    }, busy ? 600 : 300);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [code, dark, busy]);

  const generate = async () => {
    if (!prompt.trim()) return;
    abort.current?.abort();
    const ctl = new AbortController();
    abort.current = ctl;
    setBusy(true);
    try {
      let last = "";
      for (let attempt = 0; attempt < 2; attempt++) {
        const err: string | null = attempt ? await checkMermaid(last) : null;
        if (attempt && !err) break;
        const { text } = await streamAiTask("diagram.mermaid", prompt, { kind, ...(err ? { error: err.slice(0, 78) } : {}) }, (t) => setCode(extractMermaid(t)), ctl.signal);
        last = extractMermaid(text);
        setCode(last);
      }
    } catch (e) {
      if (!ctl.signal.aborted) toast.error(e instanceof Error ? e.message : "AI couldn't draw that. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const pickExample = (id: string) => {
    const ex = MERMAID_EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    const edited = !MERMAID_EXAMPLES.some((e) => e.code === code);
    if (edited && code.trim() && !window.confirm("Replace your diagram with this example?")) return;
    setCode(ex.code);
  };

  const exportSvg = () => svg && download(new Blob([svg], { type: "image/svg+xml" }), "diagram.svg");
  const exportPng = async () => {
    if (!svg) return;
    try {
      download(await svgToPng(svg, 2, dark ? "#1c1917" : "#ffffff"), "diagram.png");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PNG export failed.");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <form
        className="flex flex-wrap items-center gap-2 border-b p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
      >
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={3000}
          placeholder="Describe a diagram, e.g. how a library book loan works"
          aria-label="Describe a diagram for AI to draw"
          className="min-w-0 flex-1 basis-64"
        />
        <select aria-label="Diagram type" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="h-9 rounded-lg border bg-background px-2 text-sm">
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k === "auto" ? "Any type" : k === "er" ? "ER diagram" : k[0].toUpperCase() + k.slice(1)}
            </option>
          ))}
        </select>
        {busy ? (
          <Button type="button" variant="outline" onClick={() => abort.current?.abort()}>
            Stop
          </Button>
        ) : (
          <Button type="submit" disabled={!prompt.trim()}>
            Draw with AI
          </Button>
        )}
      </form>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(200px,40%)_1fr] md:grid-cols-[minmax(280px,38%)_1fr] md:grid-rows-1">
        <div className="flex min-h-0 flex-col border-b md:border-r md:border-b-0">
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs text-muted-foreground">
            <span>Mermaid code</span>
            <select aria-label="Start from an example" value="" onChange={(e) => pickExample(e.target.value)} className="h-7 rounded-md border bg-background px-1.5 text-xs text-foreground">
              <option value="">Examples…</option>
              {MERMAID_EXAMPLES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Tab") return;
              e.preventDefault();
              const t = e.currentTarget;
              const s = t.selectionStart;
              setCode(code.slice(0, s) + "    " + code.slice(t.selectionEnd));
              requestAnimationFrame(() => t.setSelectionRange(s + 4, s + 4));
            }}
            spellCheck={false}
            aria-label="Mermaid code"
            className="min-h-0 flex-1 resize-none bg-transparent px-3 pb-3 font-mono text-[13px] leading-6 outline-none"
          />
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="relative min-h-0 flex-1 overflow-auto p-4">
            {svg && <div className={cn("flex justify-center [&_svg]:h-auto [&_svg]:max-w-full", error && "opacity-40")} dangerouslySetInnerHTML={{ __html: svg }} />}
            {error && <pre className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs whitespace-pre-wrap text-destructive">{error}</pre>}
          </div>
          <div className="flex flex-wrap items-center gap-1 border-t p-2">
            <Button size="sm" onClick={() => onShapes(code)} disabled={!svg || !!error}>
              Edit as shapes
            </Button>
            <span className="flex-1" />
            <Button size="sm" variant="ghost" onClick={exportPng} disabled={!svg}>
              PNG
            </Button>
            <Button size="sm" variant="ghost" onClick={exportSvg} disabled={!svg}>
              SVG
            </Button>
            <Button size="sm" variant="ghost" onClick={() => download(new Blob([code], { type: "text/plain" }), "diagram.mmd")}>
              .mmd
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(code).then(() => toast.success("Code copied"))}>
              Copy code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function stored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
