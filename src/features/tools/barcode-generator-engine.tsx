"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  QrCode, Copy, Check, Download, RefreshCw, Barcode as BarcodeIcon,
  Sparkles, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  encodeCode128,
  encodeCode39,
  encodeEAN13,
  drawBarcodeToCanvas,
  generateBarcodeSvg,
  generateQrDataUrl,
  generateQrSvg,
  type BarcodeType,
} from "@/features/tools/barcode-generator";

const FORMATS: { id: BarcodeType; label: string; desc: string; sample: string }[] = [
  { id: "CODE128", label: "Code 128", desc: "High density ASCII 32-126 with Modulo 103", sample: "CODE-128-PROD" },
  { id: "CODE39", label: "Code 39", desc: "Logistics standard (A-Z, 0-9, symbols)", sample: "INV-9824" },
  { id: "EAN13", label: "EAN-13", desc: "Retail 13-digit standard with checksum", sample: "4006381333931" },
  { id: "QR", label: "QR Code", desc: "2D matrix code for URLs, contact & text", sample: "https://mytoolsbox.me" },
];

export function BarcodeGeneratorEngine() {
  const [format, setFormat] = useState<BarcodeType>("CODE128");
  const [data, setData] = useState("CODE-128-PROD");
  const [barWidth, setBarWidth] = useState(2);
  const [barHeight, setBarHeight] = useState(120);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QR state
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderBarcode = useCallback(async () => {
    setError(null);
    if (!data.trim()) return;

    if (format === "QR") {
      try {
        const url = await generateQrDataUrl(data.trim(), { width: 320 });
        setQrUrl(url);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to generate QR code");
      }
      return;
    }

    setQrUrl(null);
    const canvas = canvasRef.current;
    if (!canvas) return;

    let encoded: { bits: string; valid: boolean; error?: string };
    let displayLabel = data.trim();

    if (format === "CODE128") {
      encoded = encodeCode128(data.trim());
    } else if (format === "CODE39") {
      encoded = encodeCode39(data.trim());
    } else {
      const ean = encodeEAN13(data.trim());
      encoded = ean;
      if (ean.valid) displayLabel = ean.fullCode;
    }

    if (!encoded.valid) {
      setError(encoded.error || "Encoding error");
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    drawBarcodeToCanvas(canvas, encoded.bits, displayLabel, {
      barWidth,
      height: barHeight,
      quietZone: 20,
      showText: true,
      fontSize: 14,
    });
  }, [format, data, barWidth, barHeight]);

  useEffect(() => {
    renderBarcode();
  }, [renderBarcode]);

  const handleFormatChange = (newFormat: BarcodeType) => {
    setFormat(newFormat);
    const sample = FORMATS.find((f) => f.id === newFormat)?.sample || "123456";
    setData(sample);
  };

  const handleDownloadPng = () => {
    if (format === "QR" && qrUrl) {
      const link = document.createElement("a");
      link.download = `qrcode-${Date.now()}.png`;
      link.href = qrUrl;
      link.click();
      toast.success("QR Code PNG downloaded!");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `barcode-${format}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Barcode PNG downloaded!");
  };

  const handleDownloadSvg = async () => {
    let svgContent = "";
    if (format === "QR") {
      svgContent = await generateQrSvg(data.trim(), { width: 320 });
    } else {
      let bits = "";
      let label = data.trim();
      if (format === "CODE128") bits = encodeCode128(data.trim()).bits;
      else if (format === "CODE39") bits = encodeCode39(data.trim()).bits;
      else {
        const ean = encodeEAN13(data.trim());
        bits = ean.bits;
        label = ean.fullCode;
      }
      svgContent = generateBarcodeSvg(bits, label, { barWidth, height: barHeight });
    }

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `barcode-${format}-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Barcode SVG downloaded!");
  };

  const handleCopyData = async () => {
    await navigator.clipboard.writeText(data);
    setCopied(true);
    toast.success("Data copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Format Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            onClick={() => handleFormatChange(f.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              format === f.id
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                : "border-border/60 hover:border-border hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {f.id === "QR" ? (
                <QrCode className="h-4 w-4 text-primary" />
              ) : (
                <BarcodeIcon className="h-4 w-4 text-primary" />
              )}
              <span className="font-semibold text-xs">{f.label}</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">{f.desc}</p>
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Barcode Data / Text</Label>
        <Input
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter characters to encode..."
          className="font-mono text-sm h-10"
        />
        {format === "EAN13" && (
          <p className="text-[10px] text-muted-foreground">
            Provide 12 digits (check digit will be computed) or full 13 digits.
          </p>
        )}
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-3 flex items-center gap-2 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Barcode Preview Canvas / QR Preview */}
      <Card className="border shadow-xs bg-muted/20">
        <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[220px]">
          {format === "QR" && qrUrl ? (
            <img
              src={qrUrl}
              alt="QR Preview"
              className="max-w-[280px] h-auto rounded-lg border shadow-xs bg-white p-2"
            />
          ) : (
            <canvas
              ref={canvasRef}
              className={`max-w-full h-auto rounded-lg border shadow-xs bg-white ${
                error ? "hidden" : "block"
              }`}
            />
          )}

          {!error && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button onClick={handleDownloadPng} size="sm" className="h-8 text-xs gap-1.5">
                <Download className="h-3.5 w-3.5" /> Download PNG
              </Button>
              <Button onClick={handleDownloadSvg} variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Download className="h-3.5 w-3.5" /> Download SVG
              </Button>
              <Button onClick={handleCopyData} variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                Copy Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}