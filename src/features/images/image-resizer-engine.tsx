"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  ImageIcon,
  Download,
  Trash2,
  Maximize2,
  Lock,
  Unlock,
  Sparkles,
  Share2,
  AlertCircle,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resizeImage } from "@/features/images/image-resizer";

const SOCIAL_PRESETS = [
  { name: "Instagram Square", w: 1080, h: 1080, cat: "Social" },
  { name: "Instagram Story", w: 1080, h: 1920, cat: "Social" },
  { name: "YouTube Thumb", w: 1280, h: 720, cat: "Video" },
  { name: "X / Twitter Header", w: 1500, h: 500, cat: "Social" },
  { name: "LinkedIn Banner", w: 1584, h: 396, cat: "Business" },
  { name: "Website Favicon", w: 32, h: 32, cat: "Web" },
];

export function ImageResizerEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null);

  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [percentage, setPercentage] = useState<number>(100);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [mode, setMode] = useState<"dimensions" | "percentage" | "presets">("dimensions");
  const [fitMode, setFitMode] = useState<"stretch" | "contain" | "cover">("stretch");

  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState<string>("resized.png");
  const [outputDims, setOutputDims] = useState<{ w: number; h: number; size: number } | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please drop a valid image file.");
      return;
    }
    setFile(f);
    setError(null);
    setOutputUrl(null);
    setOutputDims(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const img = new Image();
      img.onload = () => {
        setOriginalDims({ w: img.width, h: img.height });
        setWidth(img.width.toString());
        setHeight(img.height.toString());
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(f);
  }, []);

  const handleWidthChange = (val: string) => {
    setWidth(val);
    if (lockAspect && originalDims && originalDims.w > 0) {
      const numW = parseInt(val, 10);
      if (!isNaN(numW) && numW > 0) {
        const calcH = Math.round((numW * originalDims.h) / originalDims.w);
        setHeight(calcH.toString());
      }
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    if (lockAspect && originalDims && originalDims.h > 0) {
      const numH = parseInt(val, 10);
      if (!isNaN(numH) && numH > 0) {
        const calcW = Math.round((numH * originalDims.w) / originalDims.h);
        setWidth(calcW.toString());
      }
    }
  };

  const handleApplyPreset = (w: number, h: number) => {
    setWidth(w.toString());
    setHeight(h.toString());
    setLockAspect(false);
  };

  const handleApplyPercentage = (pct: number) => {
    setPercentage(pct);
    if (originalDims) {
      const newW = Math.round((originalDims.w * pct) / 100);
      const newH = Math.round((originalDims.h * pct) / 100);
      setWidth(newW.toString());
      setHeight(newH.toString());
    }
  };

  const handleResize = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const options: {
        percentage?: number;
        width?: number;
        height?: number;
        maintainAspectRatio?: boolean;
        fitMode?: "stretch" | "contain" | "cover";
      } = {
        maintainAspectRatio: lockAspect,
        fitMode,
      };

      if (mode === "percentage") {
        options.percentage = percentage;
      } else {
        if (width) options.width = parseInt(width, 10);
        if (height) options.height = parseInt(height, 10);
      }

      const res = await resizeImage(file, options);
      if (res.status === "success" && res.outputUrl) {
        setOutputUrl(res.outputUrl);
        const data = res.data as { downloadName: string; width: number; height: number; size: number };
        setOutputName(data.downloadName);
        setOutputDims({ w: data.width, h: data.height, size: data.size });
      } else {
        setError(res.error || "Failed to resize image.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resize failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = outputName;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setOriginalDims(null);
    setOutputUrl(null);
    setOutputDims(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
            Image Resizer Studio
          </Badge>
          <span className="text-xs text-muted-foreground">
            Resize by pixel dimensions, percentage, or social platform presets with bicubic interpolation
          </span>
        </div>
        {file && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" /> Start Over
          </Button>
        )}
      </div>

      {!file && (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            dragOver ? "border-blue-500 bg-blue-500/5 scale-[0.99]" : "border-border/60 hover:border-blue-500/40 bg-card/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/20 text-blue-600">
            <Maximize2 className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base mb-1">Drop image to resize</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Supports custom pixels, aspect locking, and one-click presets for Instagram, YouTube, and X.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <Button size="sm" className="rounded-xl gap-2 pointer-events-none bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="h-4 w-4" /> Select Image
          </Button>
        </div>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {file && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {originalDims && <span>{originalDims.w}×{originalDims.h} px</span>}
                  <span>•</span>
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>

            {outputUrl ? (
              <Button onClick={handleDownload} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="h-4 w-4" /> Download Resized Image
              </Button>
            ) : (
              <Button onClick={handleResize} disabled={processing} className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Resizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Apply Resize
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
            {/* Left Controls */}
            <div className="min-w-0 space-y-4 xl:col-start-2 xl:row-start-1">
              <section aria-label="Resize settings">
                <div className="space-y-4">
                  <div className="flex gap-2 p-1 bg-muted/40 rounded-xl border border-border/50">
                    <Button
                      size="sm"
                      variant={mode === "dimensions" ? "default" : "ghost"}
                      className="flex-1 rounded-lg text-xs"
                      onClick={() => setMode("dimensions")}
                    >
                      Dimensions
                    </Button>
                    <Button
                      size="sm"
                      variant={mode === "percentage" ? "default" : "ghost"}
                      className="flex-1 rounded-lg text-xs"
                      onClick={() => setMode("percentage")}
                    >
                      Percentage
                    </Button>
                    <Button
                      size="sm"
                      variant={mode === "presets" ? "default" : "ghost"}
                      className="flex-1 rounded-lg text-xs"
                      onClick={() => setMode("presets")}
                    >
                      Presets
                    </Button>
                  </div>

                  {mode === "dimensions" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Width (px)</Label>
                          <Input
                            type="number"
                            value={width}
                            onChange={(e) => handleWidthChange(e.target.value)}
                            className="rounded-xl text-xs h-9 font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Height (px)</Label>
                          <Input
                            type="number"
                            value={height}
                            onChange={(e) => handleHeightChange(e.target.value)}
                            className="rounded-xl text-xs h-9 font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setLockAspect(!lockAspect)}
                        className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                          lockAspect
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-600"
                            : "bg-muted/30 border-border/50 text-muted-foreground"
                        }`}
                      >
                        {lockAspect ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                        {lockAspect ? "Aspect Ratio Locked" : "Aspect Ratio Free"}
                      </button>

                      <div className="space-y-1.5 pt-2 border-t border-border/40">
                        <Label className="text-xs">Scaling Behavior</Label>
                        <select
                          aria-label="Scaling behavior"
                          value={fitMode}
                          onChange={(e) => setFitMode(e.target.value as typeof fitMode)}
                          className="w-full rounded-xl border border-border/50 bg-background p-2 text-xs h-9"
                        >
                          <option value="stretch">Exact Fit (Stretch / Fit)</option>
                          <option value="contain">Contain (Pad with White Canvas)</option>
                          <option value="cover">Cover (Center Crop to Fill)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {mode === "percentage" && (
                    <div className="space-y-4">
                      <Label className="text-xs">Scale Image Proportionally:</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 xl:grid-cols-3 gap-2">
                        {[25, 50, 75, 150, 200].map((pct) => (
                          <Button
                            key={pct}
                            type="button"
                            size="sm"
                            variant={percentage === pct ? "default" : "outline"}
                            className="rounded-xl text-xs"
                            onClick={() => handleApplyPercentage(pct)}
                          >
                            {pct}%
                          </Button>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl bg-muted/20 border border-border/40 text-xs">
                        Target Dimensions:{" "}
                        <span className="font-mono font-bold text-blue-600">
                          {width}×{height} px
                        </span>
                      </div>
                    </div>
                  )}

                  {mode === "presets" && (
                    <div className="space-y-2">
                      <Label className="text-xs">Popular Social & Web Resolutions:</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {SOCIAL_PRESETS.map((p) => (
                          <div
                            key={p.name}
                            onClick={() => handleApplyPreset(p.w, p.h)}
                            className="p-2.5 rounded-xl border border-border/50 hover:border-blue-500/40 bg-card cursor-pointer transition-all"
                          >
                            <p className="text-xs font-semibold">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{p.w}×{p.h} px</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Preview */}
            <div className="order-first min-w-0 space-y-4 xl:col-start-1 xl:row-start-1">
              <section aria-label="Resolution preview" className="overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-blue-600" /> Resolution Preview
                    </span>
                    {outputDims && (
                      <span className="text-muted-foreground font-mono text-[11px]">
                        Result: {outputDims.w}×{outputDims.h} px ({(outputDims.size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>

                  <div className="relative rounded-xl border border-border/50 bg-black/5 dark:bg-black/30 overflow-hidden min-h-[340px] flex items-center justify-center p-2">
                    <img
                      src={outputUrl || preview || ""}
                      alt="Preview"
                      className="max-h-[460px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}