"use client";

import { useState } from "react";
import { Palette, Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { convertColor } from "@/features/tools/color-converter";

export function ColorConverterEngine() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const handleConvert = () => {
    setError("");
    const r = convertColor(input);
    if (r.status === "error") {
      setError(r.error || "Invalid color");
      setResult(null);
    } else {
      setResult(r.data);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const formats = result
    ? [
        { key: "hex", label: "HEX" },
        { key: "rgb", label: "RGB" },
        { key: "hsl", label: "HSL" },
        { key: "cmyk", label: "CMYK" },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Color Value</Label>
          <Input
            placeholder="#3b82f6 / rgb(59,130,246) / blue"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConvert()}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleConvert} size="sm" className="gap-1.5">
            <ArrowRight className="h-3.5 w-3.5" /> Convert
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          {/* Color Preview */}
          <div className="flex items-center gap-3">
            <div
              className="h-16 w-16 rounded-xl border shadow-sm"
              style={{ backgroundColor: result.hex }}
            />
            <div>
              <p className="text-lg font-bold font-mono">{result.hex}</p>
              <p className="text-xs text-muted-foreground">{result.rgb}</p>
            </div>
          </div>

          {/* Format Cards */}
          <div className="grid grid-cols-2 gap-2">
            {formats.map((fmt) => (
              <Card key={fmt.key}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase">{fmt.label}</p>
                    <p className="text-sm font-mono truncate">{result[fmt.key]}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={() => handleCopy(result[fmt.key], fmt.key)}
                  >
                    {copiedKey === fmt.key ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}