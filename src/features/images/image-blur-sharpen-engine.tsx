"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  Sparkles,
  Eye,
  Sliders,
  Focus,
  SunMedium,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  applyFilter,
  FilterType,
  FilterOptions,
} from "@/features/images/image-blur-sharpen";

const FILTERS: { value: FilterType; label: string; desc: string; icon: string }[] = [
  { value: "sharpen", label: "Sharpen", desc: "Enhance clarity & edge crispness", icon: "✨" },
  { value: "blur", label: "Gaussian Blur", desc: "Smooth defocus effect", icon: "🌫️" },
  { value: "vignette", label: "Cinematic Vignette", desc: "Gradual shadow border focus", icon: "🎬" },
  { value: "edgeDetect", label: "Edge Detect", desc: "Technical architectural contours", icon: "📐" },
  { value: "emboss", label: "3D Emboss", desc: "Stone relief stamp texture", icon: "🪨" },
];

export function ImageBlurSharpenEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);

  // Settings
  const [filterType, setFilterType] = useState<FilterType>("sharpen");
  const [intensity, setIntensity] = useState(5);
  const [showOriginal, setShowOriginal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("png");

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setDownloadUrl(null);
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

    if (filterType === "blur") {
      ctx.filter = `blur(${Math.max(1, intensity)}px)`;
      ctx.drawImage(baseImage, 0, 0);
      ctx.filter = "none";
    } else if (filterType === "vignette") {
      ctx.drawImage(baseImage, 0, 0);
      const radius = Math.max(canvas.width, canvas.height) * 0.75;
      const vignette = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        radius * (1 - Math.min(0.9, intensity * 0.05)),
        canvas.width / 2,
        canvas.height / 2,
        radius
      );
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.95, intensity * 0.08)})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(baseImage, 0, 0);
      const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const dstData = ctx.createImageData(canvas.width, canvas.height);

      const s = Math.min(10, Math.max(1, intensity)) * 0.15;
      let kernel: number[];
      let offset = 0;

      if (filterType === "sharpen") {
        kernel = [0, -s, 0, -s, 1 + 4 * s, -s, 0, -s, 0];
      } else if (filterType === "edgeDetect") {
        kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
        offset = 128;
      } else {
        kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
        offset = 128;
      }

      const size = 3;
      const half = 1;
      const src = srcData.data;
      const dst = dstData.data;
      const w = srcData.width;
      const h = srcData.height;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let r = 0, g = 0, b = 0;

          for (let ky = 0; ky < size; ky++) {
            for (let kx = 0; kx < size; kx++) {
              const px = Math.min(Math.max(x + kx - half, 0), w - 1);
              const py = Math.min(Math.max(y + ky - half, 0), h - 1);
              const idx = (py * w + px) * 4;
              const kVal = kernel[ky * size + kx];

              r += src[idx] * kVal;
              g += src[idx + 1] * kVal;
              b += src[idx + 2] * kVal;
            }
          }

          const dstIdx = (y * w + x) * 4;
          dst[dstIdx] = Math.min(255, Math.max(0, r + offset));
          dst[dstIdx + 1] = Math.min(255, Math.max(0, g + offset));
          dst[dstIdx + 2] = Math.min(255, Math.max(0, b + offset));
          dst[dstIdx + 3] = src[(y * w + x) * 4 + 3];
        }
      }

      ctx.putImageData(dstData, 0, 0);
    }
  }, [baseImage, filterType, intensity, showOriginal]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleApplyExport = async () => {
    if (!file) return;
    setIsProcessing(true);

    const opts: FilterOptions = {
      type: filterType,
      intensity,
      format: exportFormat,
    };

    const res = await applyFilter(file, opts);
    setIsProcessing(false);

    if (res.status === "success" && res.outputUrl) {
      setDownloadUrl(res.outputUrl);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      const baseName = file?.name.replace(/\.[^.]+$/, "") || "filtered";
      a.download = `${baseName}_${filterType}.${exportFormat === "jpeg" ? "jpg" : exportFormat}`;
      a.click();
      return;
    }

    if (canvasRef.current) {
      const mime = exportFormat === "png" ? "image/png" : exportFormat === "webp" ? "image/webp" : "image/jpeg";
      const dataUrl = canvasRef.current.toDataURL(mime, 0.95);
      const a = document.createElement("a");
      a.href = dataUrl;
      const baseName = file?.name.replace(/\.[^.]+$/, "") || "filtered";
      a.download = `${baseName}_${filterType}.${exportFormat === "jpeg" ? "jpg" : exportFormat}`;
      a.click();
    }
  };

  const handleReset = () => {
    setFile(null);
    setBaseImage(null);
    setDownloadUrl(null);
    setIntensity(5);
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
            <Focus className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Blur, Sharpen & Enhance Images</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Crisp up soft photos, apply smooth Gaussian background blur, or create cinematic vignettes.
          </p>
          <Button variant="outline" className="rounded-xl shadow-xs">
            Browse Image
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
                <h4 className="font-semibold text-sm">Select Filter</h4>
                <p className="text-xs text-muted-foreground">Choose convolution or blur effect</p>
              </div>

              <div className="space-y-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilterType(f.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      filterType === f.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
                        : "border-border/50 hover:border-primary/30 bg-background"
                    }`}
                  >
                    <span className="text-xl shrink-0">{f.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-foreground">{f.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{f.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Intensity Slider */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium">Filter Intensity</Label>
                  <span className="text-xs text-muted-foreground">Level {intensity}</span>
                </div>
                <Slider
                  value={[intensity]}
                  min={1}
                  max={15}
                  step={1}
                  onValueChange={(val) => setIntensity(Array.isArray(val) ? val[0] : (val as number))}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
                  <span>Subtle</span>
                  <span>Moderate</span>
                  <span>Intense</span>
                </div>
              </div>

              {/* Actions & Export */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Format</Label>
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

                <div className="flex gap-2">
                  <Button
                    onClick={handleApplyExport}
                    disabled={isProcessing}
                    className="flex-1 rounded-xl gap-2 font-medium"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isProcessing ? "Processing..." : "Generate High-Res"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="rounded-xl gap-1.5"
                  >
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Live Preview */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Live Canvas Preview
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
                  {showOriginal ? "Original Image" : "Hold to Compare"}
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