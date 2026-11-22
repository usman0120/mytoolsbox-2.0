"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDrop } from "@/components/tools/file-drop";
import { segment, type SegmentStatus } from "@/lib/ml/segment";
import { baseName, canvasFrom, download, formatBytes, loadBitmap, pixelsOf, toBlob } from "@/lib/image/canvas";
import { composite, hexToRgb, refineMask } from "../remove-background/engine";
import { SliderRow } from "../remove-background/ui";
import { PAPERS, PRESETS, encodeUnder, findHead, fitCrop, headHeightMm, mmToPx, setJpegDpi, sheetLayout, type Head, type PhotoPreset } from "./engine";

const DPI = 300;
const BACKGROUNDS = [
  { value: "#ffffff", label: "White" },
  { value: "#f2f2f2", label: "Light grey" },
  { value: "#dbe8f5", label: "Light blue" },
];

function defaultPreset(): string {
  if (typeof navigator === "undefined") return "us";
  const l = navigator.language.toLowerCase();
  const map: [RegExp, string][] = [[/-gb$/, "uk"], [/-in$|^hi/, "india"], [/-pk$|^ur/, "pakistan"], [/-ca$/, "canada"], [/-au$/, "australia"], [/^zh/, "china"], [/^ja/, "japan"], [/^(de|fr|es|it|nl|pt|pl|sv|da|fi|el|cs|hu|ro)/, "schengen"]];
  return map.find(([re]) => re.test(l))?.[1] ?? "us";
}

export function PassportPhotoMaker() {
  const [file, setFile] = useState<File | null>(null);
  const [presetId, setPresetId] = useState(defaultPreset);
  const [custom, setCustom] = useState({ w: 35, h: 45 });
  // undefined = use the selected document's usual value.
  const [bgChoice, setBg] = useState<string | null | undefined>(undefined);
  const [status, setStatus] = useState<SegmentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [head, setHead] = useState<Head | null>(null);
  const [headDelta, setHeadDelta] = useState(0);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [maxKbChoice, setMaxKb] = useState<string | undefined>(undefined);
  const [paper, setPaper] = useState(PAPERS[0].id);
  const [sizeNote, setSizeNote] = useState<string | null>(null);
  const source = useRef<{ px: ImageData; mask: Uint8Array } | null>(null);
  const composed = useRef<HTMLCanvasElement | null>(null);
  const photo = useRef<HTMLCanvasElement>(null);
  const run = useRef(0);

  const preset: PhotoPreset = useMemo(() => {
    if (presetId !== "custom") return PRESETS.find((p) => p.id === presetId)!;
    const h = Math.min(Math.max(custom.h, 20), 120), w = Math.min(Math.max(custom.w, 20), 120);
    return { id: "custom", name: "Custom", widthMm: w, heightMm: h, headMinMm: +(h * 0.69).toFixed(1), headMaxMm: +(h * 0.8).toFixed(1), background: "#ffffff" };
  }, [presetId, custom]);
  const mid = (preset.headMinMm + preset.headMaxMm) / 2;

  const headMm = +(mid + headDelta).toFixed(1);
  const bg = bgChoice === undefined ? preset.background : bgChoice;
  const maxKb = maxKbChoice ?? (preset.maxKb ? String(preset.maxKb) : "");
  const choosePreset = (id: string) => {
    setPresetId(id);
    setHeadDelta(0);
    setDx(0);
    setDy(0);
    setBg(undefined);
    setMaxKb(undefined);
  };

  const open = useCallback(async (f: File) => {
    if (!f.type.startsWith("image/")) return setError("Choose a JPG, PNG or WebP photo.");
    const job = ++run.current;
    setFile(f);
    setError(null);
    setHead(null);
    source.current = null;
    setStatus({ phase: "download", percent: 0 });
    try {
      const bitmap = await loadBitmap(f);
      const px = pixelsOf(bitmap);
      bitmap.close();
      const r = await segment(f, "person", (s) => job === run.current && setStatus(s));
      if (job !== run.current) return;
      const found = findHead(r.mask, r.width, r.height);
      if (!found) throw new Error("Couldn't find a person in this photo. Use a photo with your head and shoulders visible.");
      source.current = { px, mask: refineMask(r.mask, r.width, r.height, { strength: 30, feather: 1 }) };
      setHead(found);
    } catch (e) {
      if (job === run.current) setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      if (job === run.current) setStatus(null);
    }
  }, []);

  // Background change: recomposite the full-size photo once.
  useEffect(() => {
    const s = source.current;
    if (!s || !head) return;
    composed.current = canvasFrom(bg ? composite(s.px.data, s.mask, hexToRgb(bg)) : s.px.data, s.px.width, s.px.height);
  }, [bg, head]);

  const crop = useMemo(() => (head ? fitCrop(preset, head, { zoom: headMm / mid, dxMm: dx, dyMm: dy }) : null), [head, preset, headMm, mid, dx, dy]);

  // Draw the final photo at print resolution.
  useEffect(() => {
    const c = photo.current;
    if (!c || !crop || !composed.current) return;
    c.width = mmToPx(preset.widthMm, DPI);
    c.height = mmToPx(preset.heightMm, DPI);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = bg ?? "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(composed.current, crop.x, crop.y, crop.w, crop.h, 0, 0, c.width, c.height);
    setSizeNote(null);
  }, [crop, preset, bg, head]);

  const measured = head && crop ? headHeightMm(preset, head, crop) : 0;
  const ok = measured >= preset.headMinMm - 0.05 && measured <= preset.headMaxMm + 0.05;
  // Fixed guides: where the crown should sit and the band the chin must fall in.
  const topMm = (preset.heightMm - mid) * 0.4;

  const jpeg = async (canvas: HTMLCanvasElement, limitKb?: number) => {
    const encode = (q: number) => toBlob(canvas, "image/jpeg", q);
    const r = limitKb ? await encodeUnder(encode, limitKb * 1024) : { blob: await encode(0.95), fits: true };
    const bytes = setJpegDpi(new Uint8Array(await r.blob.arrayBuffer()), DPI);
    return { blob: new Blob([bytes as BlobPart], { type: "image/jpeg" }), fits: r.fits };
  };

  const savePhoto = async () => {
    if (!photo.current || !file) return;
    const limit = Number(maxKb) > 0 ? Number(maxKb) : undefined;
    const { blob, fits } = await jpeg(photo.current, limit);
    setSizeNote(limit && !fits ? `Couldn't get under ${limit} KB at this size. Saved ${formatBytes(blob.size)}.` : `Saved ${formatBytes(blob.size)}.`);
    download(blob, `${baseName(file.name)}-${preset.id}-${preset.widthMm}x${preset.heightMm}mm.jpg`);
  };

  const sheet = () => {
    const p = PAPERS.find((x) => x.id === paper)!;
    return { p, layout: sheetLayout(p, { widthMm: preset.widthMm, heightMm: preset.heightMm }) };
  };

  const savePdf = async () => {
    if (!photo.current || !file) return;
    const { p, layout } = sheet();
    const { PDFDocument, rgb } = await import("pdf-lib");
    const pt = (mm: number) => (mm * 72) / 25.4;
    const doc = await PDFDocument.create();
    const page = doc.addPage([pt(p.widthMm), pt(p.heightMm)]);
    const img = await doc.embedJpg(await (await jpeg(photo.current)).blob.arrayBuffer());
    for (const pos of layout.positions) {
      const x = pt(pos.x), y = pt(p.heightMm - pos.y - preset.heightMm), w = pt(preset.widthMm), h = pt(preset.heightMm);
      page.drawImage(img, { x, y, width: w, height: h });
      page.drawRectangle({ x, y, width: w, height: h, borderColor: rgb(0.75, 0.75, 0.75), borderWidth: 0.25 });
    }
    doc.setTitle(`${preset.name} print sheet`);
    download(new Blob([(await doc.save()) as BlobPart], { type: "application/pdf" }), `${baseName(file.name)}-print-${p.id}.pdf`);
  };

  const saveSheetJpg = async () => {
    if (!photo.current || !file) return;
    const { p, layout } = sheet();
    const c = document.createElement("canvas");
    c.width = mmToPx(p.widthMm, DPI);
    c.height = mmToPx(p.heightMm, DPI);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#bfbfbf";
    for (const pos of layout.positions) {
      const x = mmToPx(pos.x, DPI), y = mmToPx(pos.y, DPI), w = mmToPx(preset.widthMm, DPI), h = mmToPx(preset.heightMm, DPI);
      ctx.drawImage(photo.current, x, y, w, h);
      ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
    }
    download((await jpeg(c)).blob, `${baseName(file.name)}-print-${p.id}.jpg`);
  };

  const count = sheet().layout.positions.length;

  return (
    <div className="space-y-4">
      {!file ? (
        <>
          <FileDrop
            accept="image/jpeg,image/png,image/webp"
            onFile={open}
            title="Add a photo of your face"
            hint="Face the camera, keep a neutral expression, and use even light. The photo is processed on your device and never uploaded."
            button="Choose photo"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="relative flex min-h-[360px] items-center justify-center rounded-xl border bg-muted/40 p-6">
              {head ? (
                <figure className="relative" style={{ aspectRatio: `${preset.widthMm} / ${preset.heightMm}`, height: "min(56vh, 460px)", maxWidth: "100%" }}>
                  <canvas ref={photo} className="size-full shadow-sm" aria-label="Passport photo preview" />
                  <svg viewBox={`0 0 ${preset.widthMm} ${preset.heightMm}`} className="pointer-events-none absolute inset-0 size-full" aria-hidden>
                    <line x1={preset.widthMm / 2} y1="0" x2={preset.widthMm / 2} y2={preset.heightMm} stroke="#0ea5e9" strokeWidth="0.15" strokeDasharray="0.8 0.8" />
                    <line x1="0" y1={topMm} x2={preset.widthMm} y2={topMm} stroke="#0ea5e9" strokeWidth="0.2" />
                    <rect x="0" y={topMm + preset.headMinMm} width={preset.widthMm} height={preset.headMaxMm - preset.headMinMm} fill="#0ea5e9" opacity="0.18" />
                  </svg>
                  <figcaption className="sr-only">Top line marks the crown; the shaded band is where the chin should be.</figcaption>
                </figure>
              ) : status ? (
                <p role="status" className="text-sm text-muted-foreground">
                  {status.phase === "download" ? `Downloading the face model (7 MB, first time only)… ${status.percent}%` : "Finding your face and replacing the background…"}
                </p>
              ) : (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className={head ? (ok ? "text-muted-foreground" : "font-medium text-destructive") : "text-muted-foreground"}>
                {head
                  ? `Head height ${measured.toFixed(1)} mm (allowed ${preset.headMinMm}–${preset.headMaxMm} mm). Crown on the line, chin inside the band.`
                  : file.name}
              </span>
              <div className="flex gap-2">
                <FileDrop compact accept="image/jpeg,image/png,image/webp" onFile={open} title="" button="Replace photo" />
              </div>
            </div>
          </div>

          <aside className="space-y-5 rounded-xl border bg-card p-4" aria-label="Photo settings">
            <div className="space-y-2">
              <Label htmlFor="preset">Document</Label>
              <select id="preset" value={presetId} onChange={(e) => choosePreset(e.target.value)} className="h-9 w-full rounded-lg border bg-background px-2 text-sm">
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                <option value="custom">Custom size</option>
              </select>
              {presetId === "custom" && (
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" aria-label="Width in mm" value={custom.w} min={20} max={120} onChange={(e) => setCustom({ ...custom, w: Number(e.target.value) })} />
                  <Input type="number" aria-label="Height in mm" value={custom.h} min={20} max={120} onChange={(e) => setCustom({ ...custom, h: Number(e.target.value) })} />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Rules change. Check the official requirements before you submit.</p>
            </div>

            <div className="space-y-2">
              <Label>Background</Label>
              <div className="flex flex-wrap gap-2">
                {BACKGROUNDS.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    aria-pressed={bg === b.value}
                    onClick={() => setBg(b.value)}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm ${bg === b.value ? "border-foreground" : "hover:border-foreground/30"}`}
                  >
                    <span className="size-4 rounded-sm border" style={{ background: b.value }} />
                    {b.label}
                  </button>
                ))}
                <button type="button" aria-pressed={bg === null} onClick={() => setBg(null)} className={`rounded-lg border px-2.5 py-1.5 text-sm ${bg === null ? "border-foreground" : "hover:border-foreground/30"}`}>
                  Keep original
                </button>
              </div>
            </div>

            <fieldset disabled={!head} className="space-y-4">
              <SliderRow label="Head size" value={headMm} min={+(preset.headMinMm - 3).toFixed(1)} max={+(preset.headMaxMm + 3).toFixed(1)} step={0.1} onChange={(v) => setHeadDelta(v - mid)} suffix=" mm" />
              <SliderRow label="Move up / down" value={dy} min={-8} max={8} step={0.2} onChange={setDy} suffix=" mm" />
              <SliderRow label="Move left / right" value={dx} min={-8} max={8} step={0.2} onChange={setDx} suffix=" mm" />
            </fieldset>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="maxkb">Digital photo</Label>
              <div className="flex gap-2">
                <Input id="maxkb" type="number" inputMode="numeric" placeholder="Max size (KB)" value={maxKb} onChange={(e) => setMaxKb(e.target.value)} className="min-w-0" />
                <Button disabled={!head} onClick={savePhoto} className="shrink-0">
                  Download JPG
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {sizeNote ?? `${mmToPx(preset.widthMm, DPI)}×${mmToPx(preset.heightMm, DPI)} px at ${DPI} DPI. Leave max size empty for best quality.`}
              </p>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="paper">Print sheet</Label>
              <select id="paper" value={paper} onChange={(e) => setPaper(e.target.value)} className="h-9 w-full rounded-lg border bg-background px-2 text-sm">
                {PAPERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled={!head || !count} onClick={savePdf}>
                  PDF
                </Button>
                <Button variant="outline" disabled={!head || !count} onClick={saveSheetJpg}>
                  JPG
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{count} photos per sheet. Print at 100% (actual size), then cut along the grey lines.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
