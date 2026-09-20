"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Sparkles, ImageIcon, Video, Trash2, Wand, Scissors, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useProcessing } from "@/hooks/use-processing";
import type { ProcessingResult } from "@/lib/processing/types";

// Client-side AI image enhancement using canvas filters
async function enhanceImage(
  imageDataUrl: string,
  options: { upscale: number; denoise: number; sharpen: number; colorGrade: number }
): Promise<ProcessingResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = options.upscale;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve({ status: "error", error: "Unable to process image" }); return; }

      // Apply enhancements
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw scaled
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Apply sharpen using convolution
      if (options.sharpen > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imageData;
        const output = new Uint8ClampedArray(data.length);
        const strength = options.sharpen / 100;

        const kernel = [
          0, -1 * strength, 0,
          -1 * strength, 1 + 4 * strength, -1 * strength,
          0, -1 * strength, 0,
        ];

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            let r = 0, g = 0, b = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const idx = ((y + ky) * width + (x + kx)) * 4;
                const kVal = kernel[(ky + 1) * 3 + (kx + 1)];
                r += data[idx] * kVal;
                g += data[idx + 1] * kVal;
                b += data[idx + 2] * kVal;
              }
            }
            const idx = (y * width + x) * 4;
            output[idx] = Math.min(255, Math.max(0, r));
            output[idx + 1] = Math.min(255, Math.max(0, g));
            output[idx + 2] = Math.min(255, Math.max(0, b));
            output[idx + 3] = data[idx + 3];
          }
        }
        ctx.putImageData(new ImageData(output, width, height), 0, 0);
      }

      // Apply color grading (warmth/cool)
      if (options.colorGrade !== 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;
        const warmth = options.colorGrade / 100;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, data[i] + warmth * 30));     // R
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] - warmth * 30)); // B
        }
        ctx.putImageData(imageData, 0, 0);
      }

      resolve({
        status: "success",
        message: "Image enhanced successfully",
        outputUrl: canvas.toDataURL("image/png"),
      });
    };
    img.src = imageDataUrl;
  });
}

// Background removal using color thresholding
async function removeBackground(imageDataUrl: string): Promise<ProcessingResult> {
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

      // Sample corners to detect background color
      const corners = [
        [0, 0], [canvas.width - 1, 0],
        [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1],
      ];
      let avgR = 0, avgG = 0, avgB = 0;
      for (const [cx, cy] of corners) {
        const idx = (cy * canvas.width + cx) * 4;
        avgR += data[idx];
        avgG += data[idx + 1];
        avgB += data[idx + 2];
      }
      avgR /= 4; avgG /= 4; avgB /= 4;

      const threshold = 60;
      for (let i = 0; i < data.length; i += 4) {
        const dr = Math.abs(data[i] - avgR);
        const dg = Math.abs(data[i + 1] - avgG);
        const db = Math.abs(data[i + 2] - avgB);
        if (dr < threshold && dg < threshold && db < threshold) {
          data[i + 3] = 0; // Make transparent
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve({
        status: "success",
        message: "Background removed",
        outputUrl: canvas.toDataURL("image/png"),
      });
    };
    img.src = imageDataUrl;
  });
}

export function RunwayEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("enhance");
  const [upscale, setUpscale] = useState(2);
  const [denoise, setDenoise] = useState(30);
  const [sharpen, setSharpen] = useState(50);
  const [colorGrade, setColorGrade] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, process, reset: resetProcessing } = useProcessing();

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) return;
    setFile(f);
    resetProcessing();
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, [resetProcessing]);

  const handleEnhance = async () => {
    if (!preview) return;
    await process(() => enhanceImage(preview, { upscale, denoise, sharpen, colorGrade }));
  };

  const handleRemoveBackground = async () => {
    if (!preview) return;
    await process(() => removeBackground(preview));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const link = document.createElement("a");
      link.download = `runway-enhanced-${Date.now()}.png`;
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
          <p className="font-medium mb-1">Drop an image or video</p>
          <p className="text-sm text-muted-foreground">AI-powered enhancement, background removal, and effects</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </div>
      )}

      {status === "idle" && file && preview && (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {file.type.startsWith("video/") ? (
              <video src={preview} className="w-32 h-32 object-cover rounded-lg border" />
            ) : (
              <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={handleReset}>
                <Trash2 className="h-3 w-3 mr-1" /> Remove
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="enhance" className="gap-1"><Wand className="h-3.5 w-3.5" /> Enhance</TabsTrigger>
              <TabsTrigger value="background" className="gap-1"><Scissors className="h-3.5 w-3.5" /> Remove BG</TabsTrigger>
            </TabsList>

            <TabsContent value="enhance" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label className="text-xs">Upscale Factor</Label>
                    <span className="text-xs text-muted-foreground">{upscale}x</span>
                  </div>
                  <Slider value={[upscale]} onValueChange={(v) => setUpscale(Array.isArray(v) ? v[0] : v)} min={1} max={4} step={1} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label className="text-xs">Sharpen</Label>
                    <span className="text-xs text-muted-foreground">{sharpen}%</span>
                  </div>
                  <Slider value={[sharpen]} onValueChange={(v) => setSharpen(Array.isArray(v) ? v[0] : v)} min={0} max={100} step={5} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label className="text-xs flex items-center gap-1"><Sun className="h-3 w-3" /> Color Warmth</Label>
                    <span className="text-xs text-muted-foreground">{colorGrade > 0 ? "+" : ""}{colorGrade}%</span>
                  </div>
                  <Slider value={[colorGrade]} onValueChange={(v) => setColorGrade(Array.isArray(v) ? v[0] : v)} min={-100} max={100} step={5} />
                </div>
              </div>
              <Button onClick={handleEnhance} className="w-full gap-2">
                <Sparkles className="h-4 w-4" /> Enhance Image
              </Button>
            </TabsContent>

            <TabsContent value="background" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Automatically detect and remove the background from your image. Works best with clear subjects on contrasting backgrounds.
              </p>
              <Button onClick={handleRemoveBackground} className="w-full gap-2">
                <Scissors className="h-4 w-4" /> Remove Background
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">AI processing your image...</p>
        </div>
      )}

      {status === "success" && result?.outputUrl && (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden bg-muted/30 p-2">
            <img src={result.outputUrl} alt="Enhanced" className="w-full h-auto max-h-100 object-contain rounded" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" /> Download Result
            </Button>
            <Button variant="outline" onClick={handleReset}>Process Another</Button>
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