"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  MessageSquareText,
  Smile,
  Sliders,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  addTextOverlay,
  TextPosition,
  TextOverlayOptions,
} from "@/features/images/image-text-overlay";

const FONTS = [
  { label: "Impact (Classic Meme)", value: "Impact, sans-serif" },
  { label: "Inter (Modern UI)", value: "Inter, system-ui, sans-serif" },
  { label: "Arial / Helvetica", value: "Arial, sans-serif" },
  { label: "Georgia (Serif)", value: "Georgia, serif" },
  { label: "Courier (Monospace)", value: "Courier New, monospace" },
];

const POSITIONS: { value: TextPosition; label: string }[] = [
  { value: "top", label: "Top Center" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom Center" },
  { value: "topLeft", label: "Top Left" },
  { value: "topRight", label: "Top Right" },
  { value: "bottomLeft", label: "Bottom Left" },
  { value: "bottomRight", label: "Bottom Right" },
];

export function ImageTextOverlayEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);

  // Mode: "meme" | "banner"
  const [mode, setMode] = useState<"meme" | "banner">("meme");

  // Meme options
  const [topText, setTopText] = useState("WHEN YOUR CODE");
  const [bottomText, setBottomText] = useState("WORKS ON THE FIRST TRY");
  const [isUppercase, setIsUppercase] = useState(true);

  // Banner / Badge options
  const [bannerText, setBannerText] = useState("Breaking News");
  const [position, setPosition] = useState<TextPosition>("bottom");
  const [bgColor, setBgColor] = useState("#000000");
  const [bgOpacity, setBgOpacity] = useState(70);
  const [borderRadius, setBorderRadius] = useState(12);
  const [padding, setPadding] = useState(18);

  // Common styling
  const [fontFamily, setFontFamily] = useState("Impact, sans-serif");
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("png");

  // Processing & Download
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setDownloadUrl(null);
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

    // Draw base
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0);

    if (mode === "meme") {
      const drawMemeText = (t: string, yPos: "top" | "bottom") => {
        if (!t.trim()) return;
        const displayStr = isUppercase ? t.toUpperCase() : t;
        const lines = displayStr.split("\n");
        ctx.save();
        ctx.font = `900 ${fontSize}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = yPos === "top" ? "top" : "bottom";
        ctx.fillStyle = textColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * 2;
        ctx.lineJoin = "round";

        const lineHeight = fontSize * 1.15;
        const startY = yPos === "top" ? 25 : canvas.height - 25 - (lines.length - 1) * lineHeight;

        lines.forEach((line, idx) => {
          const currentY = startY + idx * lineHeight;
          if (strokeWidth > 0) {
            ctx.strokeText(line, canvas.width / 2, currentY);
          }
          ctx.fillText(line, canvas.width / 2, currentY);
        });
        ctx.restore();
      };

      drawMemeText(topText, "top");
      drawMemeText(bottomText, "bottom");
    } else {
      if (!bannerText.trim()) return;
      ctx.save();
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      const metrics = ctx.measureText(bannerText);
      const textWidth = metrics.width;
      const textHeight = fontSize;
      const boxWidth = textWidth + padding * 2;
      const boxHeight = textHeight + padding * 2;

      let x = 24;
      let y = 24;
      const margin = 28;

      switch (position) {
        case "top":
          x = (canvas.width - boxWidth) / 2;
          y = margin;
          break;
        case "topLeft":
          x = margin;
          y = margin;
          break;
        case "topRight":
          x = canvas.width - boxWidth - margin;
          y = margin;
          break;
        case "bottom":
          x = (canvas.width - boxWidth) / 2;
          y = canvas.height - boxHeight - margin;
          break;
        case "bottomLeft":
          x = margin;
          y = canvas.height - boxHeight - margin;
          break;
        case "bottomRight":
          x = canvas.width - boxWidth - margin;
          y = canvas.height - boxHeight - margin;
          break;
        case "center":
          x = (canvas.width - boxWidth) / 2;
          y = (canvas.height - boxHeight) / 2;
          break;
      }

      // Draw background pill
      if (bgOpacity > 0) {
        const hex = bgColor.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16) || 0;
        const g = parseInt(hex.substring(2, 4), 16) || 0;
        const b = parseInt(hex.substring(4, 6), 16) || 0;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${bgOpacity / 100})`;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, boxWidth, boxHeight, borderRadius);
        } else {
          ctx.rect(x, y, boxWidth, boxHeight);
        }
        ctx.fill();
      }

      if (strokeWidth > 0) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = "round";
        ctx.strokeText(bannerText, x + padding, y + padding + fontSize * 0.85);
      }

      ctx.fillStyle = textColor;
      ctx.fillText(bannerText, x + padding, y + padding + fontSize * 0.85);
      ctx.restore();
    }
  }, [
    baseImage,
    mode,
    topText,
    bottomText,
    isUppercase,
    bannerText,
    position,
    bgColor,
    bgOpacity,
    borderRadius,
    padding,
    fontFamily,
    fontSize,
    textColor,
    strokeColor,
    strokeWidth,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleApplyFinal = async () => {
    if (!file) return;
    setIsProcessing(true);

    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const rgbaBg = bgOpacity > 0 ? `rgba(${r}, ${g}, ${b}, ${bgOpacity / 100})` : "transparent";

    const opts: TextOverlayOptions = {
      mode,
      topText,
      bottomText,
      isUppercase,
      text: bannerText,
      fontSize,
      fontFamily,
      color: textColor,
      backgroundColor: rgbaBg,
      position,
      padding,
      borderRadius,
      strokeColor,
      strokeWidth,
      format: exportFormat,
    };

    const res = await addTextOverlay(file, opts);
    setIsProcessing(false);

    if (res.status === "success" && res.outputUrl) {
      setDownloadUrl(res.outputUrl);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      const baseName = file?.name.replace(/\.[^.]+$/, "") || "text_overlay";
      a.download = `${baseName}_overlay.${exportFormat === "jpeg" ? "jpg" : exportFormat}`;
      a.click();
      return;
    }

    if (canvasRef.current) {
      const mime = exportFormat === "png" ? "image/png" : exportFormat === "webp" ? "image/webp" : "image/jpeg";
      const dataUrl = canvasRef.current.toDataURL(mime, 0.95);
      const a = document.createElement("a");
      a.href = dataUrl;
      const baseName = file?.name.replace(/\.[^.]+$/, "") || "text_overlay";
      a.download = `${baseName}_overlay.${exportFormat === "jpeg" ? "jpg" : exportFormat}`;
      a.click();
    }
  };

  const handleReset = () => {
    setFile(null);
    setBaseImage(null);
    setDownloadUrl(null);
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
            <Upload className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Upload Photo for Text Overlay</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Create memes, YouTube video thumbnails, and social banners with custom typography.
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Overlay Mode</h4>
                  <p className="text-xs text-muted-foreground">Select style preset</p>
                </div>
                <div className="flex gap-1 p-1 bg-muted rounded-xl">
                  <Button
                    size="sm"
                    variant={mode === "meme" ? "default" : "ghost"}
                    className="h-8 rounded-lg text-xs"
                    onClick={() => {
                      setMode("meme");
                      setFontFamily("Impact, sans-serif");
                    }}
                  >
                    <Smile className="h-3.5 w-3.5 mr-1" /> Meme
                  </Button>
                  <Button
                    size="sm"
                    variant={mode === "banner" ? "default" : "ghost"}
                    className="h-8 rounded-lg text-xs"
                    onClick={() => {
                      setMode("banner");
                      setFontFamily("Inter, system-ui, sans-serif");
                    }}
                  >
                    <MessageSquareText className="h-3.5 w-3.5 mr-1" /> Badge / Banner
                  </Button>
                </div>
              </div>

              {/* Meme Mode Inputs */}
              {mode === "meme" && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <Label className="text-xs font-medium">Top Caption</Label>
                    <Input
                      value={topText}
                      onChange={(e) => setTopText(e.target.value)}
                      placeholder="TOP TEXT..."
                      className="mt-1 rounded-xl uppercase"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Bottom Caption</Label>
                    <Input
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value)}
                      placeholder="BOTTOM TEXT..."
                      className="mt-1 rounded-xl uppercase"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Label htmlFor="uppercase-toggle" className="text-xs font-medium">
                      All-Caps Uppercase
                    </Label>
                    <Switch id="uppercase-toggle" checked={isUppercase} onCheckedChange={setIsUppercase} />
                  </div>
                </div>
              )}

              {/* Banner Mode Inputs */}
              {mode === "banner" && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <Label className="text-xs font-medium">Banner Text</Label>
                    <Input
                      value={bannerText}
                      onChange={(e) => setBannerText(e.target.value)}
                      placeholder="e.g. Breaking Announcement"
                      className="mt-1 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Position</Label>
                    <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                      {POSITIONS.map((p) => (
                        <Button
                          key={p.value}
                          size="sm"
                          variant={position === p.value ? "default" : "outline"}
                          className="h-7 text-[11px] rounded-lg"
                          onClick={() => setPosition(p.value)}
                        >
                          {p.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <Label className="text-xs font-medium">Background Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="h-8 w-10 rounded-lg cursor-pointer border p-0.5 bg-background"
                        />
                        <span className="text-xs text-muted-foreground uppercase">{bgColor}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-xs font-medium">BG Opacity</Label>
                        <span className="text-xs text-muted-foreground">{bgOpacity}%</span>
                      </div>
                      <Slider
                        value={[bgOpacity]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={(val) => setBgOpacity(Array.isArray(val) ? val[0] : (val as number))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-xs font-medium">Padding</Label>
                        <span className="text-xs text-muted-foreground">{padding}px</span>
                      </div>
                      <Slider
                        value={[padding]}
                        min={4}
                        max={40}
                        step={2}
                        onValueChange={(val) => setPadding(Array.isArray(val) ? val[0] : (val as number))}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-xs font-medium">Corner Radius</Label>
                        <span className="text-xs text-muted-foreground">{borderRadius}px</span>
                      </div>
                      <Slider
                        value={[borderRadius]}
                        min={0}
                        max={30}
                        step={2}
                        onValueChange={(val) => setBorderRadius(Array.isArray(val) ? val[0] : (val as number))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Shared Typography Controls */}
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Font Family</Label>
                    <select
                      aria-label="Font Family Selection"
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="mt-1 w-full text-xs rounded-xl border bg-background px-2.5 py-2"
                    >
                      {FONTS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-xs font-medium">Size: {fontSize}px</Label>
                    </div>
                    <Slider
                      value={[fontSize]}
                      min={16}
                      max={120}
                      step={2}
                      onValueChange={(val) => setFontSize(Array.isArray(val) ? val[0] : (val as number))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Text Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-8 w-10 rounded-lg cursor-pointer border p-0.5 bg-background"
                      />
                      <span className="text-xs text-muted-foreground uppercase">{textColor}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-xs font-medium">Stroke Outline</Label>
                      <span className="text-xs text-muted-foreground">{strokeWidth}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="h-8 w-10 rounded-lg cursor-pointer border p-0.5 bg-background"
                      />
                      <Slider
                        value={[strokeWidth]}
                        min={0}
                        max={10}
                        step={1}
                        onValueChange={(val) => setStrokeWidth(Array.isArray(val) ? val[0] : (val as number))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & Export */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Format</Label>
                  <div className="flex gap-1">
                    {(["png", "jpeg", "webp"] as const).map((fmt) => (
                      <Button
                        key={fmt}
                        size="sm"
                        variant={exportFormat === fmt ? "default" : "outline"}
                        className="h-7 text-xs px-2.5 rounded-lg uppercase"
                        onClick={() => setExportFormat(fmt)}
                      >
                        {fmt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleApplyFinal}
                    disabled={isProcessing}
                    className="flex-1 rounded-xl gap-2 font-medium"
                  >
                    <Type className="h-4 w-4" />
                    {isProcessing ? "Processing..." : "Generate Final"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="rounded-xl gap-1.5"
                  >
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Live Preview */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Live Interactive Canvas Preview
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {baseImage ? `${baseImage.naturalWidth} × ${baseImage.naturalHeight} px` : ""}
                </span>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
              </div>
            </div>

            <div className="relative border rounded-2xl overflow-hidden bg-dot-pattern flex items-center justify-center p-4 min-h-[460px] max-h-[640px] shadow-xs">
              <canvas
                ref={canvasRef}
                className="max-h-[580px] w-auto max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}