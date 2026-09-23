"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  Scissors,
  Pipette,
  Eye,
  Sliders,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  removeBackground,
  BackgroundRemoverOptions,
} from "@/features/images/background-remover";

export function BackgroundRemoverEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);

  // Settings
  const [tolerance, setTolerance] = useState(50); // 5 to 120
  const [feather, setFeather] = useState(10); // 0 to 30
  const [floodFillOnly, setFloodFillOnly] = useState(false);
  const [pickedColor, setPickedColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);
  const [bgMode, setBgMode] = useState<"transparent" | "white" | "custom">("transparent");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [showOriginal, setShowOriginal] = useState(false);

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setPickedColor(null);
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
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;

    // Determine sample key color
    let keyR = 0, keyG = 0, keyB = 0;
    if (pickedColor) {
      keyR = pickedColor.r;
      keyG = pickedColor.g;
      keyB = pickedColor.b;
    } else {
      // Default: sample corners
      const corners = [
        { x: 0, y: 0 },
        { x: w - 1, y: 0 },
        { x: 0, y: h - 1 },
        { x: w - 1, y: h - 1 },
      ];
      for (const pt of corners) {
        const idx = (pt.y * w + pt.x) * 4;
        keyR += data[idx];
        keyG += data[idx + 1];
        keyB += data[idx + 2];
      }
      keyR = Math.round(keyR / 4);
      keyG = Math.round(keyG / 4);
      keyB = Math.round(keyB / 4);
    }

    let repR = 255, repG = 255, repB = 255;
    if (bgMode === "white") {
      repR = 255; repG = 255; repB = 255;
    } else if (bgMode === "custom") {
      const hex = customColor.replace("#", "");
      repR = parseInt(hex.substring(0, 2), 16) || 255;
      repG = parseInt(hex.substring(2, 4), 16) || 255;
      repB = parseInt(hex.substring(4, 6), 16) || 255;
    }

    const featherDist = Math.max(1, feather * 1.5);

    if (floodFillOnly) {
      const visited = new Uint8Array(w * h);
      const queue: number[] = [];

      for (let x = 0; x < w; x++) {
        queue.push(x, 0);
        queue.push(x, h - 1);
      }
      for (let y = 1; y < h - 1; y++) {
        queue.push(0, y);
        queue.push(w - 1, y);
      }

      let head = 0;
      while (head < queue.length) {
        const px = queue[head++];
        const py = queue[head++];
        const pIndex = py * w + px;

        if (visited[pIndex]) continue;
        visited[pIndex] = 1;

        const idx = pIndex * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const dist = Math.sqrt((r - keyR) ** 2 + (g - keyG) ** 2 + (b - keyB) ** 2);
        if (dist <= tolerance) {
          if (bgMode === "transparent") {
            data[idx + 3] = 0;
          } else {
            data[idx] = repR;
            data[idx + 1] = repG;
            data[idx + 2] = repB;
            data[idx + 3] = 255;
          }

          if (px > 0 && !visited[pIndex - 1]) queue.push(px - 1, py);
          if (px < w - 1 && !visited[pIndex + 1]) queue.push(px + 1, py);
          if (py > 0 && !visited[pIndex - w]) queue.push(px, py - 1);
          if (py < h - 1 && !visited[pIndex + w]) queue.push(px, py + 1);
        }
      }
    } else {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const distance = Math.sqrt((r - keyR) ** 2 + (g - keyG) ** 2 + (b - keyB) ** 2);

        if (distance < tolerance) {
          if (bgMode === "transparent") {
            data[i + 3] = 0;
          } else {
            data[i] = repR;
            data[i + 1] = repG;
            data[i + 2] = repB;
            data[i + 3] = 255;
          }
        } else if (distance < tolerance + featherDist && bgMode === "transparent") {
          const factor = (distance - tolerance) / featherDist;
          data[i + 3] = Math.round(data[i + 3] * Math.min(1, factor));
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [
    baseImage,
    pickedColor,
    tolerance,
    feather,
    floodFillOnly,
    bgMode,
    customColor,
    showOriginal,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEyedropperActive || !canvasRef.current || !baseImage) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(baseImage, 0, 0);
    const pixel = tempCtx.getImageData(x, y, 1, 1).data;
    setPickedColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    setIsEyedropperActive(false);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    const base = file?.name.replace(/\.[^.]+$/, "") || "transparent";
    a.download = `${base}_nobg.png`;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setBaseImage(null);
    setPickedColor(null);
    setTolerance(50);
    setFeather(10);
    setBgMode("transparent");
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
            <Scissors className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Interactive Background Remover</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Cut out subjects, isolate products, and make images transparent with interactive tolerance and color picking.
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
                <h4 className="font-semibold text-sm">Background Replacement</h4>
                <p className="text-xs text-muted-foreground">Select output canvas background</p>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <Button
                  size="sm"
                  variant={bgMode === "transparent" ? "default" : "outline"}
                  className="h-8 text-xs rounded-xl"
                  onClick={() => setBgMode("transparent")}
                >
                  Transparent
                </Button>
                <Button
                  size="sm"
                  variant={bgMode === "white" ? "default" : "outline"}
                  className="h-8 text-xs rounded-xl"
                  onClick={() => setBgMode("white")}
                >
                  Pure White
                </Button>
                <Button
                  size="sm"
                  variant={bgMode === "custom" ? "default" : "outline"}
                  className="h-8 text-xs rounded-xl"
                  onClick={() => setBgMode("custom")}
                >
                  Custom
                </Button>
              </div>

              {bgMode === "custom" && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="h-8 w-10 rounded-lg cursor-pointer border p-0.5 bg-background"
                  />
                  <span className="text-xs text-muted-foreground uppercase">{customColor}</span>
                </div>
              )}

              {/* Eyedropper color picker */}
              <div className="space-y-2 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Pipette className="h-3.5 w-3.5" /> Sample Background Color
                  </Label>
                  <Button
                    size="sm"
                    variant={isEyedropperActive ? "default" : "outline"}
                    className="h-7 text-xs rounded-lg gap-1"
                    onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                  >
                    {isEyedropperActive ? "Click on Canvas..." : "Sample from Image"}
                  </Button>
                </div>

                {pickedColor && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/50 border text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full border border-black/20"
                        style={{ backgroundColor: `rgb(${pickedColor.r},${pickedColor.g},${pickedColor.b})` }}
                      />
                      <span>rgb({pickedColor.r}, {pickedColor.g}, {pickedColor.b})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPickedColor(null)}
                      className="h-5 text-[10px] text-muted-foreground"
                    >
                      Auto-Corners
                    </Button>
                  </div>
                )}
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium">Color Tolerance</Label>
                    <span className="text-xs text-muted-foreground">{tolerance}</span>
                  </div>
                  <Slider
                    value={[tolerance]}
                    min={5}
                    max={120}
                    step={1}
                    onValueChange={(val) => setTolerance(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium">Edge Smooth & Feather</Label>
                    <span className="text-xs text-muted-foreground">{feather}px</span>
                  </div>
                  <Slider
                    value={[feather]}
                    min={0}
                    max={25}
                    step={1}
                    onValueChange={(val) => setFeather(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="flood-fill-toggle" className="text-xs font-medium">
                      Contiguous Outer Border Only
                    </Label>
                    <p className="text-[11px] text-muted-foreground">Preserves similar colors inside subject</p>
                  </div>
                  <Switch id="flood-fill-toggle" checked={floodFillOnly} onCheckedChange={setFloodFillOnly} />
                </div>
              </div>

              <div className="pt-2 border-t">
                <Button onClick={handleDownload} className="w-full gap-2 rounded-xl">
                  <Download className="h-4 w-4" /> Download Transparent PNG
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Live Preview */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Live Cutout Preview
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

            <div
              className={`relative border rounded-2xl overflow-hidden flex items-center justify-center p-4 min-h-[460px] max-h-[640px] shadow-xs ${
                bgMode === "transparent" ? "bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2NkYPj/n4EBAwMDg4GBAdNgYmBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgAABqYgYCiQx1FQAAAABJRU5ErkJggg==')]" : ""
              }`}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`max-h-[580px] w-auto max-w-full object-contain rounded-lg shadow-md ${
                  isEyedropperActive ? "cursor-crosshair ring-2 ring-primary" : ""
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}