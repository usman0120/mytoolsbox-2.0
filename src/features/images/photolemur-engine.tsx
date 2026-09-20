"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Sparkles, ImageIcon, Trash2, Sun, Cloud, Leaf, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProcessing } from "@/hooks/use-processing";
import type { ProcessingResult } from "@/lib/processing/types";

// AI-powered photo enhancement with scene detection
async function aiEnhance(imageDataUrl: string): Promise<ProcessingResult> {
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

      const pixelCount = data.length / 4;

      // Scene analysis
      let skyPixels = 0;
      let greenPixels = 0;
      let skinPixels = 0;
      let totalLuminance = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;

        // Sky detection (blue dominant, bright)
        if (b > r + 20 && b > g + 10 && (r + g + b) / 3 > 100) skyPixels++;

        // Foliage detection (green dominant)
        if (g > r + 15 && g > b + 10) greenPixels++;

        // Skin tone detection (warm tones)
        if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) skinPixels++;
      }

      const avgLuminance = totalLuminance / pixelCount;
      const skyRatio = skyPixels / pixelCount;
      const greenRatio = greenPixels / pixelCount;
      const skinRatio = skinPixels / pixelCount;

      // Determine scene type
      const isLandscape = skyRatio > 0.15 || greenRatio > 0.2;
      const hasFaces = skinRatio > 0.05;
      const isUnderexposed = avgLuminance < 80;
      const isOverexposed = avgLuminance > 180;

      // Apply scene-specific enhancements
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Exposure correction
        if (isUnderexposed) {
          const boost = 1.3;
          r = Math.min(255, r * boost);
          g = Math.min(255, g * boost);
          b = Math.min(255, b * boost);
        } else if (isOverexposed) {
          const dampen = 0.85;
          r = r * dampen;
          g = g * dampen;
          b = b * dampen;
        }

        // Sky enhancement
        if (isLandscape && b > r + 20 && b > g + 10) {
          b = Math.min(255, b * 1.1);
          r = Math.max(0, r * 0.95);
        }

        // Foliage enhancement
        if (isLandscape && g > r + 15 && g > b + 10) {
          g = Math.min(255, g * 1.08);
        }

        // Skin tone smoothing
        if (hasFaces && r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
          // Gentle skin smoothing - reduce red dominance slightly
          r = Math.min(255, r * 0.97);
          g = Math.min(255, g * 1.02);
        }

        // Global contrast enhancement
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        const contrastFactor = 1.08;
        r = Math.min(255, Math.max(0, ((r / 255 - 0.5) * contrastFactor + 0.5) * 255));
        g = Math.min(255, Math.max(0, ((g / 255 - 0.5) * contrastFactor + 0.5) * 255));
        b = Math.min(255, Math.max(0, ((b / 255 - 0.5) * contrastFactor + 0.5) * 255));

        // Saturation boost
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const satBoost = 1.1;
        r = Math.min(255, gray + (r - gray) * satBoost);
        g = Math.min(255, gray + (g - gray) * satBoost);
        b = Math.min(255, gray + (b - gray) * satBoost);

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve({
        status: "success",
        message: "AI enhancement complete",
        outputUrl: canvas.toDataURL("image/jpeg", 0.92),
      });
    };
    img.src = imageDataUrl;
  });
}

export function PhotolemurEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
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

  const handleEnhance = async () => {
    if (!preview) return;
    await process(() => aiEnhance(preview));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const link = document.createElement("a");
      link.download = `photolemur-${file?.name || "image"}.jpg`;
      link.href = result.outputUrl;
      link.click();
    }
  };

  const handleReset = () => {
    resetProcessing();
    setFile(null);
    setPreview(null);
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
          <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop a photo to auto-fix</p>
          <p className="text-sm text-muted-foreground">AI analyzes and enhances your photo in one click</p>
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

          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="font-medium flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-500" /> AI Will Enhance:
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-1"><Sun className="h-3 w-3" /> Auto exposure correction</li>
              <li className="flex items-center gap-1"><Cloud className="h-3 w-3" /> Sky enhancement (landscapes)</li>
              <li className="flex items-center gap-1"><Leaf className="h-3 w-3" /> Foliage enhancement (nature)</li>
              <li className="flex items-center gap-1"><User className="h-3 w-3" /> Face & skin tone optimization</li>
            </ul>
          </div>

          <Button onClick={handleEnhance} className="w-full gap-2" size="lg">
            <Sparkles className="h-5 w-5" /> One-Click AI Enhance
          </Button>
        </div>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">AI analyzing scene and enhancing...</p>
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
              <p className="text-xs text-purple-600 font-medium mb-1 text-center">AI Enhanced</p>
              <img src={result.outputUrl} alt="After" className="w-full rounded-lg border border-purple-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" /> Download Enhanced
            </Button>
            <Button variant="outline" onClick={handleReset}>Enhance Another</Button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">{error || "Enhancement failed"}</p>
          <Button variant="outline" size="sm" onClick={handleReset}>Try Again</Button>
        </div>
      )}
    </div>
  );
}