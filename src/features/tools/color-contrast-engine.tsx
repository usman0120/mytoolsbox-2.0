"use client";

import { useState, useCallback } from "react";
import { Palette, Copy, Check, Eye, EyeOff, Type, RefreshCw, Contrast } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ContrastResult {
  ratio: number;
  aa: boolean;
  aaLarge: boolean;
  aaa: boolean;
  aaaLarge: boolean;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const match = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!match) return null;
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return null;

  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function analyzeContrast(ratio: number): ContrastResult {
  return {
    ratio,
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

const WCAG_LEVELS = [
  { level: "AA", size: "Normal", minRatio: 4.5, label: "AA (normal text)" },
  { level: "AA", size: "Large", minRatio: 3, label: "AA (large text)" },
  { level: "AAA", size: "Normal", minRatio: 7, label: "AAA (normal text)" },
  { level: "AAA", size: "Large", minRatio: 4.5, label: "AAA (large text)" },
];

const PRESET_COLORS = [
  "#000000", "#FFFFFF", "#1a1a2e", "#16213e", "#0f3460", "#e94560",
  "#2d3436", "#636e72", "#b2bec3", "#dfe6e9", "#6c5ce7", "#a29bfe",
  "#00b894", "#55efc4", "#fdcb6e", "#f39c12", "#e17055", "#d63031",
  "#0984e3", "#74b9ff", "#00cec9", "#81ecec", "#fd79a8", "#e84393",
];

export function ColorContrastEngine() {
  const [foreground, setForeground] = useState("#1a1a2e");
  const [background, setBackground] = useState("#FFFFFF");
  const [ratio, setRatio] = useState<number | null>(null);
  const [result, setResult] = useState<ContrastResult | null>(null);
  const [copied, setCopied] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  const handleCheck = useCallback(() => {
    const r = getContrastRatio(foreground, background);
    if (r === null) return;
    setRatio(r);
    setResult(analyzeContrast(r));
  }, [foreground, background]);

  const handleSwap = () => {
    setForeground(background);
    setBackground(foreground);
    setRatio(null);
    setResult(null);
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const getRatioColor = (r: number) => {
    if (r >= 7) return "text-green-500";
    if (r >= 4.5) return "text-amber-500";
    if (r >= 3) return "text-orange-500";
    return "text-red-500";
  };

  const getRatioBg = (r: number) => {
    if (r >= 7) return "bg-green-500/10 border-green-500/30";
    if (r >= 4.5) return "bg-amber-500/10 border-amber-500/30";
    if (r >= 3) return "bg-orange-500/10 border-orange-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Color inputs */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Foreground (Text)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="#000000"
                    value={foreground}
                    onChange={(e) => { setForeground(e.target.value); setRatio(null); }}
                    className="font-mono pl-8"
                  />
                  <div
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded border border-border"
                    style={{ backgroundColor: foreground }}
                  />
                </div>
                <input
                  type="color"
                  value={foreground}
                  onChange={(e) => { setForeground(e.target.value); setRatio(null); }}
                  className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Background</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="#FFFFFF"
                    value={background}
                    onChange={(e) => { setBackground(e.target.value); setRatio(null); }}
                    className="font-mono pl-8"
                  />
                  <div
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded border border-border"
                    style={{ backgroundColor: background }}
                  />
                </div>
                <input
                  type="color"
                  value={background}
                  onChange={(e) => { setBackground(e.target.value); setRatio(null); }}
                  className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCheck} className="gap-2 flex-1">
              <Contrast className="h-4 w-4" /> Check Contrast
            </Button>
            <Button variant="outline" size="icon" onClick={handleSwap}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && (
        <Card style={{ backgroundColor: background }}>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium" style={{ color: foreground }}>Preview</Label>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => setShowPreview(false)}
                style={{ color: foreground }}
              >
                <EyeOff className="h-3.5 w-3.5" /> Hide
              </Button>
            </div>
            <p className="text-2xl font-bold" style={{ color: foreground }}>The quick brown fox</p>
            <p className="text-base" style={{ color: foreground }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
            </p>
            <p className="text-sm opacity-70" style={{ color: foreground }}>
              Small text: This demonstrates how smaller text looks with these colors.
            </p>
            <div className="flex gap-2">
              <Badge style={{ backgroundColor: foreground, color: background }}>Badge</Badge>
              <Badge variant="outline" style={{ borderColor: foreground, color: foreground }}>Outline</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {!showPreview && (
        <Button variant="outline" className="gap-2 w-full" onClick={() => setShowPreview(true)}>
          <Eye className="h-4 w-4" /> Show Preview
        </Button>
      )}

      {/* Results */}
      {result && (
        <Card className={getRatioBg(result.ratio)}>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Contrast Ratio</p>
            <p className={`text-4xl font-bold ${getRatioColor(result.ratio)}`}>
              {result.ratio.toFixed(2)}:1
            </p>
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
              {WCAG_LEVELS.map((level) => {
                const passes = result.ratio >= level.minRatio;
                return (
                  <Badge
                    key={level.label}
                    variant={passes ? "default" : "outline"}
                    className={`gap-1 ${passes ? "bg-green-500" : "text-muted-foreground"}`}
                  >
                    {passes ? <Check className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {level.label}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preset colors */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Preset Colors</Label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => { setForeground(color); setRatio(null); }}
              className="h-8 w-8 rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-110"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* WCAG reference */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <Label className="text-xs font-medium mb-2 block">WCAG 2.1 Guidelines</Label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {WCAG_LEVELS.map((level) => (
              <div key={level.label} className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{level.level} {level.size}</Badge>
                <span className="text-muted-foreground">≥ {level.minRatio}:1</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}