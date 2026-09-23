"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Wand,
  Trash2,
  Sun,
  Contrast,
  Droplets,
  Zap,
  Eye,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export function SoftColorAutoEnhanceEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);

  // Fine-tuning parameters
  const [intensity, setIntensity] = useState(100); // 0-100%
  const [exposure, setExposure] = useState(0); // -40 to 40
  const [contrastBoost, setContrastBoost] = useState(10); // -30 to 50
  const [saturationBoost, setSaturationBoost] = useState(15); // -30 to 50
  const [warmth, setWarmth] = useState(0); // -30 to 30
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

    // Analyze histogram for Auto Levels
    const histogram = new Array(256).fill(0);
    let totalR = 0, totalG = 0, totalB = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      histogram[lum]++;
      totalR += r;
      totalG += g;
      totalB += b;
    }

    // Shadow & highlight clipping points (0.5% threshold)
    let shadowClip = 0;
    let highlightClip = 255;
    const clipLimit = pixelCount * 0.005;
    let cumulative = 0;

    for (let i = 0; i < 256; i++) {
      cumulative += histogram[i];
      if (cumulative <= clipLimit) shadowClip = i;
    }
    cumulative = 0;
    for (let i = 255; i >= 0; i--) {
      cumulative += histogram[i];
      if (cumulative <= clipLimit) highlightClip = i;
    }

    const scale = highlightClip > shadowClip ? 255 / (highlightClip - shadowClip) : 1;

    // Auto White Balance factors (gray-world assumption)
    const avgR = totalR / pixelCount;
    const avgG = totalG / pixelCount;
    const avgB = totalB / pixelCount;
    const gray = (avgR + avgG + avgB) / 3;
    const wbR = gray / (avgR || 1);
    const wbG = gray / (avgG || 1);
    const wbB = gray / (avgB || 1);

    const blend = intensity / 100;
    const satFactor = 1 + (saturationBoost / 100);
    const contrastFactor = (259 * (contrastBoost + 255)) / (255 * (259 - contrastBoost));

    for (let i = 0; i < data.length; i += 4) {
      const origR = data[i];
      const origG = data[i + 1];
      const origB = data[i + 2];

      // Auto levels & White Balance calculation
      let enhancedR = Math.min(255, Math.max(0, (origR - shadowClip) * scale)) * wbR;
      let enhancedG = Math.min(255, Math.max(0, (origG - shadowClip) * scale)) * wbG;
      let enhancedB = Math.min(255, Math.max(0, (origB - shadowClip) * scale)) * wbB;

      // Fine contrast & exposure
      enhancedR = Math.min(255, Math.max(0, contrastFactor * (enhancedR - 128) + 128 + exposure));
      enhancedG = Math.min(255, Math.max(0, contrastFactor * (enhancedG - 128) + 128 + exposure));
      enhancedB = Math.min(255, Math.max(0, contrastFactor * (enhancedB - 128) + 128 + exposure));

      // Saturation
      const lum = 0.299 * enhancedR + 0.587 * enhancedG + 0.114 * enhancedB;
      enhancedR = Math.min(255, Math.max(0, lum + (enhancedR - lum) * satFactor + warmth));
      enhancedG = Math.min(255, Math.max(0, lum + (enhancedG - lum) * satFactor));
      enhancedB = Math.min(255, Math.max(0, lum + (enhancedB - lum) * satFactor - warmth));

      // Blend between original and enhanced according to intensity
      data[i] = Math.round(origR * (1 - blend) + enhancedR * blend);
      data[i + 1] = Math.round(origG * (1 - blend) + enhancedG * blend);
      data[i + 2] = Math.round(origB * (1 - blend) + enhancedB * blend);
    }

    ctx.putImageData(imageData, 0, 0);
  }, [
    baseImage,
    intensity,
    exposure,
    contrastBoost,
    saturationBoost,
    warmth,
    showOriginal,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/jpeg", 0.95);
    const base = file?.name.replace(/\.[^.]+$/, "") || "enhanced";
    a.download = `${base}_softcolor.jpg`;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setBaseImage(null);
    setIntensity(100);
    setExposure(0);
    setContrastBoost(10);
    setSaturationBoost(15);
    setWarmth(0);
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
            <Wand className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-lg mb-1">SoftColor Automatic Photo Enhancer</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Automatic white balance correction, shadow/highlight level stretching, and vibrance balancing.
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Enhancement Strength</h4>
                  <p className="text-xs text-muted-foreground">Blend intensity of automatic corrections</p>
                </div>
                <span className="text-xs font-bold text-primary">{intensity}%</span>
              </div>

              <Slider
                value={[intensity]}
                min={0}
                max={100}
                step={1}
                onValueChange={(val) => setIntensity(Array.isArray(val) ? val[0] : (val as number))}
              />

              <div className="space-y-3 pt-3 border-t">
                <h5 className="font-semibold text-xs flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5" /> Fine-Tune Controls
                </h5>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Sun className="h-3 w-3" /> Exposure Offset
                    </Label>
                    <span className="text-xs text-muted-foreground">{exposure > 0 ? `+${exposure}` : exposure}</span>
                  </div>
                  <Slider
                    value={[exposure]}
                    min={-30}
                    max={30}
                    step={1}
                    onValueChange={(val) => setExposure(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Contrast className="h-3 w-3" /> Contrast Boost
                    </Label>
                    <span className="text-xs text-muted-foreground">{contrastBoost}%</span>
                  </div>
                  <Slider
                    value={[contrastBoost]}
                    min={-20}
                    max={40}
                    step={1}
                    onValueChange={(val) => setContrastBoost(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Droplets className="h-3 w-3" /> Vibrance & Saturation
                    </Label>
                    <span className="text-xs text-muted-foreground">+{saturationBoost}%</span>
                  </div>
                  <Slider
                    value={[saturationBoost]}
                    min={-20}
                    max={50}
                    step={1}
                    onValueChange={(val) => setSaturationBoost(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium">Color Temperature</Label>
                    <span className="text-xs text-muted-foreground">{warmth > 0 ? `+${warmth}` : warmth}°</span>
                  </div>
                  <Slider
                    value={[warmth]}
                    min={-25}
                    max={25}
                    step={1}
                    onValueChange={(val) => setWarmth(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <Button onClick={handleDownload} className="w-full gap-2 rounded-xl">
                  <Download className="h-4 w-4" /> Download Enhanced JPEG
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