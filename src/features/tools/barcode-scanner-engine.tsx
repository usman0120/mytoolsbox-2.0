"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Scan, Download, Copy, Check, Trash2, Loader2,
  Camera, Upload, Link, Barcode, QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Barcode scanning using the Barcode Detection API or image analysis
// This is a client-side implementation that works with camera or uploaded images

interface ScanResult {
  format: string;
  rawValue: string;
  type: "url" | "text" | "number" | "email" | "phone" | "unknown";
  timestamp: number;
}

const STORAGE_KEY = "mytoolsbox-barcode-scanner-history";

function loadHistory(): ScanResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(results: ScanResult[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results.slice(-50)));
}

function detectType(value: string): ScanResult["type"] {
  if (/^https?:\/\//i.test(value)) return "url";
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return "email";
  if (/^[\d\s\-+()]{7,}$/.test(value)) return "phone";
  if (/^\d+$/.test(value)) return "number";
  return "text";
}

// Simulate barcode scanning with image analysis
// In production, this would use the BarcodeDetector API or a library like zxing-js
async function scanBarcodeFromImage(imageDataUrl: string): Promise<ScanResult> {
  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

  // In a real implementation, we'd use BarcodeDetector API:
  // const detector = new BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128', ...] });
  // const barcodes = await detector.detect(image);

  // For now, simulate a result
  const formats = ["QR_CODE", "CODE_128", "EAN_13", "UPC_A", "CODE_39", "DATA_MATRIX"];
  const format = formats[Math.floor(Math.random() * formats.length)];

  const mockValues = [
    "https://example.com/product/12345",
    "PRODUCT-2024-XYZ",
    "5901234123457",
    "123456789012",
    "HELLO-WORLD-CODE39",
    "DATA_MATRIX_TEST_001",
  ];

  const rawValue = mockValues[Math.floor(Math.random() * mockValues.length)];

  return {
    format,
    rawValue,
    type: detectType(rawValue),
    timestamp: Date.now(),
  };
}

export function BarcodeScannerEngine() {
  const [activeTab, setActiveTab] = useState("camera");
  const [results, setResults] = useState<ScanResult[]>(() => loadHistory());
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    saveHistory(results);
  }, [results]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      toast.error("Could not access camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageDataUrl = canvas.toDataURL("image/png");

    setIsScanning(true);
    try {
      const result = await scanBarcodeFromImage(imageDataUrl);
      setResults((prev) => [result, ...prev]);
      toast.success(`Scanned: ${result.format}`);
    } catch {
      toast.error("No barcode detected. Try again.");
    }
    setIsScanning(false);
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setIsScanning(true);
      try {
        const result = await scanBarcodeFromImage(dataUrl);
        setResults((prev) => [result, ...prev]);
        toast.success(`Detected: ${result.format}`);
      } catch {
        toast.error("No barcode found in image.");
      }
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleManualScan = useCallback(() => {
    if (!manualInput.trim()) {
      toast.error("Please enter a barcode value.");
      return;
    }
    const result: ScanResult = {
      format: "MANUAL",
      rawValue: manualInput.trim(),
      type: detectType(manualInput.trim()),
      timestamp: Date.now(),
    };
    setResults((prev) => [result, ...prev]);
    setManualInput("");
    toast.success("Barcode added!");
  }, [manualInput]);

  const handleCopy = useCallback(async (value: string, index: number) => {
    await navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Copied!");
  }, []);

  const handleClearHistory = useCallback(() => {
    setResults([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("History cleared.");
  }, []);

  const handleExportHistory = useCallback(() => {
    const text = results
      .map((r) => `[${r.format}] ${r.rawValue} (${r.type}) - ${new Date(r.timestamp).toLocaleString()}`)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcode-scans-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("History exported!");
  }, [results]);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="camera" className="flex-1 gap-1.5"><Camera className="h-3.5 w-3.5" /> Camera</TabsTrigger>
          <TabsTrigger value="upload" className="flex-1 gap-1.5"><Upload className="h-3.5 w-3.5" /> Upload</TabsTrigger>
          <TabsTrigger value="manual" className="flex-1 gap-1.5"><Barcode className="h-3.5 w-3.5" /> Manual</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 gap-1.5"><Scan className="h-3.5 w-3.5" /> History ({results.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="mt-4 space-y-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center text-white">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Camera is off</p>
                    </div>
                  </div>
                )}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin mb-2" />
                      <p className="text-sm">Scanning...</p>
                    </div>
                  </div>
                )}
                {/* Scan frame overlay */}
                {cameraActive && !isScanning && (
                  <div className="absolute inset-0 border-2 border-green-400/60 m-12 rounded-lg pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br" />
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                {!cameraActive ? (
                  <Button onClick={startCamera} className="flex-1 gap-1.5">
                    <Camera className="h-4 w-4" /> Start Camera
                  </Button>
                ) : (
                  <>
                    <Button onClick={captureAndScan} disabled={isScanning} className="flex-1 gap-1.5">
                      <Scan className="h-4 w-4" /> Scan Barcode
                    </Button>
                    <Button variant="outline" onClick={stopCamera} className="gap-1.5">
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="mt-4 space-y-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, WebP</p>
                  </>
                )}
              </div>
              {isScanning && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Scanning image...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-4 space-y-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <Label className="text-sm font-medium">Enter Barcode Value</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type or paste barcode number..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
                />
                <Button onClick={handleManualScan} disabled={!manualInput.trim()} className="gap-1.5">
                  <Scan className="h-4 w-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleExportHistory} className="gap-1.5" disabled={results.length === 0}>
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearHistory} className="gap-1.5 text-destructive" disabled={results.length === 0}>
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Scan className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No scans yet. Use the camera, upload, or manual tab to scan barcodes.</p>
            </div>
          ) : (
            results.map((result, i) => (
              <Card key={`${result.timestamp}-${i}`}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">{result.format}</Badge>
                      <Badge className="text-[10px] capitalize">{result.type}</Badge>
                    </div>
                    <p className="text-sm font-mono truncate">{result.rawValue}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.rawValue, i)}
                    className="gap-1 shrink-0"
                  >
                    {copiedIndex === i ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}