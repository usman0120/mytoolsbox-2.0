"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { FileDrop, Segmented } from "@/components/tools/file-drop";
import { segment, type SegmentStatus } from "@/lib/ml/segment";
import { SEGMENT_MODELS, type SegmentModel } from "@/lib/ml/segment-models";
import { baseName, canvasFrom, download, formatBytes, loadBitmap, pixelsOf, toBlob } from "@/lib/image/canvas";
import { composite, hexToRgb, maskBounds, refineMask } from "./engine";

const SWATCHES = ["#ffffff", "#f2f2f2", "#000000", "#2563eb", "#dbeafe", "#16a34a", "#fde68a"];
type Format = "png" | "jpg" | "webp";

export function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState<SegmentModel>("object");
  const [status, setStatus] = useState<SegmentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mask, setMask] = useState<{ data: Uint8Array; w: number; h: number } | null>(null);
  const [bg, setBg] = useState<string | null>(null);
  const [strength, setStrength] = useState(35);
  const [feather, setFeather] = useState(1);
  const [trim, setTrim] = useState(false);
  const [format, setFormat] = useState<Format>("png");
  const [showOriginal, setShowOriginal] = useState(false);
  const pixels = useRef<ImageData | null>(null);
  const out = useRef<HTMLCanvasElement | null>(null);
  const view = useRef<HTMLDivElement>(null);
  const run = useRef(0);

  const process = useCallback(async (f: File, m: SegmentModel) => {
    const job = ++run.current;
    setError(null);
    setMask(null);
    setStatus({ phase: "download", percent: 0 });
    try {
      const bitmap = await loadBitmap(f);
      pixels.current = pixelsOf(bitmap);
      bitmap.close();
      const r = await segment(f, m, (s) => job === run.current && setStatus(s));
      if (job !== run.current) return;
      setMask({ data: r.mask, w: r.width, h: r.height });
    } catch (e) {
      if (job === run.current) setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      if (job === run.current) setStatus(null);
    }
  }, []);

  const open = (f: File) => {
    if (!f.type.startsWith("image/")) return setError("Choose a JPG, PNG or WebP image.");
    setFile(f);
    void process(f, model);
  };

  // Recompose whenever the mask or an option changes.
  useEffect(() => {
    const px = pixels.current;
    if (!mask || !px) return;
    const t = setTimeout(() => {
      const refined = refineMask(mask.data, mask.w, mask.h, { strength, feather });
      const rgba = composite(px.data, refined, bg ? hexToRgb(bg) : null);
      let canvas = canvasFrom(rgba, mask.w, mask.h);
      if (trim) {
        const b = maskBounds(refined, mask.w, mask.h, 24);
        if (b) {
          const pad = Math.round(Math.max(b.w, b.h) * 0.03);
          const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad);
          const w = Math.min(mask.w - x, b.w + pad * 2), h = Math.min(mask.h - y, b.h + pad * 2);
          const c = document.createElement("canvas");
          c.width = w;
          c.height = h;
          c.getContext("2d")!.drawImage(canvas, x, y, w, h, 0, 0, w, h);
          canvas = c;
        }
      }
      canvas.className = "max-h-[70vh] max-w-full object-contain";
      out.current = canvas;
      view.current?.replaceChildren(canvas);
    }, 60);
    return () => clearTimeout(t);
  }, [mask, strength, feather, bg, trim]);

  // JPG can't hold transparency; fall back to PNG while the background is transparent.
  const fmt: Format = !bg && format === "jpg" ? "png" : format;

  const save = async () => {
    if (!out.current || !file) return;
    const format = fmt;
    const type = format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    const blob = await toBlob(out.current, type, format === "png" ? undefined : 0.92);
    download(blob, `${baseName(file.name)}-no-bg.${format}`);
  };

  const reset = () => {
    run.current++;
    setFile(null);
    setMask(null);
    setStatus(null);
    setError(null);
    pixels.current = null;
  };

  const spec = SEGMENT_MODELS[model];
  const originalUrl = useObjectUrl(file);

  return (
    <div className="space-y-4">
      {!file ? (
        <>
          <FileDrop
            accept="image/jpeg,image/png,image/webp"
            onFile={open}
            title="Add a photo"
            hint="People, products, pets or objects. The AI model runs in your browser, so the photo is never uploaded."
            button="Choose photo"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="checker relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl border p-3" style={bg ? { background: "var(--muted)" } : undefined}>
              <div ref={view} className={showOriginal || !mask ? "hidden" : "contents"} />
              {(showOriginal || !mask) && originalUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={originalUrl} alt="Original photo" className={`max-h-[70vh] max-w-full object-contain ${status ? "opacity-50" : ""}`} />
              )}
              {status && <Progress status={status} sizeMb={spec.sizeMb} />}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <span className="truncate">
                {file.name} · {formatBytes(file.size)}
                {mask && ` · ${mask.w}×${mask.h}`}
              </span>
              <div className="flex gap-2">
                {mask && (
                  <Button
                    variant="outline"
                    size="sm"
                    onPointerDown={() => setShowOriginal(true)}
                    onPointerUp={() => setShowOriginal(false)}
                    onPointerLeave={() => setShowOriginal(false)}
                    onKeyDown={(e) => e.key === " " && setShowOriginal(true)}
                    onKeyUp={() => setShowOriginal(false)}
                  >
                    Hold to compare
                  </Button>
                )}
                <FileDrop compact accept="image/jpeg,image/png,image/webp" onFile={open} title="" button="Replace" />
                <Button variant="ghost" size="sm" onClick={reset}>
                  Clear
                </Button>
              </div>
            </div>
            {error && (
              <p className="mt-3 text-sm text-destructive">
                {error}{" "}
                <button type="button" className="underline underline-offset-4" onClick={() => process(file, model)}>
                  Try again
                </button>
              </p>
            )}
          </div>

          <aside className="space-y-5 rounded-xl border bg-card p-4" aria-label="Options">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Segmented
                label="Subject"
                value={model}
                onChange={(m) => {
                  setModel(m);
                  void process(file, m);
                }}
                options={[
                  { value: "object", label: "Any object" },
                  { value: "person", label: "Person" },
                ]}
              />
              <p className="text-xs text-muted-foreground">
                {model === "person" ? "Faster, best for portraits and selfies." : "Products, pets, cars and people."} Model downloads once ({spec.sizeMb} MB).
              </p>
            </div>

            <div className="space-y-2">
              <Label>Background</Label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-label="Transparent"
                  aria-pressed={bg === null}
                  onClick={() => setBg(null)}
                  className={`checker size-8 rounded-md border ${bg === null ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""}`}
                />
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Background ${c}`}
                    aria-pressed={bg === c}
                    onClick={() => setBg(c)}
                    className={`size-8 rounded-md border ${bg === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""}`}
                    style={{ background: c }}
                  />
                ))}
                <label className="relative size-8 cursor-pointer overflow-hidden rounded-md border" title="Custom colour">
                  <span className="sr-only">Custom colour</span>
                  <input type="color" value={bg ?? "#ffffff"} onChange={(e) => setBg(e.target.value)} className="absolute -inset-2 size-12 cursor-pointer" />
                </label>
              </div>
            </div>

            <SliderRow label="Edge cleanup" value={strength} min={0} max={100} onChange={setStrength} suffix="%" />
            <SliderRow label="Softness" value={feather} min={0} max={8} onChange={setFeather} suffix=" px" />

            <div className="flex items-center justify-between">
              <Label htmlFor="trim">Crop to subject</Label>
              <Switch id="trim" checked={trim} onCheckedChange={setTrim} />
            </div>

            <div className="space-y-2 border-t pt-4">
              <Segmented
                label="Format"
                value={fmt}
                onChange={setFormat}
                options={[
                  { value: "png", label: "PNG" },
                  ...(bg ? [{ value: "jpg" as Format, label: "JPG" }] : []),
                  { value: "webp", label: "WebP" },
                ]}
              />
              <Button className="w-full" disabled={!mask} onClick={save}>
                Download {fmt.toUpperCase()}
              </Button>
              {!bg && <p className="text-xs text-muted-foreground">PNG and WebP keep the transparent background.</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Progress({ status, sizeMb }: { status: SegmentStatus; sizeMb: number }) {
  const downloading = status.phase === "download";
  return (
    <div role="status" className="absolute inset-x-6 bottom-6 rounded-lg border bg-background/95 p-3 shadow-sm backdrop-blur">
      <p className="text-sm font-medium">{downloading ? `Downloading the model (${sizeMb} MB, first time only)` : "Removing the background…"}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full bg-foreground transition-[width] ${downloading ? "" : "w-1/3 animate-[indeterminate_1.2s_ease-in-out_infinite]"}`}
          style={downloading ? { width: `${status.percent}%` } : undefined}
        />
      </div>
    </div>
  );
}

export function SliderRow({ label, value, min, max, step = 1, onChange, suffix = "" }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <Label>{label}</Label>
        <span className="tabular text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <Slider aria-label={label} value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))} />
    </div>
  );
}

function useObjectUrl(blob: Blob | null) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  return url;
}
