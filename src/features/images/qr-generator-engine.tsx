"use client";

import { useState } from "react";
import { QrCode, Download, Trash2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProcessing } from "@/hooks/use-processing";
import { generateQR } from "@/features/images/qr-generator";
import { toast } from "sonner";

export function QRGeneratorEngine() {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(300);
  const { status, result, error, process, reset } = useProcessing();

  const handleGenerate = async () => {
    await process(() => generateQR({ text, size, color, bgColor }));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const a = document.createElement("a");
      a.href = result.outputUrl;
      a.download = "qrcode.png";
      a.click();
      toast.success("QR code downloaded!");
    }
  };

  return (
    <div className="space-y-4">
      {status === "idle" && (
        <>
          <div>
            <Label className="text-sm mb-1.5 block">Text or URL</Label>
            <Textarea
              placeholder="https://example.com or any text..."
              className="min-h-[80px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-1.5 block">Foreground</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono" />
              </div>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Background</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="font-mono" />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm mb-1.5 block">Size: {size}px</Label>
            <Input
              type="range"
              min={150}
              max={600}
              step={50}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </div>

          <Button onClick={handleGenerate} className="w-full gap-2" disabled={!text.trim()}>
            <QrCode className="h-4 w-4" /> Generate QR Code
          </Button>
        </>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-medium">Generating QR code...</p>
        </div>
      )}

      {status === "success" && result?.outputUrl && (
        <div className="text-center py-6 space-y-4">
          <img src={result.outputUrl} alt="QR Code" className="mx-auto rounded-lg border" style={{ width: size, height: size }} />
          <p className="text-sm text-muted-foreground">{result.message}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" /> Download PNG
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <Trash2 className="h-4 w-4" /> New QR Code
            </Button>
          </div>
        </div>
      )}

      {status === "error" && error && (
        <div className="text-center py-6">
          <p className="text-destructive font-medium mb-2">Error</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={reset}>Try Again</Button>
        </div>
      )}
    </div>
  );
}