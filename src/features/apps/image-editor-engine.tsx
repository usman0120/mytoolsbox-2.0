"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ImagePlus, Download, RotateCw, Crop, SlidersHorizontal, Sun,
  Contrast, Droplet, Wand2, Type, Pencil, Eraser, Undo2,
  Trash2, Upload, Sparkles, MousePointer,
  Square, Circle, Triangle, Layers, ChevronUp, ChevronDown, Eye, EyeOff,
  Maximize2, Scissors, PaintBucket, Move, Plus, Minus
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  fontFamily: string;
}

interface ShapeOverlay {
  id: string;
  type: "rectangle" | "circle" | "triangle" | "line" | "arrow";
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
}

interface ImageLayer {
  id: string;
  name: string;
  dataUrl: string;
  visible: boolean;
  opacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

type Tool = "select" | "draw" | "erase" | "text" | "crop" | "shape";

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EditorSnapshot {
  image: string | null;
  imageSize: { width: number; height: number };
  filters: FilterSettings;
  rotation: number;
  textOverlays: TextOverlay[];
  shapeOverlays: ShapeOverlay[];
  layers: ImageLayer[];
  drawing: string | null;
  bgColor: string;
  showBg: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FILTER_PRESETS = [
  { name: "None", settings: { brightness: 100, contrast: 100, saturation: 100, blur: 0, warmth: 0 } },
  { name: "Vintage", settings: { brightness: 110, contrast: 85, saturation: 70, blur: 0, warmth: 20 } },
  { name: "Cool", settings: { brightness: 100, contrast: 110, saturation: 120, blur: 0, warmth: -15 } },
  { name: "Warm", settings: { brightness: 105, contrast: 95, saturation: 110, blur: 0, warmth: 25 } },
  { name: "Dramatic", settings: { brightness: 90, contrast: 140, saturation: 80, blur: 0, warmth: 0 } },
  { name: "Soft", settings: { brightness: 115, contrast: 80, saturation: 90, blur: 2, warmth: 10 } },
  { name: "B&W", settings: { brightness: 100, contrast: 120, saturation: 0, blur: 0, warmth: 0 } },
  { name: "Sepia", settings: { brightness: 105, contrast: 90, saturation: 60, blur: 0, warmth: 30 } },
  { name: "Polaroid", settings: { brightness: 115, contrast: 95, saturation: 85, blur: 0, warmth: 15 } },
  { name: "Cinematic", settings: { brightness: 95, contrast: 130, saturation: 110, blur: 0, warmth: -5 } },
];

const SHAPE_TOOLS = [
  { type: "rectangle" as const, icon: Square, label: "Rectangle" },
  { type: "circle" as const, icon: Circle, label: "Circle" },
  { type: "triangle" as const, icon: Triangle, label: "Triangle" },
  { type: "line" as const, icon: Minus, label: "Line" },
  { type: "arrow" as const, icon: Move, label: "Arrow" },
];

const FONT_FAMILIES = ["Inter", "Georgia", "Courier New", "Impact", "Comic Sans MS"];

// ─── Component ───────────────────────────────────────────────────────────────

export function ImageEditorEngine() {
  // Image state
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Filters
  const [filters, setFilters] = useState<FilterSettings>(FILTER_PRESETS[0].settings);

  // Tools
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [activeShape, setActiveShape] = useState<ShapeOverlay["type"]>("rectangle");

  // Text
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [newText, setNewText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(24);
  const [textFont, setTextFont] = useState("Inter");

  // Shapes
  const [shapeOverlays, setShapeOverlays] = useState<ShapeOverlay[]>([]);
  const [shapeFill, setShapeFill] = useState("#3b82f6");
  const [shapeStroke, setShapeStroke] = useState("#1e40af");
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState(2);
  const [shapeOpacity, setShapeOpacity] = useState(80);

  // Drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#dc2626");
  const [drawSize, setDrawSize] = useState(3);

  // Crop
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });

  // Resize
  const [resizeW, setResizeW] = useState(0);
  const [resizeH, setResizeH] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);

  // Rotation
  const [rotation, setRotation] = useState(0);

  // Layers
  const [layers, setLayers] = useState<ImageLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Background
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showBg, setShowBg] = useState(false);

  // Undo
  const [undoStack, setUndoStack] = useState<EditorSnapshot[]>([]);
  const [drawing, setDrawing] = useState<string | null>(null);
  const renderTaskRef = useRef<Promise<void>>(Promise.resolve());
  const renderVersionRef = useRef(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const layerInputRef = useRef<HTMLInputElement>(null);

  // ─── Undo ──────────────────────────────────────────────────────────────────

  const pushUndo = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-29), {
      image, imageSize, filters, rotation, textOverlays, shapeOverlays,
      layers, drawing, bgColor, showBg,
    }]);
  }, [image, imageSize, filters, rotation, textOverlays, shapeOverlays, layers, drawing, bgColor, showBg]);

  const undo = () => {
    if (undoStack.length === 0 || !image) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setImage(prev.image);
    setImageSize(prev.imageSize);
    setResizeW(prev.imageSize.width);
    setResizeH(prev.imageSize.height);
    setFilters(prev.filters);
    setRotation(prev.rotation);
    setTextOverlays(prev.textOverlays);
    setShapeOverlays(prev.shapeOverlays);
    setLayers(prev.layers);
    setDrawing(prev.drawing);
    setBgColor(prev.bgColor);
    setShowBg(prev.showBg);
    setCropRect(null);
    setIsCropping(false);
  };

  // ─── File Upload ───────────────────────────────────────────────────────────

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        setResizeW(img.width);
        setResizeH(img.height);
        setImage(dataUrl);
        setOriginalImage(dataUrl);
        setFilters(FILTER_PRESETS[0].settings);
        setTextOverlays([]);
        setShapeOverlays([]);
        setLayers([]);
        setRotation(0);
        setUndoStack([]);
        setCropRect(null);
        setIsCropping(false);
        setDrawing(null);
        setShowBg(false);
      };
      img.onerror = () => toast.error("Cannot decode this image. Select a supported image file.");
      img.src = dataUrl;
    };
    reader.onerror = () => toast.error("Cannot read this image.");
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ─── Layer Management ──────────────────────────────────────────────────────

  const addLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        pushUndo();
        const newLayer: ImageLayer = {
          id: Date.now().toString(),
          name: `Layer ${layers.length + 1}`,
          dataUrl,
          visible: true,
          opacity: 100,
          x: 50,
          y: 50,
          width: Math.min(img.width, 200),
          height: Math.min(img.height, 200),
        };
        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
      };
      img.onerror = () => toast.error("Cannot decode this layer image.");
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const toggleLayerVisibility = (id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  };

  const updateLayer = (id: string, updates: Partial<ImageLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const deleteLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const moveLayerUp = (id: string) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
      return copy;
    });
  };

  const moveLayerDown = (id: string) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx >= prev.length - 1) return prev;
      const copy = [...prev];
      [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]];
      return copy;
    });
  };

  // ─── Render Canvas ─────────────────────────────────────────────────────────

  const applyFilters = useCallback(async () => {
    const version = ++renderVersionRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loadImage = (source: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const bitmap = new Image();
      bitmap.onload = () => resolve(bitmap);
      bitmap.onerror = () => reject(new Error("Cannot render this image."));
      bitmap.src = source;
    });
    const [img, layerImages, drawingImage] = await Promise.all([
      loadImage(image),
      Promise.all(layers.filter((layer) => layer.visible).map(async (layer) => ({ layer, bitmap: await loadImage(layer.dataUrl) }))),
      drawing ? loadImage(drawing) : Promise.resolve(null),
    ]);
    if (version !== renderVersionRef.current) return;
      const rotated = rotation === 90 || rotation === 270;
      const baseW = imageSize.width || img.width;
      const baseH = imageSize.height || img.height;
      const w = rotated ? baseH : baseW;
      const h = rotated ? baseW : baseH;
      canvas.width = w;
      canvas.height = h;
      setCanvasSize({ width: w, height: h });
      const drawCanvas = drawCanvasRef.current;
      if (drawCanvas) {
        drawCanvas.width = w;
        drawCanvas.height = h;
        if (drawingImage) drawCanvas.getContext("2d")?.drawImage(drawingImage, 0, 0, w, h);
      }

      ctx.clearRect(0, 0, w, h);

      // Background
      if (showBg) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`;
      ctx.save();
      if (rotation) {
        ctx.translate(w / 2, h / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
      } else {
        ctx.drawImage(img, 0, 0, w, h);
      }
      ctx.restore();
      ctx.filter = "none";

      // Warmth overlay
      if (filters.warmth !== 0) {
        const warmthColor = filters.warmth > 0
          ? `rgba(255,${200 - filters.warmth},0,0.1)`
          : `rgba(0,${200 + filters.warmth},255,0.1)`;
        ctx.fillStyle = warmthColor;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw layers
      layerImages.forEach(({ layer, bitmap }) => {
        ctx.globalAlpha = layer.opacity / 100;
        ctx.drawImage(bitmap, layer.x, layer.y, layer.width, layer.height);
        ctx.globalAlpha = 1;
      });

      // Draw shapes
      shapeOverlays.forEach((shape) => {
        ctx.globalAlpha = shape.opacity / 100;
        ctx.fillStyle = shape.fillColor;
        ctx.strokeStyle = shape.strokeColor;
        ctx.lineWidth = shape.strokeWidth;
        ctx.beginPath();
        switch (shape.type) {
          case "rectangle":
            ctx.rect(shape.x, shape.y, shape.width, shape.height);
            break;
          case "circle":
            ctx.ellipse(shape.x + shape.width / 2, shape.y + shape.height / 2, shape.width / 2, shape.height / 2, 0, 0, Math.PI * 2);
            break;
          case "triangle":
            ctx.moveTo(shape.x + shape.width / 2, shape.y);
            ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
            ctx.lineTo(shape.x, shape.y + shape.height);
            ctx.closePath();
            break;
          case "line":
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
            break;
          case "arrow":
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
            const angle = Math.atan2(shape.height, shape.width);
            const headLen = 15;
            ctx.lineTo(
              shape.x + shape.width - headLen * Math.cos(angle - Math.PI / 6),
              shape.y + shape.height - headLen * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(shape.x + shape.width, shape.y + shape.height);
            ctx.lineTo(
              shape.x + shape.width - headLen * Math.cos(angle + Math.PI / 6),
              shape.y + shape.height - headLen * Math.sin(angle + Math.PI / 6)
            );
            break;
        }
        if (shape.type !== "line" && shape.type !== "arrow") ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Draw text overlays
      textOverlays.forEach((overlay) => {
        ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}, sans-serif`;
        ctx.fillStyle = overlay.color;
        ctx.fillText(overlay.text, overlay.x, overlay.y);
      });

      if (drawingImage) ctx.drawImage(drawingImage, 0, 0, w, h);
  }, [image, imageSize, filters, rotation, textOverlays, shapeOverlays, layers, drawing, showBg, bgColor]);

  useEffect(() => {
    renderTaskRef.current = applyFilters();
    void renderTaskRef.current.catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Cannot render image."));
  }, [applyFilters]);

  // ─── Canvas Mouse Handlers ─────────────────────────────────────────────────

  const handleCanvasMouseDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * canvas.width / rect.width));
    const y = Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * canvas.height / rect.height));
    e.currentTarget.setPointerCapture(e.pointerId);
    if (activeTool === "draw" || activeTool === "erase") pushUndo();

    if (activeTool === "draw") {
      setIsDrawing(true);
      const drawCanvas = drawCanvasRef.current;
      if (!drawCanvas) return;
      const dctx = drawCanvas.getContext("2d");
      if (!dctx) return;
      dctx.beginPath();
      dctx.moveTo(x, y);
      dctx.strokeStyle = drawColor;
      dctx.lineWidth = drawSize;
      dctx.lineCap = "round";
    }

    if (activeTool === "erase") {
      setIsDrawing(true);
      const drawCanvas = drawCanvasRef.current;
      if (!drawCanvas) return;
      const dctx = drawCanvas.getContext("2d");
      if (!dctx) return;
      dctx.beginPath();
      dctx.moveTo(x, y);
      dctx.strokeStyle = "rgba(255,255,255,1)";
      dctx.lineWidth = drawSize * 3;
      dctx.lineCap = "round";
      dctx.globalCompositeOperation = "destination-out";
    }

    if (activeTool === "text") {
      if (newText.trim()) {
        pushUndo();
        setTextOverlays((prev) => [
          ...prev,
          { id: Date.now().toString(), text: newText, x, y, fontSize: textSize, color: textColor, fontFamily: textFont },
        ]);
        setNewText("");
      }
    }

    if (activeTool === "shape") {
      pushUndo();
      const newShape: ShapeOverlay = {
        id: Date.now().toString(),
        type: activeShape,
        x,
        y,
        width: activeShape === "line" || activeShape === "arrow" ? 100 : 120,
        height: activeShape === "line" || activeShape === "arrow" ? 1 : 80,
        fillColor: shapeFill,
        strokeColor: shapeStroke,
        strokeWidth: shapeStrokeWidth,
        opacity: shapeOpacity,
      };
      setShapeOverlays((prev) => [...prev, newShape]);
    }

    if (activeTool === "crop") {
      setIsCropping(true);
      setCropStart({ x, y });
      setCropRect({ x, y, width: 0, height: 0 });
    }
  };

  const handleCanvasMouseMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * canvas.width / rect.width));
    const y = Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * canvas.height / rect.height));

    if (isDrawing && (activeTool === "draw" || activeTool === "erase")) {
      const drawCanvas = drawCanvasRef.current;
      if (!drawCanvas) return;
      const dctx = drawCanvas.getContext("2d");
      if (!dctx) return;
      dctx.lineTo(x, y);
      dctx.stroke();
    }

    if (isCropping && e.buttons > 0) {
      setCropRect({
        x: Math.min(cropStart.x, x),
        y: Math.min(cropStart.y, y),
        width: Math.abs(x - cropStart.x),
        height: Math.abs(y - cropStart.y),
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const drawCanvas = drawCanvasRef.current;
      if (!drawCanvas) return;
      setDrawing(drawCanvas.toDataURL());
      const dctx = drawCanvas.getContext("2d");
      if (dctx) {
        dctx.globalCompositeOperation = "source-over";
      }
    }
  };

  // ─── Crop Actions ──────────────────────────────────────────────────────────

  const commitBitmap = (bitmap: HTMLCanvasElement) => {
    setImage(bitmap.toDataURL());
    setImageSize({ width: bitmap.width, height: bitmap.height });
    setResizeW(bitmap.width);
    setResizeH(bitmap.height);
    setFilters(FILTER_PRESETS[0].settings);
    setRotation(0);
    setTextOverlays([]);
    setShapeOverlays([]);
    setLayers([]);
    setDrawing(null);
    setShowBg(false);
  };

  const applyCrop = async () => {
    if (!cropRect || cropRect.width < 10 || cropRect.height < 10) return;
    try { await renderTaskRef.current; } catch { return; }
    pushUndo();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = cropRect.width;
    cropCanvas.height = cropRect.height;
    const ctx = cropCanvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(canvas, cropRect.x, cropRect.y, cropRect.width, cropRect.height, 0, 0, cropRect.width, cropRect.height);
    commitBitmap(cropCanvas);
    setIsCropping(false);
    setCropRect(null);
    setActiveTool("select");
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setCropRect(null);
  };

  // ─── Resize ────────────────────────────────────────────────────────────────

  const applyResize = async () => {
    if (!Number.isFinite(resizeW) || !Number.isFinite(resizeH) || resizeW < 1 || resizeH < 1) return;
    try { await renderTaskRef.current; } catch { return; }
    pushUndo();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizedCanvas = document.createElement("canvas");
    resizedCanvas.width = resizeW;
    resizedCanvas.height = resizeH;
    const ctx = resizedCanvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(canvas, 0, 0, resizeW, resizeH);
    commitBitmap(resizedCanvas);
  };

  const handleResizeWChange = (v: number) => {
    setResizeW(v);
    if (lockAspect && imageSize.width > 0) {
      setResizeH(Math.round(v * (imageSize.height / imageSize.width)));
    }
  };

  const handleResizeHChange = (v: number) => {
    setResizeH(v);
    if (lockAspect && imageSize.height > 0) {
      setResizeW(Math.round(v * (imageSize.width / imageSize.height)));
    }
  };

  // ─── Reset & Download ──────────────────────────────────────────────────────

  const resetAll = () => {
    if (originalImage) {
      setImage(originalImage);
      setFilters(FILTER_PRESETS[0].settings);
      setTextOverlays([]);
      setShapeOverlays([]);
      setLayers([]);
      setRotation(0);
      setUndoStack([]);
      setCropRect(null);
      setIsCropping(false);
      setDrawing(null);
      setShowBg(false);
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        setResizeW(img.width);
        setResizeH(img.height);
      };
      img.src = originalImage;
    }
  };

  const downloadImage = async (format: "png" | "jpeg" | "webp") => {
    try { await renderTaskRef.current; } catch { return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mimeMap = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" };
    const dataUrl = canvas.toDataURL(mimeMap[format], 0.95);
    if (!dataUrl.startsWith(`data:${mimeMap[format]};`)) {
      toast.error(`This browser cannot export ${format.toUpperCase()}. Choose PNG or JPEG.`);
      return;
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `edited-image.${format}`;
    a.click();
  };

  const applyPreset = (preset: typeof FILTER_PRESETS[0]) => {
    pushUndo();
    setFilters(preset.settings);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full min-w-0 space-y-3 [&_button]:min-h-11 [&_input:not([type=range]):not([type=checkbox])]:min-h-11 **:data-[slot=card]:rounded-none **:data-[slot=card]:bg-transparent **:data-[slot=card]:ring-0 **:data-[slot=card]:py-2 **:data-[slot=card]:gap-2 **:data-[slot=card-header]:px-0 **:data-[slot=card-content]:px-0">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
          <Upload className="h-4 w-4" /> Open Image
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

        <Separator orientation="vertical" className="h-8" />

        <div role="group" aria-label="Editing tools" className="flex flex-wrap items-center gap-1">
          {([
            { tool: "select" as Tool, icon: MousePointer, label: "Select" },
            { tool: "draw" as Tool, icon: Pencil, label: "Draw" },
            { tool: "erase" as Tool, icon: Eraser, label: "Erase" },
            { tool: "text" as Tool, icon: Type, label: "Text" },
            { tool: "shape" as Tool, icon: Square, label: "Shapes" },
            { tool: "crop" as Tool, icon: Crop, label: "Crop" },
          ]).map(({ tool, icon: Icon, label }) => (
            <Button
              key={tool}
              variant={activeTool === tool ? "default" : "ghost"}
              size="icon"
              className="h-11 w-11"
              title={label}
              aria-label={label}
              aria-pressed={activeTool === tool}
              disabled={!image}
              onClick={() => { setActiveTool(tool); if (tool !== "crop") { setIsCropping(false); setCropRect(null); } }}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />

        <Button variant="ghost" size="icon" className="h-11 w-11" title="Undo" aria-label="Undo" onClick={undo} disabled={undoStack.length === 0}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-11 w-11" title="Reset image" aria-label="Reset image" onClick={resetAll} disabled={!image}>
          <RotateCw className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        {isCropping && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={applyCrop} className="gap-1.5"><Scissors className="h-3.5 w-3.5" /> Apply Crop</Button>
            <Button size="sm" variant="outline" onClick={cancelCrop}>Cancel</Button>
          </div>
        )}

        <Button variant="outline" size="sm" disabled={!image} onClick={() => downloadImage("png")} className="gap-1.5">
          <Download className="h-4 w-4" /> PNG
        </Button>
        <Button variant="outline" size="sm" disabled={!image} onClick={() => downloadImage("jpeg")} className="gap-1.5">
          <Download className="h-4 w-4" /> JPEG
        </Button>
        <Button variant="outline" size="sm" disabled={!image} onClick={() => downloadImage("webp")} className="gap-1.5">
          <Download className="h-4 w-4" /> WebP
        </Button>
      </div>

      {/* ── Tool-specific settings ── */}
      {activeTool === "text" && (
        <div className="flex flex-wrap items-center gap-3 p-2 bg-muted/30 rounded-lg">
          <Input aria-label="Overlay text" placeholder="Type text..." value={newText} onChange={(e) => setNewText(e.target.value)} className="max-w-50 h-8" />
          <span className="text-xs">Color:</span>
          <input aria-label="Text color" type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-11 h-11 rounded cursor-pointer" />
          <span className="text-xs">Size:</span>
          <Input aria-label="Text size" type="number" value={textSize} onChange={(e) => setTextSize(Number(e.target.value) || 24)} className="w-16 h-8" min={8} max={200} />
          <span className="text-xs">Font:</span>
          <select aria-label="Text font" value={textFont} onChange={(e) => setTextFont(e.target.value)} className="h-11 rounded-md border bg-background text-sm px-2">
            {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      )}

      {activeTool === "draw" && (
        <div className="flex flex-wrap items-center gap-3 py-2">
          <span className="text-xs">Color:</span>
          <input aria-label="Brush color" type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="w-11 h-11 rounded cursor-pointer" />
          <span className="text-xs">Size:</span>
          <input aria-label="Brush size" type="range" min="1" max="30" value={drawSize} onChange={(e) => setDrawSize(parseInt(e.target.value))} className="w-24" />
          <span className="text-xs text-muted-foreground">{drawSize}px</span>
        </div>
      )}

      {activeTool === "erase" && (
        <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
          <span className="text-xs">Eraser Size:</span>
          <input aria-label="Eraser size" type="range" min="1" max="30" value={drawSize} onChange={(e) => setDrawSize(parseInt(e.target.value))} className="w-24" />
          <span className="text-xs text-muted-foreground">{drawSize}px</span>
        </div>
      )}

      {activeTool === "shape" && (
        <div className="flex flex-wrap items-center gap-3 p-2 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
            {SHAPE_TOOLS.map((st) => (
              <Button
                key={st.type}
                variant={activeShape === st.type ? "default" : "ghost"}
                size="sm"
                className="h-11 w-11 p-0"
                onClick={() => setActiveShape(st.type)}
                title={st.label}
                aria-label={st.label}
                aria-pressed={activeShape === st.type}
              >
                <st.icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>
          <span className="text-xs">Fill:</span>
          <input aria-label="Shape fill color" type="color" value={shapeFill} onChange={(e) => setShapeFill(e.target.value)} className="w-11 h-11 rounded cursor-pointer" />
          <span className="text-xs">Stroke:</span>
          <input aria-label="Shape stroke color" type="color" value={shapeStroke} onChange={(e) => setShapeStroke(e.target.value)} className="w-11 h-11 rounded cursor-pointer" />
          <span className="text-xs">Width:</span>
          <input aria-label="Shape stroke width" type="range" min="1" max="10" value={shapeStrokeWidth} onChange={(e) => setShapeStrokeWidth(parseInt(e.target.value))} className="w-20" />
          <span className="text-xs">Opacity:</span>
          <input aria-label="Shape opacity" type="range" min="10" max="100" value={shapeOpacity} onChange={(e) => setShapeOpacity(parseInt(e.target.value))} className="w-20" />
          <span className="text-xs text-muted-foreground">{shapeOpacity}%</span>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="flex min-w-0 flex-col gap-3">
        {/* Canvas */}
        <div className="w-full min-w-0">
          {image ? (
            <div className="relative mx-auto max-w-full" style={{ width: canvasSize.height > 0 ? `min(100%, ${65 * canvasSize.width / canvasSize.height}dvh)` : "100%" }}>
              <canvas ref={canvasRef} aria-label="Image preview" className="block w-full h-auto" />
              <canvas
                ref={drawCanvasRef}
                aria-label="Image editing canvas"
                className="absolute inset-0 h-full w-full touch-none"
                onPointerDown={handleCanvasMouseDown}
                onPointerMove={handleCanvasMouseMove}
                onPointerUp={handleCanvasMouseUp}
                onPointerCancel={handleCanvasMouseUp}
              />
              {isCropping && cropRect && canvasSize.width > 0 && (
                <div className="absolute pointer-events-none border-2 border-primary border-dashed" style={{
                  left: `${cropRect.x / canvasSize.width * 100}%`,
                  top: `${cropRect.y / canvasSize.height * 100}%`,
                  width: `${cropRect.width / canvasSize.width * 100}%`,
                  height: `${cropRect.height / canvasSize.height * 100}%`,
                }} />
              )}
            </div>
          ) : (
            <button type="button"
              className="w-full min-h-48 rounded-lg border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-muted-foreground">Click to upload an image</p>
              <p className="text-xs text-muted-foreground/70">JPEG, PNG, WebP supported</p>
            </button>
          )}
        </div>

        {/* Sidebar */}
        <div className="min-w-0 space-y-3">
          {image && (
            <Tabs defaultValue="filters">
              <TabsList className="w-full h-auto flex-wrap">
                <TabsTrigger value="filters" className="flex-1 text-xs">Filters</TabsTrigger>
                <TabsTrigger value="layers" className="flex-1 text-xs">Layers</TabsTrigger>
                <TabsTrigger value="resize" className="flex-1 text-xs">Resize</TabsTrigger>
                <TabsTrigger value="bg" className="flex-1 text-xs">Background</TabsTrigger>
              </TabsList>

              {/* ── Filters Tab ── */}
              <TabsContent value="filters" className="grid gap-4 mt-3 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> Presets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {FILTER_PRESETS.map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          aria-pressed={filters === preset.settings}
                          onClick={() => applyPreset(preset)}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <SlidersHorizontal className="h-4 w-4" /> Adjust
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { icon: Sun, label: "Brightness", value: filters.brightness, min: 0, max: 200, key: "brightness" as const },
                      { icon: Contrast, label: "Contrast", value: filters.contrast, min: 0, max: 200, key: "contrast" as const },
                      { icon: Droplet, label: "Saturation", value: filters.saturation, min: 0, max: 200, key: "saturation" as const },
                    ].map(({ icon: Icon, label, value, min, max, key }) => (
                      <div key={key} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</span>
                          <span>{value}%</span>
                        </div>
                        <Slider aria-label={label} value={[value]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; pushUndo(); setFilters((f) => ({ ...f, [key]: val })); }} min={min} max={max} />
                      </div>
                    ))}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1"><Wand2 className="h-3 w-3" /> Warmth</span>
                        <span>{filters.warmth > 0 ? "+" : ""}{filters.warmth}</span>
                      </div>
                      <Slider aria-label="Warmth" value={[filters.warmth + 50]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; pushUndo(); setFilters((f) => ({ ...f, warmth: val - 50 })); }} min={0} max={100} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span>Blur</span>
                        <span>{filters.blur}px</span>
                      </div>
                      <Slider aria-label="Blur" value={[filters.blur]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; pushUndo(); setFilters((f) => ({ ...f, blur: val })); }} min={0} max={10} step={0.5} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <RotateCw className="h-4 w-4" /> Rotation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {[0, 90, 180, 270].map((deg) => (
                        <Button key={deg} variant={rotation === deg ? "default" : "outline"} size="sm"
                          onClick={() => { pushUndo(); setRotation(deg); }}>
                          {deg}°
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Layers Tab ── */}
              <TabsContent value="layers" className="space-y-3 mt-3">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-1.5">
                        <Layers className="h-4 w-4" /> Layers ({layers.length})
                      </CardTitle>
                      <Button variant="outline" size="sm" className="h-7 gap-1" onClick={() => layerInputRef.current?.click()}>
                        <Plus className="h-3 w-3" /> Add
                      </Button>
                      <input ref={layerInputRef} type="file" accept="image/*" onChange={addLayer} className="hidden" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {layers.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No layers. Add overlay images.</p>
                    )}
                    {layers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`flex flex-wrap items-center gap-1 text-xs py-2 border-b ${selectedLayerId === layer.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
                      >
                        <Button variant="ghost" size="icon" className="h-11 w-11" title="Toggle layer visibility" aria-label={`Toggle ${layer.name} visibility`} aria-pressed={layer.visible} onClick={() => { pushUndo(); toggleLayerVisibility(layer.id); }}>
                          {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>
                        <button type="button" className="flex-1 min-w-16 text-left break-all" aria-pressed={selectedLayerId === layer.id} onClick={() => setSelectedLayerId(layer.id)}>{layer.name}</button>
                        <Button variant="ghost" size="icon" className="h-11 w-11" title="Move layer up" aria-label={`Move ${layer.name} up`} onClick={() => { pushUndo(); moveLayerUp(layer.id); }}>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-11 w-11" title="Move layer down" aria-label={`Move ${layer.name} down`} onClick={() => { pushUndo(); moveLayerDown(layer.id); }}>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-11 w-11 text-destructive" title="Delete layer" aria-label={`Delete ${layer.name}`} onClick={() => { pushUndo(); deleteLayer(layer.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {selectedLayerId && (() => {
                  const layer = layers.find((l) => l.id === selectedLayerId);
                  if (!layer) return null;
                  return (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Layer Properties</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Name</label>
                          <Input aria-label="Layer name" value={layer.name} onChange={(e) => updateLayer(layer.id, { name: e.target.value })} className="h-8 text-sm mt-1" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span>Opacity</span><span>{layer.opacity}%</span>
                          </div>
                          <Slider aria-label="Layer opacity" value={[layer.opacity]} onValueChange={(v) => updateLayer(layer.id, { opacity: Array.isArray(v) ? v[0] : v })} min={10} max={100} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">X</label>
                            <Input aria-label="Layer X position" type="number" value={layer.x} onChange={(e) => updateLayer(layer.id, { x: Number(e.target.value) || 0 })} className="h-8 text-sm mt-1" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Y</label>
                            <Input aria-label="Layer Y position" type="number" value={layer.y} onChange={(e) => updateLayer(layer.id, { y: Number(e.target.value) || 0 })} className="h-8 text-sm mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </TabsContent>

              {/* ── Resize Tab ── */}
              <TabsContent value="resize" className="space-y-3 mt-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Maximize2 className="h-4 w-4" /> Resize Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span>Lock aspect ratio</span>
                      <input aria-label="Lock aspect ratio" type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} className="h-5 w-5 accent-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Width (px)</label>
                        <Input aria-label="Width in pixels" type="number" value={resizeW} onChange={(e) => handleResizeWChange(Number(e.target.value) || 1)} className="h-8 text-sm mt-1" min={1} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Height (px)</label>
                        <Input aria-label="Height in pixels" type="number" value={resizeH} onChange={(e) => handleResizeHChange(Number(e.target.value) || 1)} className="h-8 text-sm mt-1" min={1} />
                      </div>
                    </div>
                    <Button size="sm" onClick={applyResize} className="w-full gap-1.5">
                      <Maximize2 className="h-3.5 w-3.5" /> Apply Resize
                    </Button>
                    <p className="text-xs text-muted-foreground">Current: {imageSize.width} × {imageSize.height}px</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Background Tab ── */}
              <TabsContent value="bg" className="space-y-3 mt-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <PaintBucket className="h-4 w-4" /> Background
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span>Show background</span>
                      <input aria-label="Show background" type="checkbox" checked={showBg} onChange={(e) => { pushUndo(); setShowBg(e.target.checked); }} className="h-5 w-5 accent-primary" />
                    </div>
                    {showBg && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Color:</span>
                        <input aria-label="Background color" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-11 h-11 rounded cursor-pointer" />
                        <span className="text-xs text-muted-foreground">{bgColor}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Text & Shapes lists */}
                {(textOverlays.length > 0 || shapeOverlays.length > 0) && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Elements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {textOverlays.map((overlay) => (
                        <div key={overlay.id} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted/50">
                          <Type className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate flex-1">{overlay.text}</span>
                          <Button variant="ghost" size="icon" className="h-11 w-11 text-destructive" title="Delete text" aria-label={`Delete text ${overlay.text}`}
                            onClick={() => { pushUndo(); setTextOverlays((prev) => prev.filter((t) => t.id !== overlay.id)); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {shapeOverlays.map((shape) => (
                        <div key={shape.id} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted/50">
                          <Square className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate flex-1 capitalize">{shape.type}</span>
                          <Button variant="ghost" size="icon" className="h-11 w-11 text-destructive" title="Delete shape" aria-label={`Delete ${shape.type}`}
                            onClick={() => { pushUndo(); setShapeOverlays((prev) => prev.filter((s) => s.id !== shape.id)); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}