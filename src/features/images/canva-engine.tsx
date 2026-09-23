"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload, Download, ImageIcon, Trash2, Type, Layout, Palette,
  Sparkles, RefreshCw, ZoomIn, Check, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  DESIGN_TEMPLATES,
  PRESET_GRADIENTS,
  calculateFittedDimensions,
  type CanvasTemplate,
} from "@/features/images/canva-design";

const COLOR_SWATCHES = [
  "#FFFFFF", "#000000", "#1E293B", "#3B82F6", "#10B981",
  "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4",
  "#F97316", "#84CC16", "#6366F1", "#14B8A6", "#64748B",
];

const FONTS = [
  { id: "sans", name: "Modern Sans", value: "system-ui, -apple-system, sans-serif" },
  { id: "serif", name: "Editorial Serif", value: "Georgia, Cambria, serif" },
  { id: "mono", name: "Code Mono", value: "ui-monospace, monospace" },
  { id: "impact", name: "Bold Impact", value: "Impact, Charcoal, sans-serif" },
];

export function CanvaEngine() {
  const [template, setTemplate] = useState<CanvasTemplate>(DESIGN_TEMPLATES[0]);
  const [templateCategory, setTemplateCategory] = useState<string>("all");
  const [bgMode, setBgMode] = useState<"gradient" | "color" | "image">("gradient");
  const [selectedGradient, setSelectedGradient] = useState(PRESET_GRADIENTS[0]);
  const [solidBgColor, setSolidBgColor] = useState("#0f172a");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  // Text layer settings
  const [headline, setHeadline] = useState("Craft Stunning Visuals");
  const [subheading, setSubheading] = useState("Designed effortlessly with MyToolsBox Studio");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [fontFamily, setFontFamily] = useState(FONTS[0].value);
  const [fontSize, setFontSize] = useState(64);
  const [textAlign, setTextAlign] = useState<"center" | "left" | "right">("center");
  const [hasShadow, setHasShadow] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setBgMode("image");
      toast.success("Image loaded as canvas background!");
    };
    reader.readAsDataURL(file);
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = template.width;
    canvas.height = template.height;

    // 1. Draw Background
    if (bgMode === "color") {
      ctx.fillStyle = solidBgColor;
      ctx.fillRect(0, 0, template.width, template.height);
      renderOverlayText(ctx);
    } else if (bgMode === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, template.width, template.height);
      grad.addColorStop(0, selectedGradient.from);
      grad.addColorStop(1, selectedGradient.to);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, template.width, template.height);
      renderOverlayText(ctx);
    } else if (bgMode === "image" && imageSrc) {
      const img = new Image();
      img.onload = () => {
        // Draw image cover
        const scale = Math.max(template.width / img.width, template.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (template.width - w) / 2;
        const y = (template.height - h) / 2;
        ctx.drawImage(img, x, y, w, h);

        // Dark tint overlay for text legibility
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(0, 0, template.width, template.height);

        renderOverlayText(ctx);
      };
      img.src = imageSrc;
    } else {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, template.width, template.height);
      renderOverlayText(ctx);
    }

    function renderOverlayText(c: CanvasRenderingContext2D) {
      if (!headline && !subheading) return;

      c.fillStyle = textColor;
      c.textAlign = textAlign;

      let anchorX = template.width / 2;
      if (textAlign === "left") anchorX = template.width * 0.1;
      if (textAlign === "right") anchorX = template.width * 0.9;

      if (hasShadow) {
        c.shadowColor = "rgba(0, 0, 0, 0.75)";
        c.shadowBlur = 16;
        c.shadowOffsetX = 3;
        c.shadowOffsetY = 4;
      } else {
        c.shadowColor = "transparent";
      }

      // Headline
      if (headline) {
        c.font = `bold ${fontSize}px ${fontFamily}`;
        const maxTextWidth = template.width * 0.8;
        const words = headline.split(" ");
        const lines: string[] = [];
        let curr = "";

        for (const w of words) {
          const test = curr ? `${curr} ${w}` : w;
          if (c.measureText(test).width > maxTextWidth && curr) {
            lines.push(curr);
            curr = w;
          } else {
            curr = test;
          }
        }
        if (curr) lines.push(curr);

        const lineHeight = fontSize * 1.25;
        const startY = template.height * 0.45 - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, idx) => {
          c.fillText(line, anchorX, startY + idx * lineHeight);
        });

        // Subheading
        if (subheading) {
          const subSize = Math.max(18, Math.round(fontSize * 0.45));
          c.font = `normal ${subSize}px ${fontFamily}`;
          c.fillStyle = textColor;
          c.shadowBlur = hasShadow ? 8 : 0;
          c.fillText(subheading, anchorX, startY + lines.length * lineHeight + subSize * 0.8);
        }
      }
    }
  }, [template, bgMode, selectedGradient, solidBgColor, imageSrc, headline, subheading, textColor, fontFamily, fontSize, textAlign, hasShadow]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `design-${template.id}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success(`Design exported at full ${template.width}×${template.height}px resolution!`);
  };

  const filteredTemplates = DESIGN_TEMPLATES.filter((t) =>
    templateCategory === "all" ? true : t.category === templateCategory
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Template Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" /> Canva Design Studio
          </h2>
          <p className="text-xs text-muted-foreground">
            Current Canvas: {template.name} ({template.width}×{template.height}px)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => drawCanvas()} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Redraw
          </Button>
          <Button size="sm" onClick={handleDownload} className="gap-1 text-xs">
            <Download className="h-3.5 w-3.5" /> Export PNG
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Canvas Preview */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-muted/40 border rounded-xl p-4 flex items-center justify-center min-h-[420px] overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg border border-border/40"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>High-DPI Client Render</span>
            <span>{template.aspectRatio} Aspect Ratio</span>
          </div>
        </div>

        {/* Right Side: Controls Tabs */}
        <div className="lg:col-span-5 space-y-4">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
              <TabsTrigger value="background" className="text-xs">Background</TabsTrigger>
              <TabsTrigger value="typography" className="text-xs">Text & Style</TabsTrigger>
            </TabsList>

            {/* Tab 1: Templates */}
            <TabsContent value="templates" className="space-y-3 pt-3">
              <div className="flex gap-1 overflow-x-auto pb-1">
                {["all", "social", "presentation", "print"].map((cat) => (
                  <Button
                    key={cat}
                    variant={templateCategory === cat ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs capitalize shrink-0"
                    onClick={() => setTemplateCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredTemplates.map((t) => (
                  <Card
                    key={t.id}
                    onClick={() => setTemplate(t)}
                    className={`cursor-pointer transition-all hover:border-primary/60 ${
                      template.id === t.id ? "ring-2 ring-primary border-primary bg-primary/5" : ""
                    }`}
                  >
                    <CardContent className="p-3">
                      <p className="font-medium text-xs truncate">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.width} × {t.height}px</p>
                      <Badge variant="outline" className="text-[9px] mt-1.5 h-4 px-1">{t.aspectRatio}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab 2: Background */}
            <TabsContent value="background" className="space-y-4 pt-3">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={bgMode === "gradient" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setBgMode("gradient")}
                >
                  Gradient
                </Button>
                <Button
                  variant={bgMode === "color" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setBgMode("color")}
                >
                  Solid Color
                </Button>
                <Button
                  variant={bgMode === "image" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setBgMode("image")}
                >
                  Image
                </Button>
              </div>

              {bgMode === "gradient" && (
                <div className="space-y-2">
                  <Label className="text-xs">Select Gradient Preset</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_GRADIENTS.map((grad) => (
                      <button
                        key={grad.name}
                        onClick={() => setSelectedGradient(grad)}
                        className={`h-12 rounded-lg border p-1 text-left relative overflow-hidden transition-all ${
                          selectedGradient.name === grad.name ? "ring-2 ring-primary border-white" : ""
                        }`}
                        style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
                      >
                        <span className="absolute bottom-1 left-1.5 text-[9px] font-semibold text-white drop-shadow">
                          {grad.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {bgMode === "color" && (
                <div className="space-y-3">
                  <Label className="text-xs">Choose Background Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_SWATCHES.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSolidBgColor(color)}
                        className={`w-7 h-7 rounded-md border transition-all ${
                          solidBgColor === color ? "ring-2 ring-primary scale-110" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="color"
                      value={solidBgColor}
                      onChange={(e) => setSolidBgColor(e.target.value)}
                      className="w-10 h-8 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={solidBgColor}
                      onChange={(e) => setSolidBgColor(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {bgMode === "image" && (
                <div className="space-y-3">
                  <Label className="text-xs">Upload Background Photo</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs font-medium">{imageName || "Click to choose an image"}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG, or WebP</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                  {imageSrc && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs text-destructive gap-1"
                      onClick={() => { setImageSrc(null); setImageName(null); setBgMode("gradient"); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove Image
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Text & Style */}
            <TabsContent value="typography" className="space-y-3 pt-3">
              <div>
                <Label className="text-xs">Headline</Label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Main Title"
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Subheading</Label>
                <Input
                  value={subheading}
                  onChange={(e) => setSubheading(e.target.value)}
                  placeholder="Secondary description"
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Font Family</Label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full h-8 text-xs rounded-md border bg-background px-2 mt-1"
                  >
                    {FONTS.map((f) => (
                      <option key={f.id} value={f.value}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Font Size: {fontSize}px</Label>
                  <Input
                    type="range"
                    min={24}
                    max={120}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    className="h-8 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-9 h-8 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-8 text-xs font-mono flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Alignment</Label>
                  <div className="flex gap-1 mt-1">
                    {(["left", "center", "right"] as const).map((a) => (
                      <Button
                        key={a}
                        variant={textAlign === a ? "default" : "outline"}
                        size="sm"
                        className="flex-1 h-8 text-xs capitalize"
                        onClick={() => setTextAlign(a)}
                      >
                        {a}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs font-medium">Text Drop Shadow</span>
                <Button
                  variant={hasShadow ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setHasShadow(!hasShadow)}
                >
                  {hasShadow ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}