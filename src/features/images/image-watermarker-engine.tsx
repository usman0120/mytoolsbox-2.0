"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  Type,
  Image as ImageIcon,
  RotateCw,
  Layers,
  Sparkles,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  watermarkImage,
  WatermarkPosition,
  WatermarkOptions,
} from "@/features/images/image-watermarker";

const POSITIONS: { value: WatermarkPosition; label: string; icon: string }[] = [
  { value: "topLeft", label: "Top Left", icon: "↖" },
  { value: "topCenter", label: "Top Center", icon: "↑" },
  { value: "topRight", label: "Top Right", icon: "↗" },
  { value: "centerLeft", label: "Center Left", icon: "←" },
  { value: "center", label: "Center", icon: "•" },
  { value: "centerRight", label: "Center Right", icon: "→" },
  { value: "bottomLeft", label: "Bottom Left", icon: "↙" },
  { value: "bottomCenter", label: "Bottom Center", icon: "↓" },
  { value: "bottomRight", label: "Bottom Right", icon: "↘" },
];

const FONTS = [
  { label: "Sans-Serif (Modern)", value: "sans-serif" },
  { label: "Inter / Clean", value: "Inter, system-ui, sans-serif" },
  { label: "Impact (Bold Headline)", value: "Impact, sans-serif" },
  { label: "Serif (Editorial)", value: "Georgia, serif" },
  { label: "Monospace (Code)", value: "Courier New, monospace" },
];

export function ImageWatermarkerEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  // Settings
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [text, setText] = useState("© MyToolbox");
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [fontSize, setFontSize] = useState(48);
  const [isBold, setIsBold] = useState(true);
  const [textColor, setTextColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(70);
  const [rotation, setRotation] = useState(-25);
  const [position, setPosition] = useState<WatermarkPosition>("bottomRight");
  const [repeat, setRepeat] = useState(false);
  const [repeatSpacing, setRepeatSpacing] = useState(160);
  const [logoScale, setLogoScale] = useState(25); // 5% to 80%
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("png");

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState("watermarked.png");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Load Base Image
  const handleLoadBaseFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setProcessedUrl(null);
    setStatusMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setBaseImage(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  };

  // Load Logo Image
  const handleLoadLogoFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setLogoFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setLogoImage(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  };

  // Draw real-time preview canvas
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

    const getAnchorPosition = (itemWidth: number, itemHeight: number, padding = 40) => {
      let x = 0;
      let y = 0;
      switch (position) {
        case "topLeft":
          x = padding + itemWidth / 2;
          y = padding + itemHeight / 2;
          break;
        case "topCenter":
          x = canvas.width / 2;
          y = padding + itemHeight / 2;
          break;
        case "topRight":
          x = canvas.width - padding - itemWidth / 2;
          y = padding + itemHeight / 2;
          break;
        case "centerLeft":
          x = padding + itemWidth / 2;
          y = canvas.height / 2;
          break;
        case "centerRight":
          x = canvas.width - padding - itemWidth / 2;
          y = canvas.height / 2;
          break;
        case "bottomLeft":
          x = padding + itemWidth / 2;
          y = canvas.height - padding - itemHeight / 2;
          break;
        case "bottomCenter":
          x = canvas.width / 2;
          y = canvas.height - padding - itemHeight / 2;
          break;
        case "bottomRight":
          x = canvas.width - padding - itemWidth / 2;
          y = canvas.height - padding - itemHeight / 2;
          break;
        case "center":
        default:
          x = canvas.width / 2;
          y = canvas.height / 2;
          break;
      }
      return { x, y };
    };

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity / 100));

    if (watermarkType === "text" && text.trim()) {
      ctx.fillStyle = textColor;
      ctx.font = `${isBold ? "bold " : ""}${fontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize;

      if (repeat) {
        const rotRad = (rotation * Math.PI) / 180;
        const stepX = Math.max(textWidth + 60, repeatSpacing);
        const stepY = Math.max(textHeight + 60, repeatSpacing * 0.7);

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotRad);

        const diag = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
        for (let y = -diag; y < diag; y += stepY) {
          for (let x = -diag; x < diag; x += stepX) {
            ctx.fillText(text, x, y);
          }
        }
      } else {
        const { x, y } = getAnchorPosition(textWidth, textHeight, Math.max(20, fontSize * 0.5));
        ctx.translate(x, y);
        if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(text, 0, 0);
      }
    } else if (watermarkType === "image" && logoImage) {
      const baseWidth = canvas.width;
      const targetWidth = Math.max(24, Math.round(baseWidth * (logoScale / 100)));
      const logoAspect = (logoImage.naturalHeight || logoImage.height) / (logoImage.naturalWidth || logoImage.width);
      const targetHeight = Math.round(targetWidth * logoAspect);

      if (repeat) {
        const rotRad = (rotation * Math.PI) / 180;
        const stepX = targetWidth + repeatSpacing;
        const stepY = targetHeight + repeatSpacing;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotRad);

        const diag = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
        for (let y = -diag; y < diag; y += stepY) {
          for (let x = -diag; x < diag; x += stepX) {
            ctx.drawImage(logoImage, x - targetWidth / 2, y - targetHeight / 2, targetWidth, targetHeight);
          }
        }
      } else {
        const { x, y } = getAnchorPosition(targetWidth, targetHeight, 30);
        ctx.translate(x, y);
        if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(logoImage, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
      }
    }

    ctx.restore();
  }, [
    baseImage,
    watermarkType,
    text,
    fontFamily,
    fontSize,
    isBold,
    textColor,
    opacity,
    rotation,
    position,
    repeat,
    repeatSpacing,
    logoImage,
    logoScale,
  ]);

  // Redraw preview whenever any visual state changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleApplyWatermark = async () => {
    if (!file) return;
    setIsProcessing(true);
    setStatusMessage(null);

    const opts: WatermarkOptions = {
      type: watermarkType,
      text,
      fontSize,
      fontFamily,
      color: textColor,
      isBold,
      logoSource: logoFile || undefined,
      logoScale: logoScale / 100,
      opacity: opacity / 100,
      position,
      rotation,
      repeat,
      repeatSpacing,
      format: exportFormat,
      quality: 0.95,
    };

    const res = await watermarkImage(file, opts);
    setIsProcessing(false);

    if (res.status === "success" && res.outputUrl) {
      setProcessedUrl(res.outputUrl);
      const data = res.data as { downloadName?: string } | undefined;
      setDownloadFilename(data?.downloadName || `watermarked.${exportFormat === "jpeg" ? "jpg" : exportFormat}`);
      setStatusMessage(res.message || "Watermark applied successfully!");
    } else {
      setStatusMessage(res.error || "Failed to watermark image");
    }
  };

  const handleDownload = () => {
    if (!processedUrl && canvasRef.current) {
      // Export directly from live canvas
      const mime = exportFormat === "png" ? "image/png" : exportFormat === "webp" ? "image/webp" : "image/jpeg";
      const dataUrl = canvasRef.current.toDataURL(mime, 0.95);
      const a = document.createElement("a");
      a.href = dataUrl;
      const baseName = file?.name.replace(/\.[^.]+$/, "") || "watermarked";
      a.download = `${baseName}_watermarked.${exportFormat === "jpeg" ? "jpg" : exportFormat}`;
      a.click();
      return;
    }

    if (processedUrl) {
      const a = document.createElement("a");
      a.href = processedUrl;
      a.download = downloadFilename;
      a.click();
    }
  };

  const handleReset = () => {
    setFile(null);
    setBaseImage(null);
    setLogoFile(null);
    setLogoImage(null);
    setProcessedUrl(null);
    setStatusMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      {!file && (
        <div
          className="border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 border-muted-foreground/25"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) handleLoadBaseFile(e.dataTransfer.files[0]);
          }}
        >
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Upload className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Upload Photo to Watermark</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            PNG, JPG, WebP, or AVIF. Full resolution and lossless processing.
          </p>
          <Button variant="outline" className="rounded-xl shadow-xs">
            Browse Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleLoadBaseFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Editor & Controls */}
      {file && (
        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          {/* Controls Panel */}
          <div className="min-w-0 space-y-4 xl:col-start-2 xl:row-start-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Watermark Type</h4>
                  <p className="text-xs text-muted-foreground">Select text stamp or brand logo</p>
                </div>
                <div className="flex gap-1 p-1 bg-muted rounded-xl">
                  <Button
                    size="sm"
                    variant={watermarkType === "text" ? "default" : "ghost"}
                    className="h-8 rounded-lg text-xs"
                    onClick={() => setWatermarkType("text")}
                  >
                    <Type className="h-3.5 w-3.5 mr-1" /> Text
                  </Button>
                  <Button
                    size="sm"
                    variant={watermarkType === "image" ? "default" : "ghost"}
                    className="h-8 rounded-lg text-xs"
                    onClick={() => setWatermarkType("image")}
                  >
                    <ImageIcon className="h-3.5 w-3.5 mr-1" /> Logo
                  </Button>
                </div>
              </div>

              {/* Text Watermark Controls */}
              {watermarkType === "text" && (
                <div className="space-y-3.5 pt-2 border-t">
                  <div>
                    <Label className="text-xs font-medium">Watermark Text</Label>
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="e.g. © 2026 YourBrand.com"
                      className="mt-1 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium">Font Family</Label>
                      <select
                        aria-label="Watermark Font Family"
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
                      <Label className="text-xs font-medium">Color</Label>
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
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Font Size: {fontSize}px</Label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="bold-toggle" className="text-xs text-muted-foreground">
                        Bold
                      </Label>
                      <Switch id="bold-toggle" checked={isBold} onCheckedChange={setIsBold} />
                    </div>
                  </div>
                  <Slider
                    value={[fontSize]}
                    min={14}
                    max={180}
                    step={2}
                    onValueChange={(val) => setFontSize(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>
              )}

              {/* Logo Watermark Controls */}
              {watermarkType === "image" && (
                <div className="space-y-3.5 pt-2 border-t">
                  <div>
                    <Label className="text-xs font-medium">Logo / Brand Image</Label>
                    <div
                      className="mt-1.5 border-2 border-dashed rounded-xl p-3 text-center cursor-pointer hover:border-primary/40 transition-colors"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {logoImage ? (
                        <div className="flex items-center justify-center gap-3">
                          <img
                            src={logoImage.src}
                            alt="Logo preview"
                            className="h-10 max-w-[120px] object-contain rounded"
                          />
                          <span className="text-xs text-muted-foreground font-medium">
                            Change Logo
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Click to upload transparent PNG/SVG logo</p>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/svg+xml,image/webp,image/jpeg"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleLoadLogoFile(e.target.files[0])}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-xs font-medium">Logo Size</Label>
                      <span className="text-xs text-muted-foreground">{logoScale}% of width</span>
                    </div>
                    <Slider
                      value={[logoScale]}
                      min={5}
                      max={80}
                      step={1}
                      onValueChange={(val) => setLogoScale(Array.isArray(val) ? val[0] : (val as number))}
                    />
                  </div>
                </div>
              )}

              {/* Position & Anchor Grid */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Grid className="h-3.5 w-3.5" /> Placement Anchor
                  </Label>
                  <span className="text-[11px] text-muted-foreground capitalize">
                    {position}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => setPosition(pos.value)}
                      title={pos.label}
                      className={`h-9 flex items-center justify-center rounded-lg border text-sm font-semibold transition-all ${
                        position === pos.value
                          ? "border-primary bg-primary text-primary-foreground shadow-xs"
                          : "border-border/60 hover:border-primary/40 bg-background"
                      }`}
                    >
                      {pos.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity & Rotation */}
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium">Opacity</Label>
                    <span className="text-xs text-muted-foreground">{opacity}%</span>
                  </div>
                  <Slider
                    value={[opacity]}
                    min={5}
                    max={100}
                    step={1}
                    onValueChange={(val) => setOpacity(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <RotateCw className="h-3 w-3" /> Angle Rotation
                    </Label>
                    <span className="text-xs text-muted-foreground">{rotation}°</span>
                  </div>
                  <Slider
                    value={[rotation]}
                    min={-180}
                    max={180}
                    step={5}
                    onValueChange={(val) => setRotation(Array.isArray(val) ? val[0] : (val as number))}
                  />
                  <div className="flex gap-1.5 mt-2 justify-end">
                    {[-45, -30, 0, 30, 45].map((ang) => (
                      <Button
                        key={ang}
                        size="sm"
                        variant={rotation === ang ? "default" : "outline"}
                        className="h-6 text-[10px] px-2 rounded-md"
                        onClick={() => setRotation(ang)}
                      >
                        {ang}°
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tiling / Repeat */}
                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="tiling-switch" className="text-xs font-medium flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" /> Full Image Pattern Tiling
                    </Label>
                    <p className="text-[11px] text-muted-foreground">Repeat stamp repeatedly across canvas</p>
                  </div>
                  <Switch id="tiling-switch" checked={repeat} onCheckedChange={setRepeat} />
                </div>

                {repeat && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-xs font-medium">Pattern Spacing</Label>
                      <span className="text-xs text-muted-foreground">{repeatSpacing}px</span>
                    </div>
                    <Slider
                      value={[repeatSpacing]}
                      min={60}
                      max={400}
                      step={10}
                      onValueChange={(val) => setRepeatSpacing(Array.isArray(val) ? val[0] : (val as number))}
                    />
                  </div>
                )}
              </div>

              {/* Export settings & Actions */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Export Format</Label>
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
                    onClick={handleApplyWatermark}
                    disabled={isProcessing || (watermarkType === "image" && !logoImage)}
                    className="flex-1 rounded-xl gap-2 font-medium"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isProcessing ? "Applying..." : "Generate Final High-Res"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="rounded-xl gap-1.5"
                    title="Export currently previewed image"
                  >
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </div>

            {statusMessage && (
              <div className="p-3 bg-muted rounded-xl text-xs flex items-center justify-between">
                <span>{statusMessage}</span>
                {processedUrl && (
                  <Button size="sm" variant="ghost" onClick={handleDownload} className="h-6 text-xs text-primary">
                    Save File
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Canvas Live Preview Panel */}
          <div className="order-first min-w-0 flex flex-col space-y-3 xl:col-start-1 xl:row-start-1">
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

            <div className="relative border rounded-lg overflow-hidden bg-dot-pattern flex items-center justify-center p-3 min-h-64 sm:min-h-[460px] max-h-[640px]">
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