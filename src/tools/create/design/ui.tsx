"use client";

import "@fontsource-variable/inter";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/oswald";
import "@fontsource/bebas-neue";
import "@fontsource-variable/playfair-display";
import "@fontsource/dm-serif-display";
import "@fontsource-variable/roboto-slab";
import "@fontsource/lobster";
import "@fontsource/pacifico";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ActiveSelection,
  Canvas,
  FabricImage,
  FabricObject,
  Rect,
  StaticCanvas,
  Textbox,
} from "fabric";
import { toast } from "sonner";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  Copy,
  Eye,
  EyeOff,
  FlipHorizontal,
  FlipVertical,
  Italic,
  Lock,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Redo2,
  Trash2,
  Underline,
  Undo2,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { download } from "@/lib/image/canvas";
import { kvGet, kvSet } from "@/lib/storage/idb-kv";
import {
  getTrayFile,
  listTray,
  subscribeTray,
  type TrayItem,
} from "@/runtime/file-store";
import { useSavedItem } from "@/lib/workspace/use-saved-item";
import { segment } from "@/lib/ml/segment";
import { composite } from "@/tools/media/remove-background/engine";
import { SliderRow } from "@/tools/media/remove-background/ui";
import { FONTS, SIZES, TEMPLATES, type DesignTemplate } from "./templates";
import {
  addPhoto,
  addShape,
  addText,
  applyTemplate,
  elToObject,
  getAdjust,
  isLocked,
  layerLabel,
  loadFonts,
  pageDataUrl,
  pageSvg,
  photoDataUrl,
  sceneJson,
  setAdjust,
  setLocked,
  setShadow,
  type ShapeKind,
  type TextKind,
} from "./scene";

const AUTOSAVE = "design:current";
const BRAND_KEY = "design:brand";
type Page = { w: number; h: number; dpi?: number; sizeId: string };
type Saved = { v: 1; page: Page; name: string; json: object };
type PanelId = "templates" | "text" | "elements" | "photos" | "brand";

export function DesignStudio() {
  const root = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const cv = useRef<Canvas | null>(null);
  // Canvas in state too, so render reads state, not refs; set once the editor is ready.
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [hs, setHs] = useState({ canUndo: false, canRedo: false });
  const [page, setPageState] = useState<Page>({
    w: 1080,
    h: 1080,
    sizeId: "square",
  });
  const pageRef = useRef(page);
  const [name, setName] = useState("Untitled design");
  const [zoom, setZoomState] = useState(0.4);
  const zoomRef = useRef(zoom);
  const [fit, setFit] = useState(true);
  const [panel, setPanel] = useState<PanelId>("templates");
  const [full, setFull] = useState(false);
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const hist = useRef({ stack: [] as string[], i: -1, mute: 0 });
  const recordTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clip = useRef<FabricObject | null>(null);
  const [brand, setBrand] = useBrand();

  const applyZoom = useCallback((z: number) => {
    const c = cv.current;
    if (!c) return;
    const p = pageRef.current;
    zoomRef.current = z;
    setZoomState(z);
    c.setDimensions({
      width: Math.round(p.w * z),
      height: Math.round(p.h * z),
    });
    c.setZoom(z);
    c.requestRenderAll();
  }, []);

  const fitZoom = useCallback(() => {
    const h = host.current;
    if (!h) return;
    const p = pageRef.current;
    applyZoom(
      Math.max(
        0.05,
        Math.min((h.clientWidth - 48) / p.w, (h.clientHeight - 48) / p.h, 2),
      ),
    );
  }, [applyZoom]);

  const setPage = useCallback(
    (p: Page) => {
      pageRef.current = p;
      setPageState(p);
      fitZoom();
      setFit(true);
    },
    [fitZoom],
  );

  const nameRef = useRef(name);
  const rename = useCallback((n: string) => {
    nameRef.current = n;
    setName(n);
  }, []);
  const persist = useCallback((json: string) => {
    void kvSet(AUTOSAVE, {
      v: 1,
      page: pageRef.current,
      name: nameRef.current,
      json: JSON.parse(json),
    } satisfies Saved);
  }, []);
  const syncHist = useCallback(() => {
    const h = hist.current;
    setHs({ canUndo: h.i > 0, canRedo: h.i < h.stack.length - 1 });
  }, []);

  const record = useCallback(() => {
    if (recordTimer.current) clearTimeout(recordTimer.current);
    recordTimer.current = setTimeout(() => {
      const c = cv.current;
      const h = hist.current;
      if (!c || h.mute) return;
      const json = JSON.stringify(sceneJson(c));
      if (json === h.stack[h.i]) return;
      h.stack = h.stack.slice(0, h.i + 1);
      h.stack.push(json);
      if (h.stack.length > 60) h.stack.shift();
      h.i = h.stack.length - 1;
      persist(json);
      syncHist();
    }, 250);
  }, [persist, syncHist]);

  const restore = useCallback(
    async (json: string | object) => {
      const c = cv.current;
      if (!c) return;
      const h = hist.current;
      h.mute++;
      const data = typeof json === "string" ? JSON.parse(json) : json;
      await loadFonts(collectFonts(data));
      await c.loadFromJSON(data);
      c.requestRenderAll();
      if (recordTimer.current) clearTimeout(recordTimer.current);
      setTimeout(() => {
        h.mute--;
        refresh();
      }, 300);
    },
    [refresh],
  );

  const resetHistory = useCallback(() => {
    const c = cv.current;
    if (!c) return;
    const json = JSON.stringify(sceneJson(c));
    hist.current.stack = [json];
    hist.current.i = 0;
    persist(json);
    syncHist();
  }, [persist, syncHist]);

  // Create the canvas imperatively so React strict mode never reuses a disposed element.
  useEffect(() => {
    const el = document.createElement("canvas");
    mount.current!.replaceChildren(el);
    const c = new Canvas(el, {
      preserveObjectStacking: true,
      backgroundColor: "#ffffff",
      selectionColor: "rgba(14,165,233,0.08)",
      selectionBorderColor: "#0ea5e9",
      selectionLineWidth: 1,
    });
    Object.assign(FabricObject.ownDefaults, {
      cornerColor: "#ffffff",
      cornerStrokeColor: "#0ea5e9",
      borderColor: "#0ea5e9",
      cornerStyle: "circle",
      cornerSize: 11,
      transparentCorners: false,
      borderScaleFactor: 1.5,
    });
    cv.current = c;
    let raf = 0;
    const live = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(refresh);
    };
    c.on("object:added", record);
    c.on("object:removed", record);
    c.on("object:modified", record);
    c.on("text:changed", record);
    c.on("selection:created", refresh);
    c.on("selection:updated", refresh);
    c.on("selection:cleared", refresh);
    c.on("object:moving", live);
    c.on("object:scaling", live);
    c.on("object:rotating", live);

    let cancelled = false;
    void (async () => {
      const saved = await kvGet<Saved>(AUTOSAVE);
      if (cancelled) return;
      setCanvas(c);
      // When opening a saved item from the Workspace, don't also restore the local draft (they would race).
      const openingItem = new URLSearchParams(window.location.search).has("item");
      if (saved?.json && !openingItem) {
        pageRef.current = saved.page;
        setPageState(saved.page);
        rename(saved.name || "Untitled design");
        fitZoom();
        await restore(saved.json);
      } else fitZoom();
      resetHistory();
      void loadFonts(FONTS).then(() => {
        c.getObjects().forEach(
          (o) => o instanceof Textbox && o.initDimensions(),
        );
        c.requestRenderAll();
      });
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cv.current = null;
      setCanvas(null);
      void c.dispose();
    };
  }, [fitZoom, record, refresh, restore, resetHistory, rename]);

  // Keep fitting while the container resizes (window, full screen).
  useEffect(() => {
    if (!fit || !host.current) return;
    const ro = new ResizeObserver(() => fitZoom());
    ro.observe(host.current);
    return () => ro.disconnect();
  }, [fit, fitZoom]);

  useEffect(() => {
    const onFs = () => setFull(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const undo = useCallback(async () => {
    const h = hist.current;
    if (h.i <= 0) return;
    h.i--;
    await restore(h.stack[h.i]);
    persist(h.stack[h.i]);
    syncHist();
  }, [restore, persist, syncHist]);

  const redo = useCallback(async () => {
    const h = hist.current;
    if (h.i >= h.stack.length - 1) return;
    h.i++;
    await restore(h.stack[h.i]);
    persist(h.stack[h.i]);
    syncHist();
  }, [restore, persist, syncHist]);

  const removeSelected = useCallback(() => {
    const c = cv.current;
    if (!c) return;
    c.getActiveObjects().forEach((o) => c.remove(o));
    c.discardActiveObject();
    c.requestRenderAll();
  }, []);

  const duplicate = useCallback(async (src?: FabricObject | null) => {
    const c = cv.current;
    const obj = src ?? c?.getActiveObject();
    if (!c || !obj) return;
    const copy = await obj.clone(["name"]);
    c.discardActiveObject();
    copy.set({
      left: (copy.left ?? 0) + 24,
      top: (copy.top ?? 0) + 24,
      evented: true,
    });
    if (copy instanceof ActiveSelection) {
      copy.canvas = c;
      copy.forEachObject((o) => c.add(o));
      copy.setCoords();
    } else c.add(copy);
    c.setActiveObject(copy);
    c.requestRenderAll();
  }, []);

  // Keyboard shortcuts (ignored while typing in a field or editing text on the canvas).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const c = cv.current;
      const t = e.target as HTMLElement;
      if (!c || t.closest("input, textarea, select, [contenteditable=true]"))
        return;
      if (
        !root.current?.contains(document.activeElement) &&
        document.activeElement !== document.body
      )
        return;
      const active = c.getActiveObject();
      if (active instanceof Textbox && active.isEditing) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        void (e.shiftKey ? redo() : undo());
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        void redo();
      } else if (!active) return;
      else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeSelected();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        void duplicate();
      } else if (mod && e.key.toLowerCase() === "c") clip.current = active;
      else if (mod && e.key.toLowerCase() === "v" && clip.current) {
        e.preventDefault();
        void duplicate(clip.current);
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const d = e.shiftKey ? 10 : 1;
        active.set({
          left:
            (active.left ?? 0) +
            (e.key === "ArrowLeft" ? -d : e.key === "ArrowRight" ? d : 0),
          top:
            (active.top ?? 0) +
            (e.key === "ArrowUp" ? -d : e.key === "ArrowDown" ? d : 0),
        });
        active.setCoords();
        c.requestRenderAll();
        record();
        refresh();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, removeSelected, duplicate, record, refresh]);

  const pickTemplate = async (tpl: DesignTemplate) => {
    const c = cv.current;
    if (!c) return;
    if (
      c.getObjects().length &&
      !window.confirm("Replace your current design with this template?")
    )
      return;
    const size = SIZES.find((s) => s.id === tpl.size)!;
    setPage({ w: size.w, h: size.h, dpi: size.dpi, sizeId: size.id });
    hist.current.mute++;
    await applyTemplate(c, tpl);
    hist.current.mute--;
    resetItem();
    rename(tpl.name);
    record();
  };

  const changeSize = (id: string, custom?: { w: number; h: number }) => {
    const s = SIZES.find((x) => x.id === id);
    const p = s
      ? { w: s.w, h: s.h, dpi: s.dpi, sizeId: s.id }
      : {
          w: custom?.w ?? pageRef.current.w,
          h: custom?.h ?? pageRef.current.h,
          sizeId: "custom",
        };
    setPage(p);
    record();
  };

  const exportAs = async (
    fmt: "png" | "jpg" | "webp" | "svg" | "pdf" | "project",
  ) => {
    const c = cv.current;
    if (!c) return;
    const p = pageRef.current;
    const file = slug(name);
    if (fmt === "svg")
      return download(
        new Blob([pageSvg(c, p)], { type: "image/svg+xml" }),
        `${file}.svg`,
      );
    if (fmt === "project")
      return download(
        new Blob(
          [
            JSON.stringify({
              v: 1,
              page: p,
              name,
              json: sceneJson(c),
            } satisfies Saved),
          ],
          { type: "application/json" },
        ),
        `${file}.design.json`,
      );
    if (fmt === "pdf") {
      const { PDFDocument } = await import("pdf-lib");
      const dpi = p.dpi ?? 96;
      const doc = await PDFDocument.create();
      const pdfPage = doc.addPage([(p.w / dpi) * 72, (p.h / dpi) * 72]);
      const png = await doc.embedPng(
        pageDataUrl(c, zoomRef.current, "png", dpi >= 150 ? 1 : 2),
      );
      pdfPage.drawImage(png, {
        x: 0,
        y: 0,
        width: pdfPage.getWidth(),
        height: pdfPage.getHeight(),
      });
      doc.setTitle(name);
      return download(
        new Blob([(await doc.save()) as BlobPart], { type: "application/pdf" }),
        `${file}.pdf`,
      );
    }
    const url = pageDataUrl(c, zoomRef.current, fmt === "jpg" ? "jpeg" : fmt);
    download(await (await fetch(url)).blob(), `${file}.${fmt}`);
  };

  const openProject = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as Saved;
      if (!data?.json || !data.page) throw new Error();
      setPage(data.page);
      rename(data.name || f.name.replace(/\.design\.json$|\.json$/i, ""));
      await restore(data.json);
      resetHistory();
      resetItem();
    } catch {
      toast.error("That file isn't a Design Studio project.");
    }
  };

  const { save, reset: resetItem, saving } = useSavedItem(
    "design",
    "create.design",
    (content, title) => {
      try {
        const data = JSON.parse(content) as Saved;
        setPage(data.page);
        rename(title || data.name);
        void restore(data.json).then(resetHistory);
      } catch {
        toast.error("That saved design couldn't be read.");
      }
    },
  );

  const addPhotoFile = async (f: Blob) => {
    const c = cv.current;
    if (!c) return;
    if (!f.type.startsWith("image/"))
      return toast.error("Choose an image file.");
    await addPhoto(c, await photoDataUrl(f), pageRef.current);
  };

  const c = canvas;
  const active = c?.getActiveObject() ?? null;

  return (
    <div
      ref={root}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-background",
        full
          ? "h-dvh rounded-none border-0"
          : "lg:h-[min(86vh,920px)] lg:min-h-[620px]",
      )}
    >
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b px-2 py-1.5">
        <Input
          value={name}
          onChange={(e) => rename(e.target.value)}
          onBlur={record}
          aria-label="Design name"
          className="h-8 min-w-0 flex-1 border-transparent bg-transparent font-medium hover:border-border sm:w-44 sm:flex-none"
        />
        <select
          aria-label="Page size"
          value={page.sizeId}
          onChange={(e) => changeSize(e.target.value)}
          className="h-8 rounded-md border bg-background px-2 text-sm"
        >
          {SIZES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.w}×{s.h}
            </option>
          ))}
          <option value="custom">Custom size</option>
        </select>
        {page.sizeId === "custom" && (
          <CustomSize
            page={page}
            onChange={(w, hh) => changeSize("custom", { w, h: hh })}
          />
        )}
        <div className="flex items-center">
          <div className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <IconBtn label="Undo (Ctrl+Z)" onClick={undo} disabled={!hs.canUndo}>
            <Undo2 />
          </IconBtn>
          <IconBtn label="Redo (Ctrl+Y)" onClick={redo} disabled={!hs.canRedo}>
            <Redo2 />
          </IconBtn>
          <div className="mx-1 h-5 w-px bg-border" />
          <IconBtn
            label="Zoom out"
            onClick={() => (
              setFit(false),
              applyZoom(Math.max(0.05, zoom / 1.25))
            )}
          >
            <Minus />
          </IconBtn>
          <button
            type="button"
            onClick={() => (setFit(true), fitZoom())}
            className="tabular w-14 rounded-md py-1 text-center text-sm text-muted-foreground hover:bg-muted"
            title="Fit to screen"
          >
            {Math.round(zoom * 100)}%
          </button>
          <IconBtn
            label="Zoom in"
            onClick={() => (setFit(false), applyZoom(Math.min(4, zoom * 1.25)))}
          >
            <Plus />
          </IconBtn>
        </div>
        <span className="hidden flex-1 sm:block" />
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              c &&
              save(
                name,
                JSON.stringify({ v: 1, page, name, json: sceneJson(c) }),
              )
            }
            disabled={saving}
          >
            {saving ? "Saving…" : "Save to account"}
          </Button>
          <ExportMenu onPick={exportAs} />
          <IconBtn
            label={full ? "Exit full screen" : "Full screen"}
            onClick={() =>
              document.fullscreenElement
                ? document.exitFullscreen()
                : root.current?.requestFullscreen?.()
            }
          >
            {full ? <Minimize2 /> : <Maximize2 />}
          </IconBtn>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[272px_minmax(0,1fr)_288px]">
        {/* Left rail */}
        <aside
          className="order-2 flex min-h-0 flex-col border-t lg:order-none lg:border-t-0 lg:border-r"
          aria-label="Add content"
        >
          <div role="tablist" className="flex gap-0.5 border-b p-1">
            {(
              ["templates", "text", "elements", "photos", "brand"] as PanelId[]
            ).map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={panel === p}
                onClick={() => setPanel(p)}
                className={cn(
                  "flex-1 rounded-md px-1 py-1.5 text-xs font-medium capitalize",
                  panel === p
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="max-h-[50vh] min-h-0 flex-1 overflow-y-auto p-3 lg:max-h-none">
            {panel === "templates" && <TemplatesPanel onPick={pickTemplate} />}
            {panel === "text" && c && (
              <TextPanel
                onAdd={(k) =>
                  addText(c, k, pageRef.current, brand[0] ?? "#111111")
                }
              />
            )}
            {panel === "elements" && c && (
              <ElementsPanel
                onAdd={(k) =>
                  addShape(c, k, pageRef.current, brand[0] ?? "#0ea5e9")
                }
              />
            )}
            {panel === "photos" && (
              <PhotosPanel onFile={addPhotoFile} onProject={openProject} />
            )}
            {panel === "brand" && (
              <BrandPanel colors={brand} setColors={setBrand} />
            )}
          </div>
        </aside>

        {/* Canvas */}
        <div
          ref={host}
          className="checker-soft order-1 relative h-[56vh] min-h-0 overflow-auto lg:order-none lg:h-auto"
          onPointerDown={(e) =>
            e.target === e.currentTarget &&
            c?.discardActiveObject() &&
            c.requestRenderAll()
          }
        >
          <div
            className="flex min-h-full min-w-full items-center justify-center p-6"
            style={{ width: "max-content" }}
          >
            <div
              ref={mount}
              className="shadow-[0_1px_3px_rgba(0,0,0,0.12),0_8px_24px_rgba(0,0,0,0.08)]"
            />
          </div>
        </div>

        {/* Properties */}
        <aside
          className="order-3 min-h-0 overflow-y-auto border-t p-3 lg:border-t-0 lg:border-l"
          aria-label="Properties"
        >
          {c && active ? (
            <ObjectProps
              c={c}
              obj={active}
              brand={brand}
              record={record}
              refresh={refresh}
              onDuplicate={() => duplicate()}
              onDelete={removeSelected}
            />
          ) : c ? (
            <PageProps c={c} brand={brand} record={record} refresh={refresh} />
          ) : null}
          {c && <Layers c={c} refresh={refresh} record={record} />}
        </aside>
      </div>
    </div>
  );
}

/* ---------- Panels ---------- */

const thumbCache = new Map<string, string>();

function TemplatesPanel({ onPick }: { onPick: (t: DesignTemplate) => void }) {
  const [thumbs, setThumbs] = useState<Record<string, string>>(() =>
    Object.fromEntries(thumbCache),
  );
  useEffect(() => {
    let live = true;
    void (async () => {
      await loadFonts(FONTS);
      for (const t of TEMPLATES) {
        if (thumbCache.has(t.id)) continue;
        const size = SIZES.find((s) => s.id === t.size)!;
        const k = 240 / size.w;
        const sc = new StaticCanvas(undefined, {
          width: 240,
          height: Math.round(size.h * k),
          backgroundColor: t.bg,
          renderOnAddRemove: false,
        });
        sc.setZoom(k);
        t.els.forEach((el) => sc.add(elToObject(el)));
        sc.renderAll();
        thumbCache.set(t.id, sc.toDataURL({ format: "png", multiplier: 1 }));
        void sc.dispose();
        if (!live) return;
        setThumbs(Object.fromEntries(thumbCache));
        await new Promise((r) => setTimeout(r, 0));
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      {SIZES.filter((s) => TEMPLATES.some((t) => t.size === s.id)).map((s) => (
        <section key={s.id}>
          <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">
            {s.name}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.filter((t) => t.size === s.id).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onPick(t)}
                className="group text-left"
                title={t.name}
              >
                <span
                  className="block overflow-hidden rounded-md border bg-muted transition-colors group-hover:border-foreground/40"
                  style={{
                    aspectRatio: `${SIZES.find((x) => x.id === t.size)!.w} / ${SIZES.find((x) => x.id === t.size)!.h}`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {thumbs[t.id] && (
                    <img
                      src={thumbs[t.id]}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                </span>
                <span className="mt-1 block truncate text-xs">{t.name}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TextPanel({ onAdd }: { onAdd: (k: TextKind) => void }) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => onAdd("heading")}
        className="w-full rounded-lg border px-3 py-3 text-left text-2xl font-extrabold hover:border-foreground/30"
        style={{ fontFamily: "Montserrat Variable" }}
      >
        Add a heading
      </button>
      <button
        type="button"
        onClick={() => onAdd("subheading")}
        className="w-full rounded-lg border px-3 py-2.5 text-left text-lg font-semibold hover:border-foreground/30"
        style={{ fontFamily: "Montserrat Variable" }}
      >
        Add a subheading
      </button>
      <button
        type="button"
        onClick={() => onAdd("body")}
        className="w-full rounded-lg border px-3 py-2.5 text-left text-sm hover:border-foreground/30"
        style={{ fontFamily: "Inter Variable" }}
      >
        Add body text
      </button>
      <p className="pt-2 text-xs text-muted-foreground">
        Double-click text on the canvas to edit it.
      </p>
    </div>
  );
}

const SHAPES: { kind: ShapeKind; label: string; svg: ReactNode }[] = [
  {
    kind: "rect",
    label: "Rectangle",
    svg: <rect x="6" y="10" width="36" height="28" />,
  },
  {
    kind: "rounded",
    label: "Rounded rectangle",
    svg: <rect x="6" y="10" width="36" height="28" rx="7" />,
  },
  { kind: "circle", label: "Circle", svg: <circle cx="24" cy="24" r="16" /> },
  { kind: "triangle", label: "Triangle", svg: <path d="M24 8 42 40H6z" /> },
  {
    kind: "star",
    label: "Star",
    svg: (
      <path d="m24 6 5.3 11.6 12.7 1.4-9.5 8.6 2.7 12.4L24 33.6 12.8 40l2.7-12.4L6 19l12.7-1.4z" />
    ),
  },
  {
    kind: "line",
    label: "Line",
    svg: <path d="M6 24h36" strokeWidth="4" stroke="currentColor" />,
  },
  {
    kind: "arrow",
    label: "Arrow",
    svg: <path d="M6 20h24v-8l12 12-12 12v-8H6z" />,
  },
];

function ElementsPanel({ onAdd }: { onAdd: (k: ShapeKind) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {SHAPES.map((s) => (
        <button
          key={s.kind}
          type="button"
          onClick={() => onAdd(s.kind)}
          title={s.label}
          aria-label={`Add ${s.label.toLowerCase()}`}
          className="flex aspect-square items-center justify-center rounded-lg border text-foreground/70 hover:border-foreground/30 hover:text-foreground"
        >
          <svg viewBox="0 0 48 48" className="size-9" fill="currentColor">
            {s.svg}
          </svg>
        </button>
      ))}
    </div>
  );
}

function PhotosPanel({
  onFile,
  onProject,
}: {
  onFile: (f: Blob) => void;
  onProject: (f: File) => void;
}) {
  const photo = useRef<HTMLInputElement>(null);
  const project = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<{ item: TrayItem; url: string }[]>([]);

  useEffect(() => {
    let urls: string[] = [];
    const load = async () => {
      const list = (await listTray())
        .filter((i) => i.mime.startsWith("image/"))
        .slice(0, 12);
      const next = await Promise.all(
        list.map(async (item) => ({
          item,
          url: URL.createObjectURL((await getTrayFile(item.id)) ?? new Blob()),
        })),
      );
      urls.forEach(URL.revokeObjectURL);
      urls = next.map((n) => n.url);
      setItems(next);
    };
    void load();
    const off = subscribeTray(() => void load());
    return () => {
      off();
      urls.forEach(URL.revokeObjectURL);
    };
  }, []);

  return (
    <div className="space-y-4">
      <input
        ref={photo}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => (
          e.target.files?.[0] && onFile(e.target.files[0]),
          (e.target.value = "")
        )}
      />
      <input
        ref={project}
        type="file"
        accept=".json,application/json"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => (
          e.target.files?.[0] && onProject(e.target.files[0]),
          (e.target.value = "")
        )}
      />
      <Button className="w-full" onClick={() => photo.current?.click()}>
        Upload a photo
      </Button>
      <section>
        <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">
          From your Tray
        </h3>
        {items.length ? (
          <div className="grid grid-cols-3 gap-1.5">
            {items.map(({ item, url }) => (
              <button
                key={item.id}
                type="button"
                title={item.name}
                onClick={async () => {
                  const f = await getTrayFile(item.id);
                  if (f) onFile(f);
                }}
                className="aspect-square overflow-hidden rounded-md border hover:border-foreground/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={item.name}
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Images you open or create in other tools appear here.
          </p>
        )}
      </section>
      <section className="border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => project.current?.click()}
        >
          Open a project file
        </Button>
      </section>
    </div>
  );
}

function BrandPanel({
  colors,
  setColors,
}: {
  colors: string[];
  setColors: (c: string[]) => void;
}) {
  const [pick, setPick] = useState("#0ea5e9");
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Your colours appear in every colour picker. They are kept in this
        browser.
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            title={`Remove ${c}`}
            onClick={() => setColors(colors.filter((x) => x !== c))}
            className="group relative size-9 rounded-md border"
            style={{ background: c }}
          >
            <span className="absolute inset-0 hidden items-center justify-center rounded-md bg-black/40 text-xs text-white group-hover:flex">
              ×
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={pick}
          onChange={(e) => setPick(e.target.value)}
          aria-label="Pick a colour"
          className="h-9 w-12 cursor-pointer rounded-md border bg-transparent"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            !colors.includes(pick) && setColors([...colors, pick].slice(-12))
          }
        >
          Add colour
        </Button>
      </div>
    </div>
  );
}

/* ---------- Properties ---------- */

function PageProps({
  c,
  brand,
  record,
  refresh,
}: {
  c: Canvas;
  brand: string[];
  record: () => void;
  refresh: () => void;
}) {
  const bg =
    typeof c.backgroundColor === "string" ? c.backgroundColor : "#ffffff";
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Page</h3>
      <ColorField
        label="Background"
        value={bg}
        brand={brand}
        onChange={(v) => {
          c.set({ backgroundColor: v });
          c.requestRenderAll();
          record();
          refresh();
        }}
      />
      <p className="text-xs text-muted-foreground">
        Select something on the canvas to edit it. Drag photos onto the page or
        paste them with Ctrl+V.
      </p>
    </div>
  );
}

function ObjectProps({
  c,
  obj,
  brand,
  record,
  refresh,
  onDuplicate,
  onDelete,
}: {
  c: Canvas;
  obj: FabricObject;
  brand: string[];
  record: () => void;
  refresh: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const set = (props: Record<string, unknown>) => {
    obj.set(props);
    if (obj instanceof Textbox) obj.initDimensions();
    obj.setCoords();
    c.requestRenderAll();
    record();
    refresh();
  };
  const multi = obj instanceof ActiveSelection;
  const text = obj instanceof Textbox ? obj : null;
  const img = obj instanceof FabricImage ? obj : null;
  const shape = !text && !img && !multi;
  const fill = typeof obj.fill === "string" ? (obj.fill as string) : "";
  const stroke = typeof obj.stroke === "string" ? obj.stroke : "";
  const box = obj.getBoundingRect();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {multi
            ? `${(obj as ActiveSelection).size()} selected`
            : layerLabel(obj)}
        </h3>
        <div className="flex">
          <IconBtn
            label="Bring forward"
            onClick={() => (c.bringObjectForward(obj), record(), refresh())}
          >
            <ArrowUp />
          </IconBtn>
          <IconBtn
            label="Send backward"
            onClick={() => (c.sendObjectBackwards(obj), record(), refresh())}
          >
            <ArrowDown />
          </IconBtn>
          <IconBtn label="Duplicate (Ctrl+D)" onClick={onDuplicate}>
            <Copy />
          </IconBtn>
          <IconBtn label="Delete" onClick={onDelete}>
            <Trash2 />
          </IconBtn>
        </div>
      </div>

      {!multi && (
        <div className="grid grid-cols-4 gap-1.5">
          <NumField
            label="X"
            value={Math.round(box.left)}
            onChange={(v) => set({ left: (obj.left ?? 0) + (v - box.left) })}
          />
          <NumField
            label="Y"
            value={Math.round(box.top)}
            onChange={(v) => set({ top: (obj.top ?? 0) + (v - box.top) })}
          />
          <NumField
            label="W"
            value={Math.round(obj.getScaledWidth())}
            onChange={(v) =>
              v > 0 &&
              (text
                ? set({ width: v / (obj.scaleX ?? 1) })
                : set({ scaleX: v / (obj.width || 1) }))
            }
          />
          <NumField
            label="H"
            value={Math.round(obj.getScaledHeight())}
            onChange={(v) =>
              v > 0 && !text && set({ scaleY: v / (obj.height || 1) })
            }
            disabled={!!text}
          />
          <NumField
            label="Angle"
            value={Math.round(obj.angle ?? 0)}
            onChange={(v) => (obj.rotate(v), set({}))}
          />
        </div>
      )}

      <SliderRow
        label="Opacity"
        value={Math.round((obj.opacity ?? 1) * 100)}
        min={0}
        max={100}
        onChange={(v) => set({ opacity: v / 100 })}
        suffix="%"
      />

      {text && (
        <div className="space-y-3 border-t pt-3">
          <select
            aria-label="Font"
            value={text.fontFamily}
            onChange={async (e) => (
              await loadFonts([e.target.value]),
              set({ fontFamily: e.target.value })
            )}
            className="h-9 w-full rounded-md border bg-background px-2 text-sm"
            style={{ fontFamily: text.fontFamily }}
          >
            {FONTS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f.replace(" Variable", "")}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <NumField
              label="Size"
              value={Math.round(text.fontSize)}
              onChange={(v) => v > 0 && set({ fontSize: v })}
              className="w-20"
            />
            <Toggle
              label="Bold"
              on={Number(text.fontWeight) >= 600}
              onClick={() =>
                set({ fontWeight: Number(text.fontWeight) >= 600 ? 400 : 700 })
              }
            >
              <Bold />
            </Toggle>
            <Toggle
              label="Italic"
              on={text.fontStyle === "italic"}
              onClick={() =>
                set({
                  fontStyle: text.fontStyle === "italic" ? "normal" : "italic",
                })
              }
            >
              <Italic />
            </Toggle>
            <Toggle
              label="Underline"
              on={!!text.underline}
              onClick={() => set({ underline: !text.underline })}
            >
              <Underline />
            </Toggle>
          </div>
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((a) => (
              <Toggle
                key={a}
                label={`Align ${a}`}
                on={text.textAlign === a}
                onClick={() => set({ textAlign: a })}
              >
                {a === "left" ? (
                  <AlignLeft />
                ) : a === "center" ? (
                  <AlignCenter />
                ) : (
                  <AlignRight />
                )}
              </Toggle>
            ))}
          </div>
          <SliderRow
            label="Line height"
            value={Math.round(text.lineHeight * 100) / 100}
            min={0.7}
            max={2.5}
            step={0.05}
            onChange={(v) => set({ lineHeight: v })}
          />
          <SliderRow
            label="Letter spacing"
            value={text.charSpacing}
            min={-100}
            max={800}
            step={10}
            onChange={(v) => set({ charSpacing: v })}
          />
        </div>
      )}

      {(text || shape) && (
        <div className="space-y-3 border-t pt-3">
          <ColorField
            label={text ? "Text colour" : "Fill"}
            value={fill}
            brand={brand}
            allowNone={!text}
            onChange={(v) => set({ fill: v || "rgba(0,0,0,0)" })}
          />
          {shape && (
            <>
              <ColorField
                label="Border"
                value={stroke}
                brand={brand}
                allowNone
                onChange={(v) =>
                  set({
                    stroke: v || undefined,
                    strokeWidth: v ? Math.max(obj.strokeWidth || 0, 4) : 0,
                  })
                }
              />
              {!!stroke && (
                <SliderRow
                  label="Border width"
                  value={obj.strokeWidth ?? 0}
                  min={0}
                  max={40}
                  onChange={(v) => set({ strokeWidth: v })}
                  suffix=" px"
                />
              )}
              {obj instanceof Rect && (
                <SliderRow
                  label="Corner radius"
                  value={Math.round(obj.rx ?? 0)}
                  min={0}
                  max={Math.round(Math.min(obj.width, obj.height) / 2)}
                  onChange={(v) => set({ rx: v, ry: v })}
                  suffix=" px"
                />
              )}
            </>
          )}
        </div>
      )}

      {img && <PhotoProps c={c} img={img} set={set} />}

      {!multi && (
        <div className="flex items-center justify-between border-t pt-3">
          <Label htmlFor="shadow">Shadow</Label>
          <Switch
            id="shadow"
            checked={!!obj.shadow}
            onCheckedChange={(on) => (setShadow(obj, on), set({}))}
          />
        </div>
      )}
    </div>
  );
}

function PhotoProps({
  c,
  img,
  set,
}: {
  c: Canvas;
  img: FabricImage;
  set: (p: Record<string, unknown>) => void;
}) {
  const a = getAdjust(img);
  const [busy, setBusy] = useState<string | null>(null);
  const adjust = (patch: Partial<typeof a>) => {
    setAdjust(img, { ...a, ...patch });
    set({});
  };
  const removeBg = async () => {
    setBusy("Preparing…");
    try {
      const src = img.getSrc();
      const blob = await (await fetch(src)).blob();
      const r = await segment(blob, "object", (s) =>
        setBusy(
          s.phase === "download"
            ? `Downloading model (44 MB, once)… ${s.percent}%`
            : "Removing background…",
        ),
      );
      const bmp = await createImageBitmap(blob);
      const cnv = document.createElement("canvas");
      cnv.width = r.width;
      cnv.height = r.height;
      const ctx = cnv.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0, r.width, r.height);
      bmp.close();
      const px = ctx.getImageData(0, 0, r.width, r.height);
      ctx.putImageData(
        new ImageData(
          composite(px.data, r.mask, null) as Uint8ClampedArray<ArrayBuffer>,
          r.width,
          r.height,
        ),
        0,
        0,
      );
      const dataUrl = cnv.toDataURL("image/png");
      await img.setSrc(dataUrl);
      setAdjust(img, a);
      c.requestRenderAll();
      set({});
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Couldn't remove the background.",
      );
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="space-y-3 border-t pt-3">
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        disabled={!!busy}
        onClick={removeBg}
      >
        {busy ?? "Remove background"}
      </Button>
      <div className="flex gap-1">
        <Toggle
          label="Flip horizontal"
          on={!!img.flipX}
          onClick={() => set({ flipX: !img.flipX })}
        >
          <FlipHorizontal />
        </Toggle>
        <Toggle
          label="Flip vertical"
          on={!!img.flipY}
          onClick={() => set({ flipY: !img.flipY })}
        >
          <FlipVertical />
        </Toggle>
      </div>
      <SliderRow
        label="Brightness"
        value={Math.round(a.brightness * 100)}
        min={-100}
        max={100}
        onChange={(v) => adjust({ brightness: v / 100 })}
      />
      <SliderRow
        label="Contrast"
        value={Math.round(a.contrast * 100)}
        min={-100}
        max={100}
        onChange={(v) => adjust({ contrast: v / 100 })}
      />
      <SliderRow
        label="Saturation"
        value={Math.round(a.saturation * 100)}
        min={-100}
        max={100}
        onChange={(v) => adjust({ saturation: v / 100 })}
      />
      <SliderRow
        label="Blur"
        value={Math.round(a.blur * 100)}
        min={0}
        max={50}
        onChange={(v) => adjust({ blur: v / 100 })}
      />
      <div className="flex items-center justify-between">
        <Label htmlFor="gray">Black and white</Label>
        <Switch
          id="gray"
          checked={a.grayscale}
          onCheckedChange={(on) => adjust({ grayscale: on })}
        />
      </div>
    </div>
  );
}

function Layers({
  c,
  refresh,
  record,
}: {
  c: Canvas;
  refresh: () => void;
  record: () => void;
}) {
  const objs = c.getObjects().slice().reverse();
  const active = c.getActiveObjects();
  if (!objs.length) return null;
  return (
    <section className="mt-5 border-t pt-3">
      <h3 className="mb-1.5 text-sm font-semibold">Layers</h3>
      <ul className="space-y-0.5">
        {objs.map((o, i) => (
          <li
            key={i}
            className={cn(
              "flex items-center gap-1 rounded-md pr-1 text-sm",
              active.includes(o) ? "bg-muted" : "hover:bg-muted/60",
            )}
          >
            <button
              type="button"
              className="min-w-0 flex-1 truncate px-2 py-1.5 text-left"
              onClick={() => {
                c.setActiveObject(o);
                c.requestRenderAll();
                refresh();
              }}
            >
              {layerLabel(o)}
            </button>
            <IconBtn
              label={o.visible ? "Hide" : "Show"}
              onClick={() => (
                o.set({ visible: !o.visible }),
                c.requestRenderAll(),
                record(),
                refresh()
              )}
            >
              {o.visible ? <Eye /> : <EyeOff />}
            </IconBtn>
            <IconBtn
              label={isLocked(o) ? "Unlock" : "Lock"}
              onClick={() => (
                setLocked(o, !isLocked(o)),
                c.requestRenderAll(),
                record(),
                refresh()
              )}
            >
              {isLocked(o) ? <Lock /> : <Unlock />}
            </IconBtn>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Small controls ---------- */

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 [&_svg]:size-4"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

function Toggle({
  label,
  on,
  onClick,
  children,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md border [&_svg]:size-4",
        on ? "border-foreground bg-muted" : "hover:bg-muted/60",
      )}
    >
      {children}
    </button>
  );
}

function NumField({
  label,
  value,
  onChange,
  disabled,
  className,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  // Follow external changes (dragging on the canvas) without an effect.
  const [shown, setShown] = useState(value);
  if (shown !== value) {
    setShown(value);
    setDraft(String(value));
  }
  const commit = () => {
    const n = Number(draft);
    if (Number.isFinite(n) && n !== value) onChange(n);
    else setDraft(String(value));
  };
  return (
    <label className={cn("block", className)}>
      <span className="mb-0.5 block text-[11px] text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className="tabular h-8 w-full rounded-md border bg-background px-1.5 text-sm disabled:opacity-50"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
  brand,
  allowNone,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  brand: string[];
  allowNone?: boolean;
}) {
  const hex = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  const none = !value || value === "rgba(0,0,0,0)" || value === "transparent";
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap items-center gap-1.5">
        <label
          className={cn(
            "relative size-7 cursor-pointer overflow-hidden rounded-md border",
            none && "checker",
          )}
          title="Custom colour"
        >
          <span className="sr-only">{label} colour</span>
          {!none && (
            <span className="absolute inset-0" style={{ background: value }} />
          )}
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
        {allowNone && (
          <button
            type="button"
            onClick={() => onChange("")}
            className={cn(
              "h-7 rounded-md border px-2 text-xs",
              none && "border-foreground",
            )}
          >
            None
          </button>
        )}
        {[...brand, "#ffffff", "#111111"].map((c, i) => (
          <button
            key={`${c}-${i}`}
            type="button"
            aria-label={`Use ${c}`}
            onClick={() => onChange(c)}
            className="size-7 rounded-md border"
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  );
}

function CustomSize({
  page,
  onChange,
}: {
  page: Page;
  onChange: (w: number, h: number) => void;
}) {
  const [w, setW] = useState(page.w);
  const [h, setH] = useState(page.h);
  return (
    <form
      className="flex items-center gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        if (w >= 50 && h >= 50 && w <= 8000 && h <= 8000) onChange(w, h);
        else toast.error("Use a size between 50 and 8000 px.");
      }}
    >
      <Input
        type="number"
        aria-label="Width (px)"
        value={w}
        onChange={(e) => setW(Number(e.target.value))}
        className="h-8 w-20"
      />
      <span className="text-muted-foreground">×</span>
      <Input
        type="number"
        aria-label="Height (px)"
        value={h}
        onChange={(e) => setH(Number(e.target.value))}
        className="h-8 w-20"
      />
      <Button type="submit" size="sm" variant="outline">
        Set
      </Button>
    </form>
  );
}

function ExportMenu({
  onPick,
}: {
  onPick: (f: "png" | "jpg" | "webp" | "svg" | "pdf" | "project") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) =>
      !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  const items: [Parameters<typeof onPick>[0], string, string][] = [
    ["png", "PNG", "Sharp, keeps transparency"],
    ["jpg", "JPG", "Smaller, for photos"],
    ["webp", "WebP", "Smallest for the web"],
    ["svg", "SVG", "Vector, for editing elsewhere"],
    ["pdf", "PDF", "Print at real size"],
    ["project", "Project file", "Reopen and edit later"],
  ];
  return (
    <div ref={ref} className="relative">
      <Button size="sm" onClick={() => setOpen(!open)} aria-expanded={open}>
        Download
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-60 rounded-lg border bg-popover p-1 shadow-lg"
        >
          {items.map(([id, label, hint]) => (
            <button
              key={id}
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                onPick(id);
              }}
              className="flex w-full items-baseline justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted"
            >
              <span className="font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">{hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function useBrand(): [string[], (c: string[]) => void] {
  // Client-only component (see ui-registry), so browser storage can seed the state.
  const [colors, setColors] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(BRAND_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const set = (c: string[]) => {
    setColors(c);
    try {
      localStorage.setItem(BRAND_KEY, JSON.stringify(c));
    } catch {}
  };
  return [colors, set];
}

function collectFonts(json: {
  objects?: { fontFamily?: string; objects?: unknown[] }[];
}): string[] {
  return (json.objects ?? []).flatMap((o) =>
    o.fontFamily ? [o.fontFamily] : [],
  );
}

const slug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "design";
