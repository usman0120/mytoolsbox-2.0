"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  SlidersHorizontal,
  Trash2,
  Sun,
  Contrast,
  Droplets,
  Eye,
  Zap,
  Palette,
  Sparkles,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

type Preset = "auto" | "portrait" | "landscape" | "shadows" | "crisp" | "bw";

interface PresetConfig {
  label: string;
  desc: string;
  icon: string;
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  sharpen: number;
}

const PRESETS: Record<Preset, PresetConfig> = {
  auto: {
    label: "Intelligent Auto",
    desc: "Universal balanced clarity & exposure",
    icon: "⚡",
    brightness: 4,
    contrast: 1.08,
    saturation: 1.15,
    warmth: 2,
    sharpen: 0.35,
  },
  portrait: {
    label: "Beautify Portrait",
    desc: "Soft skin tones & radiant highlights",
    icon: "✨",
    brightness: 6,
    contrast: 1.04,
    saturation: 1.08,
    warmth: 8,
    sharpen: 0.2,
  },
  landscape: {
    label: "Vivid Landscape",
    desc: "Deep atmospheric blues & foliage pop",
    icon: "🏞️",
    brightness: 2,
    contrast: 1.16,
    saturation: 1.35,
    warmth: 4,
    sharpen: 0.5,
  },
  shadows: {
    label: "Shadow Recovery",
    desc: "Lift dark underexposed details",
    icon: "☀️",
    brightness: 18,
    contrast: 1.02,
    saturation: 1.1,
    warmth: 0,
    sharpen: 0.3,
  },
  crisp: {
    label: "Crisp & Dehazed",
    desc: "Cut through haze with razor clarity",
    icon: "🔍",
    brightness: -2,
    contrast: 1.2,
    saturation: 1.15,
    warmth: -4,
    sharpen: 0.7,
  },
  bw: {
    label: "Fine-Art Monochrome",
    desc: "High-dynamic studio black & white",
    icon: "🎞️",
    brightness: 0,
    contrast: 1.25,
    saturation: 0,
    warmth: 0,
    sharpen: 0.45,
  },
};

export function PerfectlyClearEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);

  // Settings
  const [activePreset, setActivePreset] = useState<Preset>("auto");
  const [strength, setStrength] = useState(100); // 0-100%
  const [fineClarity, setFineClarity] = useState(0); // -20 to 50
  const [fineExposure, setFineExposure] = useState(0); // -30 to 30
  const [showOriginal, setShowOriginal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setBaseImage(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  };

  const renderCanvas = useCallback(() => {
    if (!baseImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = baseImage.naturalWidth || baseImage.width;
    canvas.height = baseImage.naturalHeight || baseImage.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (showOriginal) {
      ctx.drawImage(baseImage, 0, 0);
      return;
    }

    ctx.drawImage(baseImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;

    const cfg = PRESETS[activePreset];
    const blend = strength / 100;
    const bAdj = (cfg.brightness + fineExposure) * 1.8;
    const cf = cfg.contrast;
    const sf = cfg.saturation;
    const wAdj = cfg.warmth;

    for (let i = 0; i < data.length; i += 4) {
      const origR = data[i];
      const origG = data[i + 1];
      const origB = data[i + 2];

      let r = Math.min(255, Math.max(0, origR + bAdj));
      let g = Math.min(255, Math.max(0, origG + bAdj));
      let b = Math.min(255, Math.max(0, origB + bAdj));

      // Contrast
      r = Math.min(255, Math.max(0, ((r / 255 - 0.5) * cf + 0.5) * 255));
      g = Math.min(255, Math.max(0, ((g / 255 - 0.5) * cf + 0.5) * 255));
      b = Math.min(255, Math.max(0, ((b / 255 - 0.5) * cf + 0.5) * 255));

      // Warmth
      if (wAdj !== 0) {
        r = Math.min(255, r + wAdj);
        b = Math.max(0, b - wAdj);
      }

      // Saturation
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = Math.min(255, lum + (r - lum) * sf);
      g = Math.min(255, lum + (g - lum) * sf);
      b = Math.min(255, lum + (b - lum) * sf);

      data[i] = Math.round(origR * (1 - blend) + r * blend);
      data[i + 1] = Math.round(origG * (1 - blend) + g * blend);
      data[i + 2] = Math.round(origB * (1 - blend) + b * blend);
    }

    ctx.putImageData(imageData, 0, 0);

    // Apply Sharpening convolution if cfg.sharpen > 0 or fineClarity > 0
    const totalSharpen = (cfg.sharpen + fineClarity / 100) * blend;
    if (totalSharpen > 0.05) {
      const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const dstData = ctx.createImageData(canvas.width, canvas.height);
      const src = srcData.data;
      const dst = dstData.data;
      const w = canvas.width;
      const h = canvas.height;
      const s = Math.min(0.8, totalSharpen);

      const kernel = [0, -s, 0, -s, 1 + 4 * s, -s, 0, -s, 0];

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          let r = 0, g = 0, b = 0;
          let k = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * w + (x + kx)) * 4;
              const weight = kernel[k++];
              r += src[idx] * weight;
              g += src[idx + 1] * weight;
              b += src[idx + 2] * weight;
            }
          }
          const dstIdx = (y * w + x) * 4;
          dst[dstIdx] = Math.min(255, Math.max(0, r));
          dst[dstIdx + 1] = Math.min(255, Math.max(0, g));
          dst[dstIdx + 2] = Math.min(255, Math.max(0, b));
          dst[dstIdx + 3] = src[(y * w + x) * 4 + 3];
        }
      }
      ctx.putImageData(dstData, 0, 0);
    }
  }, [baseImage, activePreset, strength, fineClarity, fineExposure, showOriginal]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/jpeg", 0.95);
    const base = file?.name.replace(/\.[^.]+$/, "") || "perfectly_clear";
    a.download = `${base}_${activePreset}.jpg`;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setBaseImage(null);
    setActivePreset("auto");
    setStrength(100);
    setFineClarity(0);
    setFineExposure(0);
  };

  return (
    <div className="space-y-6">
      {!file && (
        <div
          className="border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 border-muted-foreground/25"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) handleLoadFile(e.dataTransfer.files[0]);
          }}
        >
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <SlidersHorizontal className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Perfectly Clear Automatic Studio</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Intelligent portrait beautification, landscape depth, shadow lift, and high-frequency sharpness.
          </p>
          <Button variant="outline" className="rounded-xl shadow-xs">
            Browse Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleLoadFile(e.target.files[0])}
          />
        </div>
      )}

      {file && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl border bg-card/60 backdrop-blur-sm space-y-4">
              <div>
                <h4 className="font-semibold text-sm">Correction Profile</h4>
                <p className="text-xs text-muted-foreground">Select professional lab correction</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PRESETS) as Preset[]).map((key) => {
                  const p = PRESETS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setActivePreset(key)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        activePreset === key
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
                          : "border-border/50 hover:border-primary/30 bg-background"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{p.icon}</span>
                        <p className="font-semibold text-xs text-foreground truncate">{p.label}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{p.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 pt-3 border-t">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium">Correction Intensity</Label>
                    <span className="text-xs text-muted-foreground">{strength}%</span>
                  </div>
                  <Slider
                    value={[strength]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(val) => setStrength(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium">Fine Clarity & Sharpen</Label>
                    <span className="text-xs text-muted-foreground">{fineClarity > 0 ? `+${fineClarity}` : fineClarity}%</span>
                  </div>
                  <Slider
                    value={[fineClarity]}
                    min={-20}
                    max={40}
                    step={1}
                    onValueChange={(val) => setFineClarity(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium">Exposure Trim</Label>
                    <span className="text-xs text-muted-foreground">{fineExposure > 0 ? `+${fineExposure}` : fineExposure}</span>
                  </div>
                  <Slider
                    value={[fineExposure]}
                    min={-25}
                    max={25}
                    step={1}
                    onValueChange={(val) => setFineExposure(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <Button onClick={handleDownload} className="w-full gap-2 rounded-xl">
                  <Download className="h-4 w-4" /> Download Perfectly Clear Photo
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Live Preview */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Live Preview
                </span>
                <Button
                  size="sm"
                  variant={showOriginal ? "secondary" : "outline"}
                  className="h-7 text-xs rounded-lg gap-1"
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  onClick={() => setShowOriginal(!showOriginal)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {showOriginal ? "Original" : "Hold to Compare"}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {baseImage ? `${baseImage.naturalWidth} × ${baseImage.naturalHeight} px` : ""}
                </span>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
              </div>
            </div>

            <div className="relative border rounded-2xl overflow-hidden bg-dot-pattern flex items-center justify-center p-4 min-h-[460px] max-h-[640px] shadow-xs">
              <canvas
                ref={canvasRef}
                className="max-h-[580px] w-auto max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}