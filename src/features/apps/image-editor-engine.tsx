"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  ImagePlus, Download, RotateCw, Crop, SlidersHorizontal, Sun,
  Contrast, Droplet, Wand2, Type, Pencil, Eraser, Undo2, Redo2,
  Trash2, Upload, Copy, Check, X, Palette, Sparkles, MousePointer
} from "lucide-react";

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  warmth: number;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

type Tool = "select" | "draw" | "erase" | "text" | "crop";

const FILTER_PRESETS = [
  { name: "None", settings: { brightness: 100, contrast: 100, saturation: 100, blur: 0, warmth: 0 } },
  { name: "Vintage", settings: { brightness: 110, contrast: 85, saturation: 70, blur: 0, warmth: 20 } },
  { name: "Cool", settings: { brightness: 100, contrast: 110, saturation: 120, blur: 0, warmth: -15 } },
  { name: "Warm", settings: { brightness: 105, contrast: 95, saturation: 110, blur: 0, warmth: 25 } },
  { name: "Dramatic", settings: { brightness: 90, contrast: 140, saturation: 80, blur: 0, warmth: 0 } },
  { name: "Soft", settings: { brightness: 115, contrast: 80, saturation: 90, blur: 2, warmth: 10 } },
  { name: "B&W", settings: { brightness: 100, contrast: 120, saturation: 0, blur: 0, warmth: 0 } },
];

export function ImageEditorEngine() {
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterSettings>(FILTER_PRESETS[0].settings);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#dc2626");
  const [drawSize, setDrawSize] = useState(3);
  const [rotation, setRotation] = useState(0);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  const pushUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setUndoStack((prev) => [...prev.slice(-20), canvas.toDataURL()]);
  }, []);

  const undo = () => {
    if (undoStack.length === 0 || !image) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setImage(prev);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImage(dataUrl);
      setOriginalImage(dataUrl);
      setFilters(FILTER_PRESETS[0].settings);
      setTextOverlays([]);
      setRotation(0);
      setUndoStack([]);
    };
    reader.readAsDataURL(file);
  };

  const applyFilters = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`;
      ctx.save();
      if (rotation) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
      } else {
        ctx.drawImage(img, 0, 0);
      }
      ctx.restore();

      // Apply warmth via color overlay
      if (filters.warmth !== 0) {
        const warmthColor = filters.warmth > 0 ? `rgba(255,${200 - filters.warmth},0,0.1)` : `rgba(0,${200 + filters.warmth},255,0.1)`;
        ctx.fillStyle = warmthColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw text overlays
      textOverlays.forEach((overlay) => {
        ctx.font = `${overlay.fontSize}px Inter, sans-serif`;
        ctx.fillStyle = overlay.color;
        ctx.fillText(overlay.text, overlay.x, overlay.y);
      });
    };
    img.src = image;
  }, [image, filters, rotation, textOverlays]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "draw") {
      setIsDrawing(true);
      const canvas = drawCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawSize;
      ctx.lineCap = "round";
    }
    if (activeTool === "text") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (newText.trim()) {
        pushUndo();
        setTextOverlays((prev) => [
          ...prev,
          { id: Date.now().toString(), text: newText, x, y, fontSize: 24, color: "#ffffff" },
        ]);
        setNewText("");
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool !== "draw") return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      pushUndo();
      // Merge draw canvas onto main canvas
      const mainCanvas = canvasRef.current;
      const drawCanvas = drawCanvasRef.current;
      if (!mainCanvas || !drawCanvas) return;
      const ctx = mainCanvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(drawCanvas, 0, 0);
      // Clear draw canvas
      const drawCtx = drawCanvas.getContext("2d");
      if (drawCtx) drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
      setImage(mainCanvas.toDataURL());
    }
  };

  const resetAll = () => {
    if (originalImage) {
      setImage(originalImage);
      setFilters(FILTER_PRESETS[0].settings);
      setTextOverlays([]);
      setRotation(0);
      setUndoStack([]);
    }
  };

  const downloadImage = (format: "png" | "jpeg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `edited-image.${format}`;
    a.click();
  };

  const applyPreset = (preset: typeof FILTER_PRESETS[0]) => {
    pushUndo();
    setFilters(preset.settings);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
          <Upload className="h-4 w-4" /> Open Image
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {([
            { tool: "select" as Tool, icon: MousePointer, label: "Select" },
            { tool: "draw" as Tool, icon: Pencil, label: "Draw" },
            { tool: "erase" as Tool, icon: Eraser, label: "Erase" },
            { tool: "text" as Tool, icon: Type, label: "Text" },
          ]).map(({ tool, icon: Icon, label }) => (
            <Button
              key={tool}
              variant={activeTool === tool ? "default" : "ghost"}
              size="sm"
              className="h-8 gap-1"
              onClick={() => setActiveTool(tool)}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={undoStack.length === 0}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetAll}>
          <RotateCw className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={() => downloadImage("png")} className="gap-1.5">
          <Download className="h-4 w-4" /> PNG
        </Button>
        <Button variant="outline" size="sm" onClick={() => downloadImage("jpeg")} className="gap-1.5">
          <Download className="h-4 w-4" /> JPEG
        </Button>
      </div>

      {/* Text input for text tool */}
      {activeTool === "text" && (
        <div className="flex gap-2">
          <Input
            placeholder="Type text to add to image..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="max-w-xs"
          />
          <span className="text-xs text-muted-foreground self-center">Click on image to place text</span>
        </div>
      )}

      {/* Draw settings */}
      {activeTool === "draw" && (
        <div className="flex items-center gap-3">
          <span className="text-sm">Color:</span>
          <input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          <span className="text-sm">Size:</span>
          <input type="range" min="1" max="20" value={drawSize} onChange={(e) => setDrawSize(parseInt(e.target.value))} className="w-24" />
          <span className="text-xs text-muted-foreground">{drawSize}px</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas */}
        <div className="lg:col-span-3">
          {image ? (
            <div className="relative inline-block max-w-full">
              <canvas ref={canvasRef} className="max-w-full rounded-lg border" />
              <canvas
                ref={drawCanvasRef}
                className="absolute inset-0 max-w-full rounded-lg"
                style={{ pointerEvents: activeTool === "draw" ? "auto" : "none" }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
            </div>
          ) : (
            <div
              className="w-full h-[400px] rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Click to upload an image</p>
              <p className="text-xs text-muted-foreground/70">JPEG, PNG, WebP supported</p>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        <div className="space-y-3">
          {image && (
            <>
              {/* Presets */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Presets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {FILTER_PRESETS.map((preset) => (
                      <Badge
                        key={preset.name}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => applyPreset(preset)}
                      >
                        {preset.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Adjustments */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <SlidersHorizontal className="h-4 w-4" /> Adjust
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1"><Sun className="h-3 w-3" /> Brightness</span>
                      <span>{filters.brightness}%</span>
                    </div>
                    <Slider value={[filters.brightness]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; pushUndo(); setFilters((f) => ({ ...f, brightness: val })); }} min={0} max={200} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1"><Contrast className="h-3 w-3" /> Contrast</span>
                      <span>{filters.contrast}%</span>
                    </div>
                    <Slider value={[filters.contrast]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; pushUndo(); setFilters((f) => ({ ...f, contrast: val })); }} min={0} max={200} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1"><Droplet className="h-3 w-3" /> Saturation</span>
                      <span>{filters.saturation}%</span>
                    </div>
                    <Slider value={[filters.saturation]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; pushUndo(); setFilters((f) => ({ ...f, saturation: val })); }} min={0} max={200} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1"><Wand2 className="h-3 w-3" /> Warmth</span>
                      <span>{filters.warmth > 0 ? "+" : ""}{filters.warmth}</span>
                    </div>
                    <Slider value={[filters.warmth + 50]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; pushUndo(); setFilters((f) => ({ ...f, warmth: val - 50 })); }} min={0} max={100} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span>Blur</span>
                      <span>{filters.blur}px</span>
                    </div>
                    <Slider value={[filters.blur]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; pushUndo(); setFilters((f) => ({ ...f, blur: val })); }} min={0} max={10} step={0.5} />
                  </div>
                </CardContent>
              </Card>

              {/* Rotation */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <RotateCw className="h-4 w-4" /> Rotation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {[0, 90, 180, 270].map((deg) => (
                      <Button
                        key={deg}
                        variant={rotation === deg ? "default" : "outline"}
                        size="sm"
                        onClick={() => { pushUndo(); setRotation(deg); }}
                      >
                        {deg}°
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Text Overlays */}
              {textOverlays.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Type className="h-4 w-4" /> Text ({textOverlays.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {textOverlays.map((overlay) => (
                      <div key={overlay.id} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted/50">
                        <span className="truncate flex-1">{overlay.text}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-destructive"
                          onClick={() => {
                            pushUndo();
                            setTextOverlays((prev) => prev.filter((t) => t.id !== overlay.id));
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

