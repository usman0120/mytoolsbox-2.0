"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Sparkles,
  Trash2,
  Sun,
  Cloud,
  Leaf,
  User,
  Eye,
  Sliders,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SceneStats {
  skyPercent: number;
  foliagePercent: number;
  skinPercent: number;
  exposureState: "Underexposed" | "Balanced" | "Overexposed";
}

export function PhotolemurEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [sceneStats, setSceneStats] = useState<SceneStats | null>(null);

  // Enhancement controls
  const [intensity, setIntensity] = useState(85); // 0-100%
  const [enableSky, setEnableSky] = useState(true);
  const [enableFoliage, setEnableFoliage] = useState(true);
  const [enablePortrait, setEnablePortrait] = useState(true);
  const [enableDehaze, setEnableDehaze] = useState(true);
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
    const pixelCount = data.length / 4;

    let skyPixels = 0;
    let greenPixels = 0;
    let skinPixels = 0;
    let totalLum = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLum += lum;

      if (b > r + 20 && b > g + 10 && lum > 100) skyPixels++;
      if (g > r + 15 && g > b + 10) greenPixels++;
      if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) skinPixels++;
    }

    const avgLum = totalLum / pixelCount;
    const skyRatio = skyPixels / pixelCount;
    const greenRatio = greenPixels / pixelCount;
    const skinRatio = skinPixels / pixelCount;

    if (!sceneStats) {
      setSceneStats({
        skyPercent: Math.round(skyRatio * 100),
        foliagePercent: Math.round(greenRatio * 100),
        skinPercent: Math.round(skinRatio * 100),
        exposureState: avgLum < 85 ? "Underexposed" : avgLum > 175 ? "Overexposed" : "Balanced",
      });
    }

    const blend = intensity / 100;
    const isUnderexposed = avgLum < 85;
    const isOverexposed = avgLum > 175;

    for (let i = 0; i < data.length; i += 4) {
      const origR = data[i];
      const origG = data[i + 1];
      const origB = data[i + 2];

      let r = origR;
      let g = origG;
      let b = origB;

      // Exposure correction
      if (enableDehaze) {
        if (isUnderexposed) {
          r = Math.min(255, r * 1.25);
          g = Math.min(255, g * 1.25);
          b = Math.min(255, b * 1.25);
        } else if (isOverexposed) {
          r *= 0.88;
          g *= 0.88;
          b *= 0.88;
        }
      }

      // Sky enhancement
      if (enableSky && b > r + 15 && b > g + 8) {
        b = Math.min(255, b * 1.15);
        r = Math.max(0, r * 0.92);
      }

      // Foliage enhancement
      if (enableFoliage && g > r + 12 && g > b + 8) {
        g = Math.min(255, g * 1.14);
        r = Math.min(255, r * 1.03);
      }

      // Portrait skin smoothing & softening
      if (enablePortrait && r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
        r = Math.min(255, r * 0.98);
        g = Math.min(255, g * 1.02);
      }

      // Global Vibrancy & S-Curve Micro-Contrast
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = Math.min(255, Math.max(0, ((r / 255 - 0.5) * 1.1 + 0.5) * 255));
      g = Math.min(255, Math.max(0, ((g / 255 - 0.5) * 1.1 + 0.5) * 255));
      b = Math.min(255, Math.max(0, ((b / 255 - 0.5) * 1.1 + 0.5) * 255));

      const newLum = 0.299 * r + 0.587 * g + 0.114 * b;
      const sat = 1.12;
      r = Math.min(255, newLum + (r - newLum) * sat);
      g = Math.min(255, newLum + (g - newLum) * sat);
      b = Math.min(255, newLum + (b - newLum) * sat);

      data[i] = Math.round(origR * (1 - blend) + r * blend);
      data[i + 1] = Math.round(origG * (1 - blend) + g * blend);
      data[i + 2] = Math.round(origB * (1 - blend) + b * blend);
    }

    ctx.putImageData(imageData, 0, 0);
  }, [
    baseImage,
    intensity,
    enableSky,
    enableFoliage,
    enablePortrait,
    enableDehaze,
    showOriginal,
    sceneStats,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/jpeg", 0.95);
    const base = file?.name.replace(/\.[^.]+$/, "") || "photolemur";
    a.download = `${base}_enhanced.jpg`;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setBaseImage(null);
    setSceneStats(null);
    setIntensity(85);
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
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Photolemur AI Scene Enhancer</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Automated scene detection for skies, foliage, portraits, and exposure dehazing.
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
                  <h4 className="font-semibold text-sm">AI Polish Strength</h4>
                  <p className="text-xs text-muted-foreground">Intensity of neural scene adjustments</p>
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

              {/* Detected Scene Stats */}
              {sceneStats && (
                <div className="p-3 bg-muted/50 rounded-xl space-y-1.5 border">
                  <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Detected Scene Profile
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                    <div>Sky Coverage: <span className="font-medium text-foreground">{sceneStats.skyPercent}%</span></div>
                    <div>Foliage Presence: <span className="font-medium text-foreground">{sceneStats.foliagePercent}%</span></div>
                    <div>Skin / Faces: <span className="font-medium text-foreground">{sceneStats.skinPercent}%</span></div>
                    <div>Lighting: <span className="font-medium text-foreground">{sceneStats.exposureState}</span></div>
                  </div>
                </div>
              )}

              {/* Feature toggles */}
              <div className="space-y-3 pt-3 border-t">
                <h5 className="font-semibold text-xs flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5" /> Scene AI Modules
                </h5>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sky-toggle" className="text-xs font-medium flex items-center gap-2 cursor-pointer">
                    <Cloud className="h-3.5 w-3.5 text-sky-500" /> Sky & Atmosphere Enhancer
                  </Label>
                  <Switch id="sky-toggle" checked={enableSky} onCheckedChange={setEnableSky} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="foliage-toggle" className="text-xs font-medium flex items-center gap-2 cursor-pointer">
                    <Leaf className="h-3.5 w-3.5 text-emerald-500" /> Natural Foliage & Grass Booster
                  </Label>
                  <Switch id="foliage-toggle" checked={enableFoliage} onCheckedChange={setEnableFoliage} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="portrait-toggle" className="text-xs font-medium flex items-center gap-2 cursor-pointer">
                    <User className="h-3.5 w-3.5 text-pink-500" /> Portrait Skin Softening
                  </Label>
                  <Switch id="portrait-toggle" checked={enablePortrait} onCheckedChange={setEnablePortrait} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="dehaze-toggle" className="text-xs font-medium flex items-center gap-2 cursor-pointer">
                    <Sun className="h-3.5 w-3.5 text-amber-500" /> Exposure Recovery & Dehaze
                  </Label>
                  <Switch id="dehaze-toggle" checked={enableDehaze} onCheckedChange={setEnableDehaze} />
                </div>
              </div>

              <div className="pt-2 border-t">
                <Button onClick={handleDownload} className="w-full gap-2 rounded-xl">
                  <Download className="h-4 w-4" /> Download AI Enhanced Photo
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