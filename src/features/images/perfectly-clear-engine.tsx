"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, SlidersHorizontal, ImageIcon, Trash2, Sun, Contrast, Droplets, Eye, Zap, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProcessing } from "@/hooks/use-processing";
import type { ProcessingResult } from "@/lib/processing/types";

// Preset-based auto-correction
type Preset = "auto" | "vivid" | "natural" | "bw" | "warm" | "cool";

interface PresetConfig {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  sharpen: number;
}

const presets: Record<Preset, PresetConfig> = {
  auto: { brightness: 0, contrast: 1.05, saturation: 1.1, warmth: 0, sharpen: 1.2 },
  vivid: { brightness: 5, contrast: 1.15, saturation: 1.4, warmth: 5, sharpen: 1.3 },
  natural: { brightness: 0, contrast: 1.02, saturation: 1.05, warmth: 0, sharpen: 1.1 },
  bw: { brightness: 0, contrast: 1.2, saturation: 0, warmth: 0, sharpen: 1.25 },
  warm: { brightness: 3, contrast: 1.05, saturation: 1.15, warmth: 15, sharpen: 1.15 },
  cool: { brightness: -2, contrast: 1.05, saturation: 1.1, warmth: -10, sharpen: 1.15 },
};

async function applyPreset(imageDataUrl: string, preset: PresetConfig): Promise<ProcessingResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve({ status: "error", error: "Unable to process image" }); return; }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness
        const bAdj = preset.brightness * 2.55;
        r = Math.min(255, Math.max(0, r + bAdj));
        g = Math.min(255, Math.max(0, g + bAdj));
        b = Math.min(255, Math.max(0, b + bAdj));

        // Contrast
        const cf = preset.contrast;
        r = Math.min(255, Math.max(0, ((r / 255 - 0.5) * cf + 0.5) * 255));
        g = Math.min(255, Math.max(0, ((g / 255 - 0.5) * cf + 0.5) * 255));
        b = Math.min(255, Math.max(0, ((b / 255 - 0.5) * cf + 0.5) * 255));

        // Warmth
        if (preset.warmth !== 0) {
          r = Math.min(255, r + preset.warmth);
          b = Math.max(0, b - preset.warmth);
        }

        // Saturation
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const sf = preset.saturation;
        r = Math.min(255, gray + (r - gray) * sf);
        g = Math.min(255, gray + (g - gray) * sf);
        b = Math.min(255, gray + (b - gray) * sf);

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }

      // Sharpen (simple unsharp mask via second pass)
      if (preset.sharpen > 1) {
        const sharpened = new Uint8ClampedArray(data);
        const kernel = preset.sharpen - 1; // sharpen amount
        const w = canvas.width;

        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
              const center = data[idx + c];
              const neighbors =
                data[((y - 1) * w + x) * 4 + c] +
                data[((y + 1) * w + x) * 4 + c] +
                data[(y * w + (x - 1)) * 4 + c] +
                data[(y * w + (x + 1)) * 4 + c];
              const blurred = neighbors / 4;
              sharpened[idx + c] = Math.min(255, Math.max(0, center + (center - blurred) * kernel));
            }
          }
        }
        for (let i = 0; i < data.length; i++) {
          data[i] = sharpened[i];
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve({
        status: "success",
        message: `${preset} preset applied`,
        outputUrl: canvas.toDataURL("image/jpeg", 0.92),
      });
    };
    img.src = imageDataUrl;
  });
}

export function PerfectlyClearEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activePreset, setActivePreset] = useState<Preset>("auto");
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, process, reset: resetProcessing } = useProcessing();

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    resetProcessing();
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, [resetProcessing]);

  const handleApply = async () => {
    if (!preview) return;
    await process(() => applyPreset(preview, presets[activePreset]));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const link = document.createElement("a");
      link.download = `perfectly-clear-${file?.name || "image"}.jpg`;
      link.href = result.outputUrl;
      link.click();
    }
  };

  const handleReset = () => {
    resetProcessing();
    setFile(null);
    setPreview(null);
    setShowBeforeAfter(false);
  };

  const presetIcons: Record<Preset, React.ReactNode> = {
    auto: <Zap className="h-4 w-4" />,
    vivid: <Palette className="h-4 w-4" />,
    natural: <Eye className="h-4 w-4" />,
    bw: <Contrast className="h-4 w-4" />,
    warm: <Sun className="h-4 w-4" />,
    cool: <Droplets className="h-4 w-4" />,
  };

  return (
    <div className="space-y-4">
      {status === "idle" && !file && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <SlidersHorizontal className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop a photo to auto-correct</p>
          <p className="text-sm text-muted-foreground">Choose a preset and instantly perfect your photo</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/bmp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </div>
      )}

      {status === "idle" && file && preview && (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={handleReset}>
                <Trash2 className="h-3 w-3 mr-1" /> Remove
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs mb-2 block">Choose Preset</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(presets) as Preset[]).map((preset) => (
                <Button
                  key={preset}
                  variant={activePreset === preset ? "default" : "outline"}
                  size="sm"
                  className="gap-1 capitalize"
                  onClick={() => setActivePreset(preset)}
                >
                  {presetIcons[preset]}
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleApply} className="w-full gap-2" size="lg">
            <SlidersHorizontal className="h-5 w-5" /> Apply {activePreset.charAt(0).toUpperCase() + activePreset.slice(1)} Preset
          </Button>
        </div>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Applying {activePreset} preset...</p>
        </div>
      )}

      {status === "success" && result?.outputUrl && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1 text-center">Original</p>
              <img src={preview!} alt="Before" className="w-full rounded-lg border" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1 text-center capitalize">{activePreset} Preset</p>
              <img src={result.outputUrl} alt="After" className="w-full rounded-lg border border-blue-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
            <Button variant="outline" onClick={handleReset}>Try Another</Button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">{error || "Processing failed"}</p>
          <Button variant="outline" size="sm" onClick={handleReset}>Try Again</Button>
        </div>
      )}
    </div>
  );
}