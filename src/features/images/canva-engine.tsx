"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, ImageIcon, Trash2, Type, Square, Circle, Palette, Layout, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const TEMPLATES = [
  { name: "Instagram Post", width: 1080, height: 1080, icon: "square" },
  { name: "Instagram Story", width: 1080, height: 1920, icon: "story" },
  { name: "Facebook Post", width: 1200, height: 630, icon: "landscape" },
  { name: "Twitter Post", width: 1200, height: 675, icon: "landscape" },
  { name: "LinkedIn Post", width: 1200, height: 627, icon: "landscape" },
  { name: "Presentation (16:9)", width: 1920, height: 1080, icon: "presentation" },
  { name: "Poster (A4)", width: 2480, height: 3508, icon: "portrait" },
  { name: "YouTube Thumbnail", width: 1280, height: 720, icon: "landscape" },
];

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  "#F8C471", "#82E0AA", "#F1948A", "#85929E", "#AED6F1",
  "#000000", "#FFFFFF", "#333333", "#666666", "#999999",
];

export function CanvaEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [fontSize, setFontSize] = useState(48);
  const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">("center");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const renderCanvas = useCallback(() => {
    if (!preview || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const template = TEMPLATES.find((t) => t.name === selectedTemplate);
    const width = template?.width || 1080;
    const height = template?.height || 1080;

    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, width, height);

    // Draw image centered
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(width / img.width, height / img.height) * 0.85;
      const imgW = img.width * scale;
      const imgH = img.height * scale;
      const x = (width - imgW) / 2;
      const y = (height - imgH) / 2;
      ctx.drawImage(img, x, y, imgW, imgH);

      // Draw text overlay
      if (textOverlay) {
        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 3;

        let textY: number;
        if (textPosition === "top") textY = fontSize + 40;
        else if (textPosition === "bottom") textY = height - 40;
        else textY = height / 2;

        // Word wrap
        const words = textOverlay.split(" ");
        const lines: string[] = [];
        let currentLine = "";
        const maxWidth = width * 0.8;

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        const lineHeight = fontSize * 1.2;
        const startY = textY - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
          ctx.strokeText(line, width / 2, startY + i * lineHeight);
          ctx.fillText(line, width / 2, startY + i * lineHeight);
        });
      }
    };
    img.src = preview;
  }, [preview, selectedTemplate, textOverlay, textColor, fontSize, textPosition]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    renderCanvas();
    setTimeout(() => {
      if (!canvasRef.current) return;
      const link = document.createElement("a");
      link.download = `canva-design-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }, 100);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setSelectedTemplate(null);
    setTextOverlay("");
  };

  return (
    <div className="space-y-4">
      {!file && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Palette className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop an image to design</p>
          <p className="text-sm text-muted-foreground">JPG, PNG, or WebP. Add text, choose a template, and export.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </div>
      )}

      {file && preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-50">{file.name}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <Trash2 className="h-4 w-4 mr-1" /> Remove
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" /> Export PNG
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Preview */}
            <div className="lg:col-span-2 bg-muted/30 rounded-lg p-2 flex items-center justify-center min-h-75">
              <img
                src={preview}
                alt="Design preview"
                className="max-w-full max-h-100 object-contain rounded"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Layout className="h-4 w-4" /> Design Controls
              </h3>

              {/* Templates */}
              <div className="space-y-2">
                <Label className="text-xs">Template Size</Label>
                <div className="grid grid-cols-2 gap-1">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setSelectedTemplate(t.name)}
                      className={`text-xs p-2 rounded border text-left transition-colors ${
                        selectedTemplate === t.name
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted hover:border-muted-foreground"
                      }`}
                    >
                      <div className="font-medium truncate">{t.name}</div>
                      <div className="text-muted-foreground">{t.width}×{t.height}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text overlay */}
              <div className="space-y-2">
                <Label className="text-xs">Text Overlay</Label>
                <Input
                  value={textOverlay}
                  onChange={(e) => setTextOverlay(e.target.value)}
                  placeholder="Add text to your design..."
                  className="text-sm"
                />
              </div>

              {/* Text position */}
              <div className="space-y-1.5">
                <Label className="text-xs">Text Position</Label>
                <div className="flex gap-1">
                  {(["top", "center", "bottom"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setTextPosition(pos)}
                      className={`flex-1 text-xs p-1.5 rounded border capitalize transition-colors ${
                        textPosition === pos
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted hover:border-muted-foreground"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div className="space-y-1.5">
                <Label className="text-xs">Font Size: {fontSize}px</Label>
                <Input
                  type="range"
                  min={16}
                  max={120}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="h-2"
                />
              </div>

              {/* Color picker */}
              <div className="space-y-1.5">
                <Label className="text-xs">Text Color</Label>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className="w-6 h-6 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: color,
                        borderColor: textColor === color ? "#3b82f6" : "transparent",
                        transform: textColor === color ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}