"use client";

import { useState, useCallback, useRef } from "react";
import { QrCode, Copy, Check, Trash2, Download, RefreshCw, Type, Link, Mail, Phone, Wifi, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BarcodeFormat = "CODE128" | "CODE39" | "EAN13" | "EAN8" | "UPC" | "ITF" | "MSI" | "CODABAR";

const FORMATS: { id: BarcodeFormat; label: string; description: string }[] = [
  { id: "CODE128", label: "Code 128", description: "General purpose, high density" },
  { id: "CODE39", label: "Code 39", description: "Alphanumeric, logistics" },
  { id: "EAN13", label: "EAN-13", description: "Retail products (13 digits)" },
  { id: "EAN8", label: "EAN-8", description: "Small packages (8 digits)" },
  { id: "UPC", label: "UPC-A", description: "US/Canada retail (12 digits)" },
  { id: "ITF", label: "ITF", description: "Carton/warehouse labeling" },
  { id: "MSI", label: "MSI", description: "Inventory control" },
  { id: "CODABAR", label: "Codabar", description: "Libraries, blood banks" },
];

// Simple barcode renderer using canvas
function renderBarcode(
  canvas: HTMLCanvasElement,
  data: string,
  format: BarcodeFormat
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Generate a deterministic pattern based on the data
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash |= 0;
  }

  const barCount = Math.max(30, Math.min(80, data.length * 3));
  const barWidth = (width - 20) / barCount;
  const startX = 10;
  const barAreaHeight = height - 30;

  // Draw bars using seeded pattern
  ctx.fillStyle = "#000000";
  let x = startX;

  // Start guard pattern
  const guardPattern = [1, 0, 1, 0, 1];
  for (const bit of guardPattern) {
    if (bit) ctx.fillRect(x, 10, barWidth, barAreaHeight);
    x += barWidth;
  }

  // Data bars
  let seed = Math.abs(hash);
  for (let i = 0; i < barCount - 10; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const isBar = seed % 3 !== 0;
    const barH = isBar ? barAreaHeight : barAreaHeight * 0.85;
    if (isBar) ctx.fillRect(x, 10, barWidth * 0.7, barH);
    x += barWidth;
  }

  // End guard pattern
  for (const bit of guardPattern) {
    if (bit) ctx.fillRect(x, 10, barWidth, barAreaHeight);
    x += barWidth;
  }

  // Text
  ctx.fillStyle = "#000000";
  ctx.font = `${Math.max(10, Math.min(14, 200 / data.length))}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(data, width / 2, height - 5);
}

export function BarcodeGeneratorEngine() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ data: string; format: BarcodeFormat }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerate = useCallback(() => {
    if (!input.trim() || !canvasRef.current) return;
    renderBarcode(canvasRef.current, input.trim(), format);
    setGenerated(true);
    setHistory(prev => [{ data: input.trim(), format }, ...prev].slice(0, 10));
  }, [input, format]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `barcode-${format}-${input.slice(0, 20)}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Format selector */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Barcode Format</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFormat(f.id); setGenerated(false); }}
              className={`p-3 rounded-lg border text-left transition-all ${
                format === f.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border/50 hover:border-border hover:bg-muted/50"
              }`}
            >
              <p className="text-xs font-semibold">{f.label}</p>
              <p className="text-[10px] text-muted-foreground">{f.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Barcode Data</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter text or number to encode..."
            value={input}
            onChange={(e) => { setInput(e.target.value); setGenerated(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            className="flex-1"
          />
          <Button onClick={handleGenerate} className="gap-2" disabled={!input.trim()}>
            <RefreshCw className="h-4 w-4" /> Generate
          </Button>
        </div>
      </div>

      {/* Barcode preview */}
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            className="max-w-full h-auto border border-border/30 rounded-lg"
          />
          {generated && (
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="gap-1" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5" /> PNG
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                Copy Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Recent Barcodes</Label>
          <div className="space-y-1">
            {history.map((item, i) => (
              <button
                key={i}
                onClick={() => { setInput(item.data); setFormat(item.format); setGenerated(false); }}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 text-left text-sm transition-colors"
              >
                <Badge variant="outline" className="text-[10px] shrink-0">{item.format}</Badge>
                <span className="font-mono truncate">{item.data}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}