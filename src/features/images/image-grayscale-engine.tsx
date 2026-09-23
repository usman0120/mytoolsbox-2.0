"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  Palette,
  Eye,
  Sliders,
  Sparkles,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  convertToGrayscale,
  GrayscaleMethod,
  GrayscaleOptions,
} from "@/features/images/image-grayscale";

const METHODS: { value: GrayscaleMethod; label: string; desc: string; tone: string }[] = [
  {
    value: "luminosity",
    label: "Natural Luminance",
    desc: "Perceptually balanced (ITU-R BT.709)",
    tone: "bg-neutral-500",
  },
  {
    value: "noir",
    label: "Film Noir Contrast",
    desc: "Dramatic deep shadows and punchy highlights",
    tone: "bg-neutral-900",
  },
  {
    value: "sepia",
    label: "Vintage Warm Sepia",
    desc: "19th century archival gold-tinted toning",
    tone: "bg-amber-800",
  },
  {
    value: "cyanotype",
    label: "Cyanotype Blue",
    desc: "Classic Prussian blueprint monochrome",
    tone: "bg-sky-800",
  },
  {
    value: "silver",
    label: "Silver Gelatin",
    desc: "Velvety darkroom black & white paper aesthetic",
    tone: "bg-zinc-600",
  },
  {
    value: "desaturate",
    label: "Flat Desaturate",
    desc: "Simple midpoint channel desaturation",
    tone: "bg-stone-500",
  },
];

export function ImageGrayscaleEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);

  // Filter settings
  const [method, setMethod] = useState<GrayscaleMethod>("luminosity");
  const [contrast, setContrast] = useState(0); // -50 to 50
  const [brightness, setBrightness] = useState(0); // -50 to 50
  const [grain, setGrain] = useState(0); // 0 to 100
  const [showOriginal, setShowOriginal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("png");

  // Status
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

    // Draw base
    ctx.drawImage(baseImage, 0, 0);

    if (showOriginal) {
      return; // show untouched base image
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      let gray = 0;

      switch (method) {
        case "average":
          gray = Math.round((r + g + b) / 3);
          break;
        case "desaturate":
          gray = Math.round((Math.max(r, g, b) + Math.min(r, g, b)) / 2);
          break;
        case "noir": {
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          gray = Math.min(255, Math.max(0, Math.pow(lum / 255, 1.35) * 270));
          break;
        }
        case "silver": {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          gray = Math.min(255, Math.max(0, 128 + 1.25 * (lum - 128)));
          break;
        }
        case "sepia":
        case "cyanotype":
        case "luminosity":
        default:
          gray = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
          break;
      }

      if (brightness !== 0) {
        gray = Math.min(255, Math.max(0, gray + brightness));
      }

      if (contrast !== 0) {
        gray = Math.min(255, Math.max(0, contrastFactor * (gray - 128) + 128));
      }

      if (grain > 0) {
        const noise = (Math.random() - 0.5) * (grain * 0.8);
        gray = Math.min(255, Math.max(0, gray + noise));
      }

      if (method === "sepia") {
        data[i] = Math.min(255, Math.round(gray * 1.15));
        data[i + 1] = Math.min(255, Math.round(gray * 0.95));
        data[i + 2] = Math.min(255, Math.round(gray * 0.75));
      } else if (method === "cyanotype") {
        data[i] = Math.min(255, Math.round(gray * 0.65));
        data[i + 1] = Math.min(255, Math.round(gray * 0.9));
        data[i + 2] = Math.min(255, Math.round(gray * 1.2));
      } else {
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [baseImage, method, contrast, brightness, grain, showOriginal]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleApplyExport = async () => {
    if (!file) return;
    setIsProcessing(true);

    const opts: GrayscaleOptions = {
      method,
      contrast,
      brightness,
      grain,
      format: exportFormat,
    };

    const res = await convertToGrayscale(file, opts);
    setIsProcessing(false);

    if (res.status === "success" && res.outputUrl) {
      setDownloadUrl(res.outputUrl);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      const baseName = file?.name.replace(/\.[^.]+$/, "") || "grayscale";
      a.download = `${baseName}_${method}.${exportFormat === "jpeg" ? "jpg" : exportFormat}`;
      a.click();
      return;
    }

    if (canvasRef.current) {
      const mime = exportFormat === "png" ? "image/png" : exportFormat === "webp" ? "image/webp" : "image/jpeg";
      const dataUrl = canvasRef.current.toDataURL(mime, 0.95);
      const a = document.createElement("a");
      a.href = dataUrl;
      const baseName = file?.name.replace(/\.[^.]+$/, "") || "grayscale";
      a.download = `${baseName}_${method}.${exportFormat === "jpeg" ? "jpg" : exportFormat}`;
      a.click();
    }
  };

  const handleReset = () => {
    setFile(null);
    setBaseImage(null);
    setDownloadUrl(null);
    setContrast(0);
    setBrightness(0);
    setGrain(0);
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
            <Palette className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Convert Image to Grayscale & B&W</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Professional monochrome, vintage sepia, film noir, and architectural cyanotype styles.
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
                <h4 className="font-semibold text-sm">Monochrome Presets</h4>
                <p className="text-xs text-muted-foreground">Select historical or artistic toning</p>
              </div>

              <div className="space-y-2">
                {METHODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMethod(m.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      method === m.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
                        : "border-border/50 hover:border-primary/30 bg-background"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg shrink-0 ${m.tone} border border-white/20 shadow-xs`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-foreground">{m.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Tonal Fine-tuning sliders */}
              <div className="space-y-3 pt-3 border-t">
                <h5 className="font-semibold text-xs flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5" /> Darkroom Tone Adjustments
                </h5>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium">Contrast</Label>
                    <span className="text-xs text-muted-foreground">{contrast > 0 ? `+${contrast}` : contrast}</span>
                  </div>
                  <Slider
                    value={[contrast]}
                    min={-50}
                    max={50}
                    step={1}
                    onValueChange={(val) => setContrast(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium">Exposure / Brightness</Label>
                    <span className="text-xs text-muted-foreground">{brightness > 0 ? `+${brightness}` : brightness}</span>
                  </div>
                  <Slider
                    value={[brightness]}
                    min={-50}
                    max={50}
                    step={1}
                    onValueChange={(val) => setBrightness(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Camera className="h-3 w-3" /> Film Grain Noise
                    </Label>
                    <span className="text-xs text-muted-foreground">{grain}%</span>
                  </div>
                  <Slider
                    value={[grain]}
                    min={0}
                    max={80}
                    step={1}
                    onValueChange={(val) => setGrain(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>
              </div>

              {/* Export format & actions */}
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
                  {showOriginal ? "Showing Original" : "Hold to Compare"}
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