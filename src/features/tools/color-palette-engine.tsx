"use client";

import { useState, useCallback, useEffect } from "react";
import { Palette, Copy, Check, RefreshCw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HarmonyRule = "complementary" | "analogous" | "triadic" | "tetradic" | "monochromatic" | "split-complementary";

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function generatePalette(baseHex: string, rule: HarmonyRule): string[] {
  const { h, s, l } = hexToHsl(baseHex);

  switch (rule) {
    case "complementary":
      return [baseHex, hslToHex((h + 180) % 360, s, l)];
    case "analogous":
      return [
        hslToHex((h - 30 + 360) % 360, s, l),
        baseHex,
        hslToHex((h + 30) % 360, s, l),
        hslToHex((h + 60) % 360, s, l),
      ];
    case "triadic":
      return [baseHex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
    case "tetradic":
      return [
        baseHex,
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
      ];
    case "monochromatic":
      return [
        hslToHex(h, s, Math.min(100, l + 30)),
        hslToHex(h, s, Math.min(100, l + 15)),
        baseHex,
        hslToHex(h, s, Math.max(0, l - 15)),
        hslToHex(h, s, Math.max(0, l - 30)),
      ];
    case "split-complementary":
      return [
        baseHex,
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
      ];
    default:
      return [baseHex];
  }
}

function randomHex(): string {
  return hslToHex(Math.floor(Math.random() * 360), 60 + Math.floor(Math.random() * 30), 45 + Math.floor(Math.random() * 15));
}

const harmonyLabels: Record<HarmonyRule, string> = {
  complementary: "Complementary",
  analogous: "Analogous",
  triadic: "Triadic",
  tetradic: "Tetradic",
  monochromatic: "Monochromatic",
  "split-complementary": "Split Comp.",
};

export function ColorPaletteEngine() {
  const [mounted, setMounted] = useState(false);
  const [baseColor, setBaseColor] = useState(() => randomHex());
  const [rule, setRule] = useState<HarmonyRule>("analogous");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Mark as mounted on first render
  if (!mounted) {
    setMounted(true);
  }

  const palette = generatePalette(baseColor, rule);

  const handleCopy = async (color: string, index: number) => {
    await navigator.clipboard.writeText(color);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleRandom = () => {
    setBaseColor(randomHex());
  };

  const handleExport = () => {
    const text = palette.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `palette-${baseColor.replace("#", "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Base Color Picker */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="color"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border/50"
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Base Color</Label>
          <div className="font-mono text-lg font-bold" suppressHydrationWarning>
            {baseColor.toUpperCase()}
          </div>
        </div>
        <Button onClick={handleRandom} variant="outline" size="sm" className="gap-2">
          <Shuffle className="h-4 w-4" /> Random
        </Button>
      </div>

      {/* Harmony Rules */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(harmonyLabels) as HarmonyRule[]).map((r) => (
          <Button
            key={r}
            variant={rule === r ? "default" : "outline"}
            size="sm"
            onClick={() => setRule(r)}
            className="rounded-full text-xs"
          >
            {harmonyLabels[r]}
          </Button>
        ))}
      </div>

      {/* Palette Display */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {palette.map((color, i) => (
          <Card key={i} className="overflow-hidden border-border/50">
            <div
              className="h-24 w-full transition-transform hover:scale-105 cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => handleCopy(color, i)}
            />
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium">{color.toUpperCase()}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleCopy(color, i)}
                >
                  {copiedIndex === i ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">UI Preview</h3>
          <div className="space-y-3">
            <div
              className="h-10 rounded-lg flex items-center px-4 text-white font-medium text-sm"
              style={{ backgroundColor: palette[0] }}
            >
              Primary Button
            </div>
            <div className="flex gap-2">
              {palette.slice(0, 3).map((color, i) => (
                <div
                  key={i}
                  className="flex-1 h-8 rounded-lg"
                  style={{ backgroundColor: color, opacity: 0.3 + i * 0.2 }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {palette.slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-background"
                  style={{ backgroundColor: color }}
                />
              ))}
              <span className="text-xs text-muted-foreground self-center ml-1">Avatar colors</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <div className="flex gap-2">
        <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" /> Export Palette
        </Button>
      </div>
    </div>
  );
}