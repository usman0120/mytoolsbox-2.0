"use client";

import { useState, useMemo } from "react";
import {
  Palette,
  Copy,
  Check,
  Code2,
  Sparkles,
  Shuffle,
  Droplets,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { convertColor } from "@/features/tools/color-converter";
import { toast } from "sonner";

const PRESET_SWATCHES = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#14b8a6", "#64748b", "#0f172a",
];

export function ColorConverterEngine() {
  const [input, setInput] = useState("#6366f1");
  const [activeTab, setActiveTab] = useState<"formats" | "code" | "harmonies">("formats");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live conversion
  const result = useMemo(() => {
    return convertColor(input);
  }, [input]);

  const colorData = result.status === "success" && result.data ? result.data : null;

  const handleCopy = async (val: string, key: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleRandomize = () => {
    const randomHex =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
    setInput(randomHex);
  };

  return (
    <div className="space-y-6">
      {/* Color Input and Picker */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Color Swatch & Native Picker */}
            <div className="relative group shrink-0">
              <div
                className="h-20 w-20 rounded-2xl border-2 border-border shadow-md transition-transform group-hover:scale-105 flex items-center justify-center cursor-pointer overflow-hidden"
                style={{ backgroundColor: colorData?.hex || "#6366f1" }}
              >
                <input
                  type="color"
                  value={colorData?.hex || "#6366f1"}
                  onChange={(e) => setInput(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </div>
            </div>

            {/* Input & Quick Actions */}
            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Enter Color (HEX, RGB, HSL, or Name)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRandomize}
                  className="h-6 text-xs text-muted-foreground gap-1"
                >
                  <Shuffle className="h-3 w-3" /> Random
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. #3b82f6 or rgb(59, 130, 246) or cyan"
                  className="font-mono text-sm h-10"
                />
              </div>

              {/* Swatches */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground mr-1">Palette:</span>
                {PRESET_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => setInput(swatch)}
                    className="h-5 w-5 rounded-full border border-black/10 hover:scale-125 transition-transform"
                    style={{ backgroundColor: swatch }}
                    title={swatch}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {colorData ? (
        <div className="space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "formats" | "code" | "harmonies")}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="formats" className="text-xs gap-1.5">
                <Droplets className="h-3.5 w-3.5" /> Color Formats
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs gap-1.5">
                <Code2 className="h-3.5 w-3.5" /> Code Snippets
              </TabsTrigger>
              <TabsTrigger value="harmonies" className="text-xs gap-1.5">
                <Palette className="h-3.5 w-3.5" /> Harmonies & Tints
              </TabsTrigger>
            </TabsList>

            {/* Formats Tab */}
            <TabsContent value="formats" className="space-y-3 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "HEX (Standard)", val: colorData.hex, key: "hex" },
                  { label: "HEX with Alpha", val: colorData.hexAlpha, key: "hexAlpha" },
                  { label: "RGB", val: colorData.rgb, key: "rgb" },
                  { label: "RGBA", val: colorData.rgba, key: "rgba" },
                  { label: "HSL", val: colorData.hsl, key: "hsl" },
                  { label: "HSLA", val: colorData.hsla, key: "hsla" },
                  { label: "HSV / HSB", val: colorData.hsv, key: "hsv" },
                  { label: "CMYK (Print)", val: colorData.cmyk, key: "cmyk" },
                ].map((item) => (
                  <Card key={item.key} className="bg-muted/20">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                          {item.label}
                        </span>
                        <span className="font-mono text-xs font-bold truncate block">{item.val}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleCopy(item.val, item.key)}
                      >
                        {copiedKey === item.key ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Code Snippets Tab */}
            <TabsContent value="code" className="space-y-3 pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { lang: "CSS Custom Property", code: colorData.codeSnippets.cssVar, key: "css" },
                  { lang: "Tailwind CSS Utility", code: colorData.codeSnippets.tailwind, key: "tw" },
                  { lang: "Flutter / Dart", code: colorData.codeSnippets.flutter, key: "flutter" },
                  { lang: "SwiftUI (iOS/macOS)", code: colorData.codeSnippets.swiftUI, key: "swift" },
                  { lang: "Android (Kotlin)", code: colorData.codeSnippets.android, key: "android" },
                ].map((item) => (
                  <Card key={item.key} className="bg-muted/20">
                    <CardContent className="p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">{item.lang}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs gap-1"
                          onClick={() => handleCopy(item.code, item.key)}
                        >
                          {copiedKey === item.key ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          Copy
                        </Button>
                      </div>
                      <pre className="p-2 rounded bg-muted font-mono text-[11px] overflow-x-auto">
                        {item.code}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Harmonies & Palettes Tab */}
            <TabsContent value="harmonies" className="space-y-4 pt-3">
              {/* Complementary & Triadic */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3 space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground block">
                      Complementary (180°)
                    </span>
                    <button
                      type="button"
                      onClick={() => setInput(colorData.harmonies.complementary)}
                      className="w-full h-12 rounded-lg border flex items-center justify-center font-mono text-xs font-bold text-white shadow-sm hover:scale-[1.02] transition-transform"
                      style={{ backgroundColor: colorData.harmonies.complementary }}
                    >
                      {colorData.harmonies.complementary}
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground block">
                      Analogous (±30°)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {colorData.harmonies.analogous.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setInput(c)}
                          className="h-12 rounded-lg border flex items-center justify-center font-mono text-xs font-bold text-white shadow-sm hover:scale-[1.02] transition-transform"
                          style={{ backgroundColor: c }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground block">
                      Triadic (±120°)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {colorData.harmonies.triadic.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setInput(c)}
                          className="h-12 rounded-lg border flex items-center justify-center font-mono text-xs font-bold text-white shadow-sm hover:scale-[1.02] transition-transform"
                          style={{ backgroundColor: c }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tints & Shades */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Tints & Shades Palette (Click to select)
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {[...colorData.harmonies.tints, colorData.hex, ...colorData.harmonies.shades].map(
                    (swatch, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInput(swatch)}
                        className="h-12 rounded-lg border flex flex-col justify-end p-1.5 font-mono text-[10px] font-bold shadow-sm hover:scale-105 transition-transform truncate"
                        style={{ backgroundColor: swatch }}
                        title={swatch}
                      >
                        <span className="bg-black/30 text-white px-1 rounded truncate">{swatch}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-xs">
          {result.error}
        </div>
      )}
    </div>
  );
}