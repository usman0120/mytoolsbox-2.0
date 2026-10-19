"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Download,
  Trash2,
  Crop as CropIcon,
  Sparkles,
  Circle,
  Square,
  CheckCircle2,
  AlertCircle,
  Eye,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cropImage } from "@/features/images/image-cropper";

type AspectRatio = "free" | "1:1" | "16:9" | "4:3" | "9:16";

export function ImageCropperEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [aspect, setAspect] = useState<AspectRatio>("free");
  const [circleCrop, setCircleCrop] = useState<boolean>(false);

  // Display-space crop box percentages (0 to 100)
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragMode, setDragMode] = useState<"move" | "se" | "sw" | "ne" | "nw">("move");
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 });

  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>("cropped.png");
  const [croppedStats, setCroppedStats] = useState<{ width: number; height: number; size: number } | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please drop a valid image file.");
      return;
    }
    setFile(f);
    setError(null);
    setOutputUrl(null);
    setCroppedStats(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const img = new Image();
      img.onload = () => {
        setNaturalSize({ width: img.width, height: img.height });
        setCropBox({ x: 15, y: 15, width: 70, height: 70 });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(f);
  }, []);

  const handleApplyAspect = (ratio: AspectRatio) => {
    setAspect(ratio);
    if (ratio === "1:1") {
      setCropBox((prev) => ({ ...prev, height: prev.width }));
    } else if (ratio === "16:9") {
      setCropBox((prev) => ({ ...prev, height: Math.min(80, (prev.width * 9) / 16) }));
    } else if (ratio === "4:3") {
      setCropBox((prev) => ({ ...prev, height: Math.min(80, (prev.width * 3) / 4) }));
    } else if (ratio === "9:16") {
      setCropBox((prev) => ({ ...prev, width: Math.min(60, (prev.height * 9) / 16) }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent, mode: "move" | "se" | "sw" | "ne" | "nw") => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode(mode);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxW: cropBox.width,
      boxH: cropBox.height,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      const deltaXPercent = ((e.clientX - dragStart.mouseX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStart.mouseY) / rect.height) * 100;

      if (dragMode === "move") {
        const newX = Math.max(0, Math.min(100 - dragStart.boxW, dragStart.boxX + deltaXPercent));
        const newY = Math.max(0, Math.min(100 - dragStart.boxH, dragStart.boxY + deltaYPercent));
        setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (dragMode === "se") {
        const newW = Math.max(10, Math.min(100 - dragStart.boxX, dragStart.boxW + deltaXPercent));
        let newH = Math.max(10, Math.min(100 - dragStart.boxY, dragStart.boxH + deltaYPercent));
        if (aspect === "1:1") newH = newW;
        setCropBox((prev) => ({ ...prev, width: newW, height: newH }));
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragMode, dragStart, aspect]);

  const handleExecuteCrop = async () => {
    if (!file || !naturalSize.width || !naturalSize.height) return;

    setProcessing(true);
    setError(null);

    // Convert percentages to natural image pixel coordinates
    const pixelX = Math.round((cropBox.x / 100) * naturalSize.width);
    const pixelY = Math.round((cropBox.y / 100) * naturalSize.height);
    const pixelW = Math.round((cropBox.width / 100) * naturalSize.width);
    const pixelH = Math.round((cropBox.height / 100) * naturalSize.height);

    try {
      const res = await cropImage(file, {
        x: pixelX,
        y: pixelY,
        width: pixelW,
        height: pixelH,
        circleCrop,
      });

      if (res.status === "success" && res.outputUrl) {
        setOutputUrl(res.outputUrl);
        const data = res.data as { downloadName: string; width: number; height: number; size: number };
        setDownloadName(data.downloadName);
        setCroppedStats({ width: data.width, height: data.height, size: data.size });
      } else {
        setError(res.error || "Failed to crop image.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Crop failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = downloadName;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setOutputUrl(null);
    setCroppedStats(null);
    setError(null);
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            Image Cropper Studio
          </Badge>
          <span className="text-xs text-muted-foreground">
            Crop images with freeform handles, social aspect ratios, and circular avatar mode
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
            dragOver ? "border-amber-500 bg-amber-500/5 scale-[0.99]" : "border-border/60 hover:border-amber-500/40 bg-card/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20 text-amber-600">
            <CropIcon className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base mb-1">Drop image to crop</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Crop photos, social banners, or create round avatar profile pictures with live canvas boundaries.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <Button size="sm" className="rounded-xl gap-2 pointer-events-none bg-amber-600 hover:bg-amber-700 text-white">
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
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                <CropIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{naturalSize.width}×{naturalSize.height} px</span>
                  <span>•</span>
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>

            {outputUrl ? (
              <Button onClick={handleDownload} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                <Download className="h-4 w-4" /> Download Cropped Image
              </Button>
            ) : (
              <Button onClick={handleExecuteCrop} disabled={processing} className="gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs">
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Cropping...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Apply Crop
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
            {/* Left Options */}
            <section aria-label="Crop settings" className="min-w-0 xl:col-start-2 xl:row-start-1">
              <div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Aspect Ratio Presets</h4>
                    <p className="text-xs text-muted-foreground">Lock proportions or crop freeform.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "free", label: "Freeform" },
                      { id: "1:1", label: "1:1 Square" },
                      { id: "16:9", label: "16:9 Banner" },
                      { id: "4:3", label: "4:3 Standard" },
                      { id: "9:16", label: "9:16 Story" },
                    ].map((asp) => (
                      <Button
                        key={asp.id}
                        type="button"
                        size="sm"
                        variant={aspect === asp.id ? "default" : "outline"}
                        className={`rounded-xl text-xs ${aspect === asp.id ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
                        onClick={() => handleApplyAspect(asp.id as AspectRatio)}
                      >
                        {asp.label}
                      </Button>
                    ))}
                  </div>

                  {/* Circular Crop Mode */}
                  <div className="pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
                      <div>
                        <p className="text-xs font-semibold">Circle / Avatar Mode</p>
                        <p className="text-[11px] text-muted-foreground">Crops inside circle with transparent edges.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={circleCrop}
                        onChange={(e) => {
                          setCircleCrop(e.target.checked);
                          if (e.target.checked) handleApplyAspect("1:1");
                        }}
                        className="rounded border-border text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                    </div>
                  </div>

                  {croppedStats && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">Cropped Result:</p>
                      <p className="font-mono text-[11px]">{croppedStats.width}×{croppedStats.height} px ({(croppedStats.size / 1024).toFixed(1)} KB)</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Right Interactive Crop Canvas */}
            <section aria-label="Crop workspace" className="order-first min-w-0 xl:col-start-1 xl:row-start-1">
              <div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-amber-600" /> Crop preview
                    </span>
                    <span className="text-muted-foreground text-[11px] font-mono">
                      Crop: {Math.round((cropBox.width / 100) * naturalSize.width)}×{Math.round((cropBox.height / 100) * naturalSize.height)} px
                    </span>
                  </div>

                  <div
                    ref={containerRef}
                    className="relative rounded-xl border border-border/50 bg-black/10 dark:bg-black/40 overflow-hidden min-h-[380px] flex items-center justify-center p-2 select-none"
                  >
                    <div className="relative inline-block max-h-[460px] max-w-full">
                      {preview && (
                        <img
                          ref={imageRef}
                          src={preview}
                          alt="Crop Target"
                          className="max-h-[460px] w-auto max-w-full object-contain rounded-lg pointer-events-none block"
                          draggable={false}
                        />
                      )}

                      {/* Interactive Selection Box */}
                      <div
                        className={`absolute border-2 border-amber-500 bg-amber-500/15 cursor-move ${circleCrop ? "rounded-full" : "rounded-sm"}`}
                        style={{
                          left: `${cropBox.x}%`,
                          top: `${cropBox.y}%`,
                          width: `${cropBox.width}%`,
                          height: `${cropBox.height}%`,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, "move")}
                      >
                        {/* Corner Resize Handle */}
                        <div
                          className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 bg-amber-600 rounded-full border-2 border-white cursor-se-resize shadow-md"
                          onMouseDown={(e) => handleMouseDown(e, "se")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}