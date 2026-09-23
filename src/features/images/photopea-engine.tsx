"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  ImageIcon,
  Trash2,
  SlidersHorizontal,
  Sun,
  Contrast,
  Droplets,
  Sparkles,
  Layers,
  Palette,
  Eye,
  RotateCw,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FilterPreset {
  id: string;
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  hue: number;
}

const FILTER_PRESETS: FilterPreset[] = [
  { id: "normal", name: "Original", brightness: 100, contrast: 100, saturation: 100, sepia: 0, hue: 0 },
  { id: "vivid", name: "Vivid Color", brightness: 105, contrast: 120, saturation: 135, sepia: 0, hue: 0 },
  { id: "golden", name: "Golden Hour", brightness: 108, contrast: 110, saturation: 120, sepia: 25, hue: -5 },
  { id: "cyber", name: "Cyberpunk", brightness: 110, contrast: 130, saturation: 150, sepia: 0, hue: 140 },
  { id: "noir", name: "B&W Noir", brightness: 100, contrast: 140, saturation: 0, sepia: 0, hue: 0 },
  { id: "vintage", name: "Vintage Film", brightness: 95, contrast: 90, saturation: 80, sepia: 40, hue: 10 },
];

export function PhotopeaEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [sepia, setSepia] = useState<number>(0);
  const [hue, setHue] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("png");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    handleResetAdjustments();
  }, []);

  const handleResetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSepia(0);
    setHue(0);
    setBlur(0);
    setRotation(0);
  };

  const handleApplyPreset = (p: FilterPreset) => {
    setBrightness(p.brightness);
    setContrast(p.contrast);
    setSaturation(p.saturation);
    setSepia(p.sepia);
    setHue(p.hue);
  };

  const handleExport = () => {
    if (!preview) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const rad = (rotation * Math.PI) / 180;
      const absCos = Math.abs(Math.cos(rad));
      const absSin = Math.abs(Math.sin(rad));

      const w = Math.round(img.naturalWidth * absCos + img.naturalHeight * absSin);
      const h = Math.round(img.naturalWidth * absSin + img.naturalHeight * absCos);

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Apply CSS-compatible canvas filter string
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) hue-rotate(${hue}deg) blur(${blur}px)`;

      ctx.translate(w / 2, h / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      const mime = exportFormat === "png" ? "image/png" : exportFormat === "webp" ? "image/webp" : "image/jpeg";
      const ext = exportFormat === "jpeg" ? "jpg" : exportFormat;

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file?.name.replace(/\.[^.]+$/, "") || "edited"}_studio.${ext}`;
        a.click();
      }, mime, 0.95);
    };
    img.src = preview;
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    handleResetAdjustments();
  };

  const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) hue-rotate(${hue}deg) blur(${blur}px)`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">
            Photopea Creative Studio
          </Badge>
          <span className="text-xs text-muted-foreground">
            In-browser photo editor with color grading, presets, filter curves, and high-res export
          </span>
        </div>
        {file && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" /> Start Over
          </Button>
        )}
      </div>

      {!file && (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            dragOver ? "border-sky-500 bg-sky-500/5 scale-[0.99]" : "border-border/60 hover:border-sky-500/40 bg-card/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 ring-1 ring-sky-500/20 text-sky-600">
            <ImageIcon className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base mb-1">Open Image in Creative Studio</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Professional color grading, cinematic presets, saturation, contrast, and high-fidelity PNG/WebP exports.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <Button size="sm" className="rounded-xl gap-2 pointer-events-none bg-sky-600 hover:bg-sky-700 text-white">
            <Upload className="h-4 w-4" /> Select Image
          </Button>
        </div>
      )}

      {file && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 shrink-0">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>Full Resolution Canvas</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as typeof exportFormat)}
                className="rounded-xl border border-border/50 bg-background px-3 py-1.5 text-xs font-medium h-9"
              >
                <option value="png">PNG (Lossless)</option>
                <option value="webp">WebP (Compact)</option>
                <option value="jpeg">JPEG (Universal)</option>
              </select>

              <Button onClick={handleExport} className="gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-xs">
                <Download className="h-4 w-4" /> Export {exportFormat.toUpperCase()}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-5">
                  {/* Preset Filters */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Wand2 className="h-3.5 w-3.5 text-sky-600" /> Color Presets
                      </Label>
                      <button onClick={handleResetAdjustments} className="text-[11px] text-sky-600 hover:underline">
                        Reset All
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {FILTER_PRESETS.map((p) => (
                        <Button
                          key={p.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs"
                          onClick={() => handleApplyPreset(p)}
                        >
                          {p.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Adjustment Sliders */}
                  <div className="space-y-4 pt-2 border-t border-border/40">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <Label className="text-xs flex items-center gap-1.5"><Sun className="h-3.5 w-3.5 text-amber-500" /> Brightness</Label>
                        <span className="font-mono text-muted-foreground">{brightness}%</span>
                      </div>
                      <Slider value={[brightness]} onValueChange={(v) => setBrightness(Array.isArray(v) ? v[0] : v)} min={20} max={200} step={1} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <Label className="text-xs flex items-center gap-1.5"><Contrast className="h-3.5 w-3.5 text-blue-500" /> Contrast</Label>
                        <span className="font-mono text-muted-foreground">{contrast}%</span>
                      </div>
                      <Slider value={[contrast]} onValueChange={(v) => setContrast(Array.isArray(v) ? v[0] : v)} min={20} max={220} step={1} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <Label className="text-xs flex items-center gap-1.5"><Droplets className="h-3.5 w-3.5 text-emerald-500" /> Saturation</Label>
                        <span className="font-mono text-muted-foreground">{saturation}%</span>
                      </div>
                      <Slider value={[saturation]} onValueChange={(v) => setSaturation(Array.isArray(v) ? v[0] : v)} min={0} max={220} step={1} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <Label className="text-xs flex items-center gap-1.5"><Palette className="h-3.5 w-3.5 text-purple-500" /> Hue Shift</Label>
                        <span className="font-mono text-muted-foreground">{hue}°</span>
                      </div>
                      <Slider value={[hue]} onValueChange={(v) => setHue(Array.isArray(v) ? v[0] : v)} min={-180} max={180} step={5} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <Label className="text-xs">Sepia Vintage Tone</Label>
                        <span className="font-mono text-muted-foreground">{sepia}%</span>
                      </div>
                      <Slider value={[sepia]} onValueChange={(v) => setSepia(Array.isArray(v) ? v[0] : v)} min={0} max={100} step={5} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <Label className="text-xs">Soft Focus Blur</Label>
                        <span className="font-mono text-muted-foreground">{blur}px</span>
                      </div>
                      <Slider value={[blur]} onValueChange={(v) => setBlur(Array.isArray(v) ? v[0] : v)} min={0} max={15} step={0.5} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <Label className="text-xs flex items-center gap-1.5"><RotateCw className="h-3.5 w-3.5 text-sky-500" /> Rotation</Label>
                        <span className="font-mono text-muted-foreground">{rotation}°</span>
                      </div>
                      <Slider value={[rotation]} onValueChange={(v) => setRotation(Array.isArray(v) ? v[0] : v)} min={-180} max={180} step={1} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Preview */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-sky-600" /> Live Canvas Render
                    </span>
                    <span className="text-muted-foreground text-[11px]">GPU-Accelerated Filters</span>
                  </div>

                  <div className="relative rounded-xl border border-border/50 bg-black/5 dark:bg-black/30 overflow-hidden min-h-[420px] flex items-center justify-center p-4">
                    {preview && (
                      <img
                        src={preview}
                        alt="Photopea Preview"
                        className="max-h-[500px] w-auto max-w-full object-contain rounded-lg shadow-sm transition-all duration-150"
                        style={{
                          filter: filterStyle,
                          transform: `rotate(${rotation}deg)`,
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}