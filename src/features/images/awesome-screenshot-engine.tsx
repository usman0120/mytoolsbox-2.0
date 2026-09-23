"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Download,
  Copy,
  Check,
  Undo2,
  Trash2,
  Square,
  Circle,
  Pencil,
  Highlighter,
  ArrowUpRight,
  EyeOff,
  Type,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type AnnotationTool =
  | "pen"
  | "arrow"
  | "rectangle"
  | "circle"
  | "highlighter"
  | "blur"
  | "text";

interface Annotation {
  id: string;
  tool: AnnotationTool;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
  points?: { x: number; y: number }[];
  text?: string;
}

const COLORS = [
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ffffff", // White
  "#000000", // Black
];

export function AwesomeScreenshotEngine() {
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeTool, setActiveTool] = useState<AnnotationTool>("arrow");
  const [brushColor, setBrushColor] = useState("#ef4444");
  const [brushSize, setBrushSize] = useState(4);
  const [textInput, setTextInput] = useState("Important Issue");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Capture screen using DisplayMedia API
  const captureScreen = useCallback(async () => {
    setIsCapturing(true);
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert("Screen capture is not supported in this browser environment.");
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const offscreen = document.createElement("canvas");
      offscreen.width = video.videoWidth;
      offscreen.height = video.videoHeight;
      const ctx = offscreen.getContext("2d");
      if (ctx) ctx.drawImage(video, 0, 0);

      stream.getTracks().forEach((track) => track.stop());
      video.remove();

      const img = new Image();
      img.onload = () => {
        setBaseImage(img);
        setAnnotations([]);
      };
      img.src = offscreen.toDataURL("image/png");
    } catch (err) {
      console.warn("Screen capture cancelled or failed:", err);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  // Or load existing screenshot / file
  const handleLoadImage = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setBaseImage(img);
        setAnnotations([]);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Render canvas
  const renderCanvas = useCallback(
    (previewAnnotation?: Annotation) => {
      if (!baseImage || !canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = baseImage.naturalWidth || baseImage.width;
      canvas.height = baseImage.naturalHeight || baseImage.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw base screenshot
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseImage, 0, 0);

      const allToDraw = previewAnnotation
        ? [...annotations, previewAnnotation]
        : annotations;

      for (const ann of allToDraw) {
        ctx.save();

        if (ann.tool === "blur") {
          // Pixelate / Blur area
          const x = Math.min(ann.startX, ann.endX);
          const y = Math.min(ann.startY, ann.endY);
          const w = Math.max(10, Math.abs(ann.endX - ann.startX));
          const h = Math.max(10, Math.abs(ann.endY - ann.startY));

          try {
            // Sample image in region and pixelate
            const block = 10;
            const sub = ctx.getImageData(x, y, w, h);
            const subData = sub.data;
            for (let py = 0; py < h; py += block) {
              for (let px = 0; px < w; px += block) {
                const pIndex = (py * w + px) * 4;
                const r = subData[pIndex];
                const g = subData[pIndex + 1];
                const b = subData[pIndex + 2];
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x + px, y + py, block, block);
              }
            }
          } catch {
            // Fallback: draw frosted box
            ctx.fillStyle = "rgba(100, 116, 139, 0.95)";
            ctx.fillRect(x, y, w, h);
          }
          ctx.restore();
          continue;
        }

        ctx.strokeStyle = ann.color;
        ctx.fillStyle = ann.color;
        ctx.lineWidth = ann.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (ann.tool === "pen" && ann.points && ann.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(ann.points[0].x, ann.points[0].y);
          for (let i = 1; i < ann.points.length; i++) {
            ctx.lineTo(ann.points[i].x, ann.points[i].y);
          }
          ctx.stroke();
        } else if (
          ann.tool === "highlighter" &&
          ann.points &&
          ann.points.length > 1
        ) {
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = ann.size * 3;
          ctx.beginPath();
          ctx.moveTo(ann.points[0].x, ann.points[0].y);
          for (let i = 1; i < ann.points.length; i++) {
            ctx.lineTo(ann.points[i].x, ann.points[i].y);
          }
          ctx.stroke();
        } else if (ann.tool === "rectangle") {
          const x = Math.min(ann.startX, ann.endX);
          const y = Math.min(ann.startY, ann.endY);
          const w = Math.abs(ann.endX - ann.startX);
          const h = Math.abs(ann.endY - ann.startY);
          ctx.strokeRect(x, y, w, h);
        } else if (ann.tool === "circle") {
          const x = (ann.startX + ann.endX) / 2;
          const y = (ann.startY + ann.endY) / 2;
          const radiusX = Math.abs(ann.endX - ann.startX) / 2;
          const radiusY = Math.abs(ann.endY - ann.startY) / 2;
          ctx.beginPath();
          ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (ann.tool === "arrow") {
          // Draw line
          const headlen = Math.max(16, ann.size * 3.5);
          const angle = Math.atan2(
            ann.endY - ann.startY,
            ann.endX - ann.startX
          );
          ctx.beginPath();
          ctx.moveTo(ann.startX, ann.startY);
          ctx.lineTo(ann.endX, ann.endY);
          ctx.stroke();

          // Draw arrowhead
          ctx.beginPath();
          ctx.moveTo(ann.endX, ann.endY);
          ctx.lineTo(
            ann.endX - headlen * Math.cos(angle - Math.PI / 6),
            ann.endY - headlen * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            ann.endX - headlen * Math.cos(angle + Math.PI / 6),
            ann.endY - headlen * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();
        } else if (ann.tool === "text" && ann.text) {
          ctx.font = `bold ${Math.max(18, ann.size * 5)}px Inter, sans-serif`;
          ctx.textBaseline = "top";
          // background pill for legibility
          const textMetrics = ctx.measureText(ann.text);
          const pad = 6;
          ctx.fillStyle = "rgba(0,0,0,0.75)";
          ctx.fillRect(
            ann.startX - pad,
            ann.startY - pad,
            textMetrics.width + pad * 2,
            Math.max(18, ann.size * 5) + pad * 2
          );
          ctx.fillStyle = ann.color;
          ctx.fillText(ann.text, ann.startX, ann.startY);
        }

        ctx.restore();
      }
    },
    [baseImage, annotations]
  );

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Canvas coordinates converter
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!baseImage) return;
    const { x, y } = getCanvasCoords(e);
    isDrawingRef.current = true;
    startPosRef.current = { x, y };
    currentPointsRef.current = [{ x, y }];

    if (activeTool === "text") {
      isDrawingRef.current = false;
      const newAnn: Annotation = {
        id: Math.random().toString(36).substring(7),
        tool: "text",
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        color: brushColor,
        size: brushSize,
        text: textInput.trim() || "Note",
      };
      setAnnotations((prev) => [...prev, newAnn]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !baseImage) return;
    const { x, y } = getCanvasCoords(e);

    if (activeTool === "pen" || activeTool === "highlighter") {
      currentPointsRef.current.push({ x, y });
      renderCanvas({
        id: "preview",
        tool: activeTool,
        startX: startPosRef.current.x,
        startY: startPosRef.current.y,
        endX: x,
        endY: y,
        color: brushColor,
        size: brushSize,
        points: currentPointsRef.current,
      });
    } else {
      renderCanvas({
        id: "preview",
        tool: activeTool,
        startX: startPosRef.current.x,
        startY: startPosRef.current.y,
        endX: x,
        endY: y,
        color: brushColor,
        size: brushSize,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !baseImage) return;
    isDrawingRef.current = false;
    const { x, y } = getCanvasCoords(e);

    const newAnn: Annotation = {
      id: Math.random().toString(36).substring(7),
      tool: activeTool,
      startX: startPosRef.current.x,
      startY: startPosRef.current.y,
      endX: x,
      endY: y,
      color: brushColor,
      size: brushSize,
      points: currentPointsRef.current,
    };

    setAnnotations((prev) => [...prev, newAnn]);
  };

  const handleUndo = () => {
    setAnnotations((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setAnnotations([]);
  };

  const handleCopyClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `screenshot-annotated-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const tools: { id: AnnotationTool; icon: React.ReactNode; label: string }[] =
    [
      { id: "arrow", icon: <ArrowUpRight className="h-4 w-4" />, label: "Arrow" },
      { id: "rectangle", icon: <Square className="h-4 w-4" />, label: "Box" },
      { id: "circle", icon: <Circle className="h-4 w-4" />, label: "Circle" },
      { id: "pen", icon: <Pencil className="h-4 w-4" />, label: "Freehand" },
      { id: "highlighter", icon: <Highlighter className="h-4 w-4" />, label: "Marker" },
      { id: "blur", icon: <EyeOff className="h-4 w-4" />, label: "Blur Info" },
      { id: "text", icon: <Type className="h-4 w-4" />, label: "Text Label" },
    ];

  return (
    <div className="space-y-6">
      {/* Upload or Capture initial prompt */}
      {!baseImage && (
        <div className="border-2 border-dashed rounded-2xl p-10 text-center transition-all border-muted-foreground/25 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
            <Camera className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-lg">Instant Screenshot & Annotation</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Take a live browser screenshot or upload any existing graphic to annotate with arrows, text callouts, and privacy blur boxes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={captureScreen}
              disabled={isCapturing}
              size="lg"
              className="rounded-xl gap-2 shadow-xs"
            >
              <Camera className="h-5 w-5" />
              {isCapturing ? "Awaiting Screen Selection..." : "Capture Screen / Window"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl gap-2 shadow-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-5 w-5" />
              Upload Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleLoadImage(e.target.files[0])}
            />
          </div>
        </div>
      )}

      {/* Editor & Studio */}
      {baseImage && (
        <div className="space-y-4">
          {/* Top action bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 bg-card border rounded-2xl shadow-xs">
            {/* Tool Selection */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {tools.map((t) => (
                <Button
                  key={t.id}
                  size="sm"
                  variant={activeTool === t.id ? "default" : "outline"}
                  className="h-8 rounded-xl text-xs gap-1.5"
                  onClick={() => setActiveTool(t.id)}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </Button>
              ))}
            </div>

            {/* Right actions: Undo, Clear, Copy, Download, New */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl text-xs"
                onClick={handleUndo}
                disabled={annotations.length === 0}
                title="Undo last annotation"
              >
                <Undo2 className="h-3.5 w-3.5 mr-1" /> Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl text-xs"
                onClick={handleClear}
                disabled={annotations.length === 0}
                title="Clear all annotations"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl text-xs"
                onClick={handleCopyClipboard}
              >
                {copied ? <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                size="sm"
                className="h-8 rounded-xl text-xs"
                onClick={handleDownload}
              >
                <Download className="h-3.5 w-3.5 mr-1" /> Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-xl text-xs text-muted-foreground"
                onClick={() => setBaseImage(null)}
              >
                New
              </Button>
            </div>
          </div>

          {/* Sub toolbar: Colors, Stroke size, Text input if text tool active */}
          <div className="flex items-center justify-between flex-wrap gap-4 p-3 bg-muted/40 border rounded-xl text-xs">
            {/* Color swatches */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Color:</span>
              <div className="flex items-center gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    className={`h-5 w-5 rounded-full border border-black/20 transition-transform ${
                      brushColor === c ? "scale-125 ring-2 ring-primary ring-offset-1" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Thickness */}
            <div className="flex items-center gap-2 min-w-[160px]">
              <span className="text-muted-foreground font-medium">Size:</span>
              <Slider
                value={[brushSize]}
                min={2}
                max={16}
                step={1}
                onValueChange={(v) => setBrushSize(Array.isArray(v) ? v[0] : (v as number))}
                className="w-28"
              />
              <span className="text-[11px] text-muted-foreground">{brushSize}px</span>
            </div>

            {/* Text input if text tool active */}
            {activeTool === "text" && (
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <span className="text-muted-foreground font-medium">Text:</span>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Click on image to place..."
                  className="h-7 text-xs px-2 rounded-lg border bg-background flex-1"
                />
              </div>
            )}

            <div className="text-[11px] text-muted-foreground">
              {activeTool === "blur"
                ? "Drag a box over passwords or private info to pixelate"
                : activeTool === "text"
                ? "Click anywhere on image to stamp text"
                : "Click and drag to draw on canvas"}
            </div>
          </div>

          {/* Interactive Drawing Canvas */}
          <div className="relative border rounded-2xl overflow-hidden bg-dot-pattern flex items-center justify-center p-4 min-h-[460px] max-h-[720px] shadow-xs">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="max-h-[660px] w-auto max-w-full object-contain rounded-lg shadow-md cursor-crosshair"
            />
          </div>
        </div>
      )}
    </div>
  );
}