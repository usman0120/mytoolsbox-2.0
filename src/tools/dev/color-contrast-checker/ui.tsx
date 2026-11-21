"use client";

import { useState, useMemo } from "react";
import {
  Palette,
  Copy,
  Check,
  Eye,
  RefreshCw,
  Contrast,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface ContrastResult {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
  uiComponents: boolean; // WCAG 2.1 Non-text contrast (3:1)
}

function hexToRgb(hex: string): [number, number, number] | null {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const match = clean.match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!match) return null;
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, "0");
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Auto-fix algorithm: Adjusts lightness of foreground to achieve desired ratio (e.g. 4.5 or 7.0) against background
function findAccessibleColor(fgHex: string, bgHex: string, targetRatio = 4.5): string {
  const bgRgb = hexToRgb(bgHex);
  const fgRgb = hexToRgb(fgHex);
  if (!bgRgb || !fgRgb) return fgHex;

  const bgLum = getLuminance(...bgRgb);
  // Determine if we should go lighter or darker
  const shouldLighten = bgLum < 0.5;

  let bestHex = fgHex;
  let [r, g, b] = fgRgb;

  for (let step = 0; step <= 100; step++) {
    const factor = step / 100;
    const testR = shouldLighten ? r + (255 - r) * factor : r * (1 - factor);
    const testG = shouldLighten ? g + (255 - g) * factor : g * (1 - factor);
    const testB = shouldLighten ? b + (255 - b) * factor : b * (1 - factor);

    const candidateHex = rgbToHex(testR, testG, testB);
    const ratio = getContrastRatio(candidateHex, bgHex);
    if (ratio >= targetRatio) {
      return candidateHex;
    }
    bestHex = candidateHex;
  }

  return shouldLighten ? "#ffffff" : "#000000";
}

const PRESET_COMBOS = [
  { name: "Default Dark/Light", fg: "#0f172a", bg: "#ffffff" },
  { name: "Navy & Ice Blue", fg: "#0f3460", bg: "#f0f9ff" },
  { name: "Emerald & Cream", fg: "#064e3b", bg: "#f0fdf4" },
  { name: "Deep Violet & Soft Rose", fg: "#4c1d95", bg: "#faf5ff" },
  { name: "High Contrast Dark", fg: "#f8fafc", bg: "#09090b" },
  { name: "Amber & Charcoal", fg: "#fef3c7", bg: "#1e1e24" },
];

export function ColorContrastEngine() {
  const [foreground, setForeground] = useState("#0f172a");
  const [background, setBackground] = useState("#ffffff");
  const [copied, setCopied] = useState<string | null>(null);

  // Instant live calculation
  const { ratio, aaNormal, aaLarge, aaaNormal, aaaLarge, uiComponents } = useMemo<ContrastResult>(() => {
    const r = getContrastRatio(foreground, background);
    return {
      ratio: r,
      aaNormal: r >= 4.5,
      aaLarge: r >= 3.0,
      aaaNormal: r >= 7.0,
      aaaLarge: r >= 4.5,
      uiComponents: r >= 3.0,
    };
  }, [foreground, background]);

  const handleSwap = () => {
    const prevFg = foreground;
    setForeground(background);
    setBackground(prevFg);
  };

  const handleRandomize = () => {
    const randomHex = () =>
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
    const newBg = randomHex();
    const newFg = randomHex();
    setBackground(newBg);
    setForeground(newFg);
  };

  const handleAutoFix = (targetRatio: number) => {
    const accessibleFg = findAccessibleColor(foreground, background, targetRatio);
    setForeground(accessibleFg);
    toast.success(`Color tuned to meet ${targetRatio}:1 contrast!`);
  };

  const handleCopy = async (val: string, label: string) => {
    await navigator.clipboard.writeText(val);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast.success(`Copied ${label}!`);
  };

  const getRatioBadgeColor = (r: number) => {
    if (r >= 7) return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    if (r >= 4.5) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (r >= 3) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <div className="space-y-6">
      {/* Color pickers */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Foreground */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Foreground / Text Color</Label>
                <button
                  type="button"
                  onClick={() => handleCopy(foreground, "Foreground")}
                  className="text-[11px] text-muted-foreground hover:text-foreground font-mono flex items-center gap-1"
                >
                  {copied === "Foreground" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  {foreground}
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="font-mono text-xs pl-9"
                    placeholder="#000000"
                  />
                  <div
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border shadow-sm"
                    style={{ backgroundColor: foreground }}
                  />
                </div>
                <input
                  type="color"
                  value={foreground.startsWith("#") && foreground.length === 7 ? foreground : "#000000"}
                  onChange={(e) => setForeground(e.target.value)}
                  className="h-9 w-9 rounded-lg cursor-pointer border p-0.5"
                />
              </div>
            </div>

            {/* Background */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Background Color</Label>
                <button
                  type="button"
                  onClick={() => handleCopy(background, "Background")}
                  className="text-[11px] text-muted-foreground hover:text-foreground font-mono flex items-center gap-1"
                >
                  {copied === "Background" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  {background}
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="font-mono text-xs pl-9"
                    placeholder="#ffffff"
                  />
                  <div
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border shadow-sm"
                    style={{ backgroundColor: background }}
                  />
                </div>
                <input
                  type="color"
                  value={background.startsWith("#") && background.length === 7 ? background : "#ffffff"}
                  onChange={(e) => setBackground(e.target.value)}
                  className="h-9 w-9 rounded-lg cursor-pointer border p-0.5"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSwap} className="gap-1.5 h-8 text-xs">
                <RefreshCw className="h-3.5 w-3.5" /> Swap Colors
              </Button>
              <Button variant="outline" size="sm" onClick={handleRandomize} className="gap-1.5 h-8 text-xs">
                <Shuffle className="h-3.5 w-3.5" /> Randomize
              </Button>
            </div>

            {ratio < 4.5 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Fix contrast:</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAutoFix(4.5)}
                  className="h-8 text-xs gap-1 text-emerald-600 dark:text-emerald-400"
                >
                  <Wand2 className="h-3.5 w-3.5" /> Auto-Fix AA (4.5:1)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAutoFix(7.0)}
                  className="h-8 text-xs gap-1 text-primary"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Auto-Fix AAA (7:1)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Ratio Card */}
        <Card className={`md:col-span-1 border ${getRatioBadgeColor(ratio)} flex flex-col justify-center items-center p-6 text-center`}>
          <span className="text-xs font-semibold uppercase tracking-wider mb-1">Contrast Ratio</span>
          <span className="text-5xl font-black tracking-tight">{ratio.toFixed(2)}:1</span>
          <Badge variant="outline" className="mt-2 text-xs font-semibold">
            {ratio >= 7 ? "AAA Compliant" : ratio >= 4.5 ? "AA Compliant" : ratio >= 3 ? "Large Text Only" : "Fails WCAG"}
          </Badge>
        </Card>

        {/* WCAG Compliance Matrix */}
        <Card className="md:col-span-3">
          <CardContent className="p-4">
            <Label className="text-xs font-semibold text-muted-foreground block mb-3">
              WCAG 2.1 Accessibility Standards
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className={`p-3 rounded-lg border ${aaNormal ? "bg-green-500/10 border-green-500/30" : "bg-destructive/10 border-destructive/30"}`}>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>WCAG AA</span>
                  {aaNormal ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                </div>
                <p className="text-[11px] text-muted-foreground">Normal Text (≥ 4.5:1)</p>
                <span className="font-semibold text-xs mt-1 block">{aaNormal ? "PASS" : "FAIL"}</span>
              </div>

              <div className={`p-3 rounded-lg border ${aaLarge ? "bg-green-500/10 border-green-500/30" : "bg-destructive/10 border-destructive/30"}`}>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>WCAG AA Large</span>
                  {aaLarge ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                </div>
                <p className="text-[11px] text-muted-foreground">Large Text ≥ 18pt (≥ 3:1)</p>
                <span className="font-semibold text-xs mt-1 block">{aaLarge ? "PASS" : "FAIL"}</span>
              </div>

              <div className={`p-3 rounded-lg border ${aaaNormal ? "bg-green-500/10 border-green-500/30" : "bg-destructive/10 border-destructive/30"}`}>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>WCAG AAA</span>
                  {aaaNormal ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                </div>
                <p className="text-[11px] text-muted-foreground">Enhanced Text (≥ 7:1)</p>
                <span className="font-semibold text-xs mt-1 block">{aaaNormal ? "PASS" : "FAIL"}</span>
              </div>

              <div className={`p-3 rounded-lg border ${uiComponents ? "bg-green-500/10 border-green-500/30" : "bg-destructive/10 border-destructive/30"}`}>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>UI Elements</span>
                  {uiComponents ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                </div>
                <p className="text-[11px] text-muted-foreground">Borders & Icons (≥ 3:1)</p>
                <span className="font-semibold text-xs mt-1 block">{uiComponents ? "PASS" : "FAIL"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive UI Component Simulation Canvas */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground">Live UI Component Simulation</Label>
        <div
          className="p-6 rounded-2xl border shadow-sm space-y-5 transition-colors"
          style={{ backgroundColor: background, color: foreground }}
        >
          {/* Typography */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">Accessible Design Heading (18pt Bold)</h2>
            <p className="text-sm leading-relaxed max-w-2xl opacity-90">
              This interactive preview simulates real UI components rendered in your chosen colors. Good contrast
              ensures readability across mobile screens, bright sunlight, and for users with low vision or color
              vision deficiencies.
            </p>
            <p className="text-xs opacity-75">Small Caption Text: 12px / 0.75rem opacity 75%.</p>
          </div>

          {/* Interactive UI Mockups */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg font-semibold text-xs shadow transition-opacity hover:opacity-90"
              style={{ backgroundColor: foreground, color: background }}
            >
              Primary Action Button
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded-lg font-semibold text-xs border transition-opacity hover:opacity-80"
              style={{ borderColor: foreground, color: foreground }}
            >
              Outline Button
            </button>

            <div
              className="px-3 py-1.5 rounded-full text-xs font-medium border"
              style={{ borderColor: foreground, backgroundColor: "transparent" }}
            >
              Category Pill
            </div>
          </div>
        </div>
      </div>

      {/* Curated Accessible Presets */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground">Curated Accessible Palettes</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESET_COMBOS.map((combo) => {
            const cr = getContrastRatio(combo.fg, combo.bg);
            return (
              <button
                key={combo.name}
                type="button"
                onClick={() => {
                  setForeground(combo.fg);
                  setBackground(combo.bg);
                }}
                className="p-2.5 rounded-lg border text-left flex items-center justify-between hover:border-primary transition-colors text-xs"
                style={{ backgroundColor: combo.bg, color: combo.fg }}
              >
                <span className="font-semibold truncate mr-2">{combo.name}</span>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 shrink-0">
                  {cr.toFixed(1)}:1
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}