"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Sparkles,
  Trash2,
  Wand,
  Eye,
  Sliders,
  Sun,
  Palette,
  Layers,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function RunwayEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);

  // Settings
  const [clarity, setClarity] = useState(40); // 0-100
  const [hdrTone, setHdrTone] = useState(25); // 0-100
  const [colorGrade, setColorGrade] = useState("cinematic"); // "cinematic" | "warm" | "cool" | "vibrant" | "neutral"
  const [warmth, setWarmth] = useState(10); // -50 to 50
  const [vignette, setVignette] = useState(20); // 0-100
  const [showOriginal, setShowOriginal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("png");

  // State
  const [isProcessing, setIsProcessing] = useState(false);
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
    const data = imageData.data;

    // Apply color grading and HDR tone curves
    const warmthVal = warmth * 0.8;
    const hdrBoost = (hdrTone / 100) * 0.4;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Pseudo HDR expansion
      if (hdrBoost > 0) {
        // Boost shadow midtones while guarding highlights
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const shadowGain = Math.sin((lum / 255) * Math.PI) * 45 * hdrBoost;
        r = Math.min(255, Math.max(0, r + shadowGain));
        g = Math.min(255, Math.max(0, g + shadowGain));
        b = Math.min(255, Math.max(0, b + shadowGain));
      }

      // Warmth & Color grade profiles
      if (colorGrade === "cinematic") {
        // Teal & Orange tone curve
        r = Math.min(255, Math.max(0, r * 1.08 + 4));
        b = Math.min(255, Math.max(0, b * 0.94 - 2));
        g = Math.min(255, Math.max(0, g * 1.02));
      } else if (colorGrade === "warm") {
        r = Math.min(255, r + 15);
        b = Math.max(0, b - 10);
      } else if (colorGrade === "cool") {
        r = Math.max(0, r - 10);
        b = Math.min(255, b + 18);
      } else if (colorGrade === "vibrant") {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, Math.max(0, lum + (r - lum) * 1.35));
        g = Math.min(255, Math.max(0, lum + (g - lum) * 1.35));
        b = Math.min(255, Math.max(0, lum + (b - lum) * 1.35));
      }

      if (warmthVal !== 0) {
        r = Math.min(255, Math.max(0, r + warmthVal));
        b = Math.min(255, Math.max(0, b - warmthVal));
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    ctx.putImageData(imageData, 0, 0);

    // Apply Clarity / Unsharp mask convolution if clarity > 0
    if (clarity > 0) {
      const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const dstData = ctx.createImageData(canvas.width, canvas.height);
      const src = srcData.data;
      const dst = dstData.data;
      const w = canvas.width;
      const h = canvas.height;
      const s = (clarity / 100) * 0.5;

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

    // Apply Vignette if > 0
    if (vignette > 0) {
      const radius = Math.max(canvas.width, canvas.height) * 0.75;
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        radius * (1 - vignette / 100 * 0.5),
        canvas.width / 2,
        canvas.height / 2,
        radius
      );
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, `rgba(0,0,0,${(vignette / 100) * 0.75})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [baseImage, clarity, hdrTone, colorGrade, warmth, vignette, showOriginal]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const mime = exportFormat === "png" ? "image/png" : exportFormat === "webp" ? "image/webp" : "image/jpeg";
    const dataUrl = canvasRef.current.toDataURL(mime, 0.95);
    const link = document.createElement("a");
    const base = file?.name.replace(/\.[^.]+$/, "") || "runway_enhanced";
    link.download = `${base}_enhanced.${exportFormat === "jpeg" ? "jpg" : exportFormat}`;
    link.href = dataUrl;
    link.click();
  };

  const handleReset = () => {
    setFile(null);
    setBaseImage(null);
    setClarity(40);
    setHdrTone(25);
    setColorGrade("cinematic");
    setWarmth(10);
    setVignette(20);
  };

  const colorGrades = [
    { id: "cinematic", label: "Cinematic" },
    { id: "vibrant", label: "Vivid Pop" },
    { id: "warm", label: "Golden Hour" },
    { id: "cool", label: "Nordic Cool" },
    { id: "neutral", label: "True Tone" },
  ];

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
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Runway AI Creative Enhancer</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Studio-grade clarity boost, HDR tone mapping, cinematic color grading, and lens effects.
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
                <h4 className="font-semibold text-sm">Color Grade Style</h4>
                <p className="text-xs text-muted-foreground">Select color mood preset</p>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {colorGrades.map((g) => (
                  <Button
                    key={g.id}
                    size="sm"
                    variant={colorGrade === g.id ? "default" : "outline"}
                    className="h-8 text-xs rounded-xl"
                    onClick={() => setColorGrade(g.id)}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>

              <div className="space-y-3 pt-3 border-t">
                <h5 className="font-semibold text-xs flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5" /> Creative Enhancements
                </h5>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <ZoomIn className="h-3 w-3" /> Micro-Contrast & Clarity
                    </Label>
                    <span className="text-xs text-muted-foreground">{clarity}%</span>
                  </div>
                  <Slider
                    value={[clarity]}
                    min={0}
                    max={100}
                    step={2}
                    onValueChange={(val) => setClarity(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Layers className="h-3 w-3" /> HDR Dynamic Range
                    </Label>
                    <span className="text-xs text-muted-foreground">{hdrTone}%</span>
                  </div>
                  <Slider
                    value={[hdrTone]}
                    min={0}
                    max={100}
                    step={2}
                    onValueChange={(val) => setHdrTone(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Sun className="h-3 w-3" /> Temperature & Warmth
                    </Label>
                    <span className="text-xs text-muted-foreground">{warmth > 0 ? `+${warmth}` : warmth}°</span>
                  </div>
                  <Slider
                    value={[warmth]}
                    min={-40}
                    max={40}
                    step={2}
                    onValueChange={(val) => setWarmth(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium">Lens Vignette</Label>
                    <span className="text-xs text-muted-foreground">{vignette}%</span>
                  </div>
                  <Slider
                    value={[vignette]}
                    min={0}
                    max={80}
                    step={2}
                    onValueChange={(val) => setVignette(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>
              </div>

              {/* Actions & Format */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Export Format</Label>
                  <div className="flex gap-1">
                    {(["png", "jpeg", "webp"] as const).map((fmt) => (
                      <Button
                        key={fmt}
                        size="sm"
                        variant={exportFormat === fmt ? "default" : "outline"}
                        className="h-7 text-xs px-2.5 rounded-lg uppercase"
                        onClick={() => setExportFormat(fmt)}
                      >
                        {fmt}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleDownload} className="w-full gap-2 rounded-xl">
                  <Download className="h-4 w-4" /> Download Enhanced Photo
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Live Preview */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Live Studio Preview
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
                  {showOriginal ? "Original Photo" : "Hold to Compare"}
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