"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Wand, ImageIcon, Trash2, Sun, Contrast, Droplets, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useProcessing } from "@/hooks/use-processing";
import type { ProcessingResult } from "@/lib/processing/types";

// Auto-enhancement algorithm
async function autoEnhance(imageDataUrl: string): Promise<ProcessingResult> {
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

      // Analyze histogram
      const histogram = new Array(256).fill(0);
      let totalLuminance = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        histogram[Math.round(luminance)]++;
        totalLuminance += luminance;
      }

      const pixelCount = data.length / 4;
      const avgLuminance = totalLuminance / pixelCount;

      // Find shadows and highlights clipping points
      let shadowClip = 0;
      let highlightClip = 255;
      const clipPercent = 0.005;
      let cumulative = 0;

      for (let i = 0; i < 256; i++) {
        cumulative += histogram[i] / pixelCount;
        if (cumulative <= clipPercent) shadowClip = i;
      }

      cumulative = 0;
      for (let i = 255; i >= 0; i--) {
        cumulative += histogram[i] / pixelCount;
        if (cumulative <= clipPercent) highlightClip = i;
      }

      // Auto levels adjustment
      const scale = highlightClip > shadowClip ? 255 / (highlightClip - shadowClip) : 1;

      // Auto white balance (gray world assumption)
      let totalR = 0, totalG = 0, totalB = 0;
      for (let i = 0; i < data.length; i += 4) {
        totalR += data[i];
        totalG += data[i + 1];
        totalB += data[i + 2];
      }
      const avgR = totalR / pixelCount;
      const avgG = totalG / pixelCount;
      const avgB = totalB / pixelCount;
      const grayValue = (avgR + avgG + avgB) / 3;
      const wbR = grayValue / (avgR || 1);
      const wbG = grayValue / (avgG || 1);
      const wbB = grayValue / (avgB || 1);

      // Apply corrections
      for (let i = 0; i < data.length; i += 4) {
        // Auto levels
        data[i] = Math.min(255, Math.max(0, (data[i] - shadowClip) * scale));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - shadowClip) * scale));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - shadowClip) * scale));

        // White balance
        data[i] = Math.min(255, data[i] * wbR);
        data[i + 1] = Math.min(255, data[i + 1] * wbG);
        data[i + 2] = Math.min(255, data[i + 2] * wbB);

        // Saturation boost (gentle)
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const satBoost = 1.15;
        data[i] = Math.min(255, gray + (r - gray) * satBoost);
        data[i + 1] = Math.min(255, gray + (g - gray) * satBoost);
        data[i + 2] = Math.min(255, gray + (b - gray) * satBoost);
      }

      ctx.putImageData(imageData, 0, 0);
      resolve({
        status: "success",
        message: "Auto enhancement complete",
        outputUrl: canvas.toDataURL("image/jpeg", 0.92),
      });
    };
    img.src = imageDataUrl;
  });
}

export function SoftColorAutoEnhanceEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
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

  const loadMultipleFiles = useCallback((fileList: FileList) => {
    const imageFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...imageFiles]);
    if (imageFiles.length > 0 && !file) {
      loadFile(imageFiles[0]);
    }
  }, [file, loadFile]);

  const handleEnhance = async () => {
    if (!preview) return;
    await process(() => autoEnhance(preview));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const link = document.createElement("a");
      link.download = `enhanced-${file?.name || "image"}.jpg`;
      link.href = result.outputUrl;
      link.click();
    }
  };

  const handleReset = () => {
    resetProcessing();
    setFile(null);
    setPreview(null);
    setFiles([]);
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
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files && loadMultipleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Wand className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop photos to auto-enhance</p>
          <p className="text-sm text-muted-foreground">Intelligent color correction, exposure, and detail enhancement</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/bmp"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && loadMultipleFiles(e.target.files)}
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
              {files.length > 1 && (
                <p className="text-xs text-muted-foreground mt-1">{files.length} files loaded</p>
              )}
              <Button variant="ghost" size="sm" className="mt-2" onClick={handleReset}>
                <Trash2 className="h-3 w-3 mr-1" /> Remove
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="font-medium flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-500" /> Auto Enhancement Will:
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-1"><Sun className="h-3 w-3" /> Fix exposure and brightness</li>
              <li className="flex items-center gap-1"><Contrast className="h-3 w-3" /> Optimize contrast levels</li>
              <li className="flex items-center gap-1"><Droplets className="h-3 w-3" /> Correct white balance & color</li>
              <li className="flex items-center gap-1"><Wand className="h-3 w-3" /> Boost saturation gently</li>
            </ul>
          </div>

          <Button onClick={handleEnhance} className="w-full gap-2">
            <Wand className="h-4 w-4" /> Auto Enhance
          </Button>
        </div>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Analyzing and enhancing your photo...</p>
        </div>
      )}

      {status === "success" && result?.outputUrl && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1 text-center">Before</p>
              <img src={preview!} alt="Before" className="w-full rounded-lg border" />
            </div>
            <div>
              <p className="text-xs text-green-600 font-medium mb-1 text-center">Enhanced</p>
              <img src={result.outputUrl} alt="After" className="w-full rounded-lg border border-green-500" />
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