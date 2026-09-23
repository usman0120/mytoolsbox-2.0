"use client";

import { useState } from "react";
import { Palette, Copy, Check, Shuffle, Download, Eye, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  generatePalette,
  getContrastRatio,
  generateShades,
  exportCssVariables,
  exportTailwindConfig,
  rgbToCmyk,
  type HarmonyRule,
  type PaletteColor,
} from "@/features/tools/color-palette";

const HARMONY_RULES: { id: HarmonyRule; label: string }[] = [
  { id: "analogous", label: "Analogous" },
  { id: "complementary", label: "Complementary" },
  { id: "triadic", label: "Triadic" },
  { id: "tetradic", label: "Tetradic" },
  { id: "monochromatic", label: "Monochromatic" },
  { id: "split-complementary", label: "Split Comp." },
];

function getRandomHex(): string {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function ColorPaletteEngine() {
  const [baseColor, setBaseColor] = useState("#3B82F6");
  const [rule, setRule] = useState<HarmonyRule>("analogous");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"palette" | "shades" | "contrast">("palette");

  const palette: PaletteColor[] = generatePalette(baseColor, rule, 5);
  const shades = generateShades(baseColor);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${text} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleRandomize = () => {
    setBaseColor(getRandomHex());
  };

  const handleExport = (type: "css" | "tailwind" | "json") => {
    let content = "";
    let filename = "";

    if (type === "css") {
      content = exportCssVariables(palette);
      filename = `palette-vars-${baseColor.replace("#", "")}.css`;
    } else if (type === "tailwind") {
      content = exportTailwindConfig(palette);
      filename = `tailwind-colors-${baseColor.replace("#", "")}.js`;
    } else {
      content = JSON.stringify(
        palette.map((p) => ({
          hex: p.hex,
          rgb: p.rgb,
          hsl: p.hsl,
          cmyk: rgbToCmyk(p.rgb.r, p.rgb.g, p.rgb.b),
        })),
        null,
        2
      );
      filename = `palette-${baseColor.replace("#", "")}.json`;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Color Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border border-border shadow-xs"
          />
          <div>
            <Label className="text-xs text-muted-foreground">Base Color</Label>
            <div className="font-mono text-xl font-bold tracking-tight">
              {baseColor.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleRandomize} variant="outline" size="sm" className="gap-1.5 text-xs">
            <Shuffle className="h-3.5 w-3.5" /> Randomize
          </Button>
          <Button onClick={() => handleExport("css")} variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> CSS Vars
          </Button>
          <Button onClick={() => handleExport("tailwind")} variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Tailwind
          </Button>
        </div>
      </div>

      {/* Harmony Selector */}
      <div className="flex flex-wrap gap-2">
        {HARMONY_RULES.map((r) => (
          <Button
            key={r.id}
            variant={rule === r.id ? "default" : "outline"}
            size="sm"
            onClick={() => setRule(r.id)}
            className="text-xs h-8"
          >
            {r.label}
          </Button>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab((v as "palette" | "shades" | "contrast") ?? "palette")}>
        <TabsList className="grid grid-cols-3 max-w-sm">
          <TabsTrigger value="palette" className="text-xs gap-1.5">
            <Palette className="h-3.5 w-3.5" /> Harmonies
          </TabsTrigger>
          <TabsTrigger value="shades" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" /> 50–900 Shades
          </TabsTrigger>
          <TabsTrigger value="contrast" className="text-xs gap-1.5">
            <Eye className="h-3.5 w-3.5" /> WCAG Contrast
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Harmonies Palette */}
        <TabsContent value="palette" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {palette.map((item, i) => {
              const cmyk = rgbToCmyk(item.rgb.r, item.rgb.g, item.rgb.b);
              const contrastWhite = getContrastRatio(item.hex, "#FFFFFF");
              const isDark = contrastWhite >= 4.5;

              return (
                <Card key={i} className="overflow-hidden border shadow-xs group">
                  <div
                    className="h-28 w-full p-2 flex flex-col justify-between cursor-pointer transition-transform group-hover:scale-[1.02]"
                    style={{ backgroundColor: item.hex }}
                    onClick={() => handleCopy(item.hex, `hex-${i}`)}
                  >
                    <div className="flex justify-end">
                      <Badge
                        variant="secondary"
                        className="text-[10px] opacity-90 backdrop-blur-xs px-1.5 py-0 h-5"
                      >
                        {i === 0 ? "Root" : `Accent ${i}`}
                      </Badge>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-sm w-fit ${
                        isDark ? "text-white bg-black/30" : "text-black bg-white/40"
                      }`}
                    >
                      {item.hex.toUpperCase()}
                    </span>
                  </div>

                  <CardContent className="p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold">{item.hex.toUpperCase()}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(item.hex, `hex-${i}`)}
                      >
                        {copiedKey === `hex-${i}` ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>

                    <div className="text-[11px] text-muted-foreground space-y-0.5 font-mono">
                      <div>RGB: {item.rgb.r}, {item.rgb.g}, {item.rgb.b}</div>
                      <div>HSL: {item.hsl.h}°, {item.hsl.s}%, {item.hsl.l}%</div>
                      <div>CMYK: {cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Real-time UI Component Preview */}
          <Card className="border">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Live UI Mockup Preview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className="rounded-lg p-4 text-center font-medium text-sm shadow-xs flex items-center justify-center min-h-[50px]"
                  style={{
                    backgroundColor: palette[0]?.hex || baseColor,
                    color: getContrastRatio(palette[0]?.hex || baseColor, "#FFFFFF") >= 4.5 ? "#FFF" : "#000",
                  }}
                >
                  Primary Action Button
                </div>
                <div
                  className="rounded-lg p-4 text-center font-medium text-sm shadow-xs border flex items-center justify-center min-h-[50px]"
                  style={{
                    backgroundColor: palette[1]?.hex || baseColor,
                    color: getContrastRatio(palette[1]?.hex || baseColor, "#FFFFFF") >= 4.5 ? "#FFF" : "#000",
                  }}
                >
                  Secondary Action
                </div>
                <div
                  className="rounded-lg p-4 text-center font-medium text-sm shadow-xs border flex items-center justify-center min-h-[50px]"
                  style={{
                    backgroundColor: palette[2]?.hex || baseColor,
                    color: getContrastRatio(palette[2]?.hex || baseColor, "#FFFFFF") >= 4.5 ? "#FFF" : "#000",
                  }}
                >
                  Accent Badge / Tag
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: 50-900 Shades */}
        <TabsContent value="shades" className="space-y-3 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {shades.map((s) => {
              const isDark = getContrastRatio(s.hex, "#FFFFFF") >= 4.5;
              return (
                <div
                  key={s.shade}
                  onClick={() => handleCopy(s.hex, `shade-${s.shade}`)}
                  className="rounded-lg border overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                >
                  <div
                    className="h-16 w-full flex items-end p-1.5"
                    style={{ backgroundColor: s.hex }}
                  >
                    <span
                      className={`text-[10px] font-bold font-mono px-1 rounded-sm ${
                        isDark ? "text-white bg-black/30" : "text-black bg-white/40"
                      }`}
                    >
                      {s.shade}
                    </span>
                  </div>
                  <div className="p-1.5 text-center bg-card">
                    <p className="font-mono text-[10px] font-medium truncate">{s.hex.toUpperCase()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 3: WCAG Contrast Analysis */}
        <TabsContent value="contrast" className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {palette.map((item, idx) => {
              const contrastOnWhite = getContrastRatio(item.hex, "#FFFFFF");
              const contrastOnBlack = getContrastRatio(item.hex, "#000000");

              return (
                <Card key={idx} className="border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md border" style={{ backgroundColor: item.hex }} />
                    <span className="font-mono font-semibold text-xs">{item.hex.toUpperCase()}</span>
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      {idx === 0 ? "Primary" : `Color ${idx + 1}`}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg border bg-white text-black space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>On White</span>
                        <span>{contrastOnWhite}:1</span>
                      </div>
                      <Badge variant={contrastOnWhite >= 4.5 ? "default" : "secondary"} className="text-[9px]">
                        {contrastOnWhite >= 7 ? "AAA Pass" : contrastOnWhite >= 4.5 ? "AA Pass" : "Fail (Normal Text)"}
                      </Badge>
                    </div>

                    <div className="p-2.5 rounded-lg border bg-black text-white space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>On Black</span>
                        <span>{contrastOnBlack}:1</span>
                      </div>
                      <Badge variant={contrastOnBlack >= 4.5 ? "default" : "secondary"} className="text-[9px]">
                        {contrastOnBlack >= 7 ? "AAA Pass" : contrastOnBlack >= 4.5 ? "AA Pass" : "Fail (Normal Text)"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}