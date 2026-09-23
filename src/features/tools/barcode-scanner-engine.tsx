"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Scan, Download, Copy, Check, Trash2, Camera, Upload,
  ExternalLink, Wifi, Phone, Mail, QrCode, AlertCircle, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  parseBarcode,
  validateEAN13,
  validateUPCA,
  ParsedBarcodeResult,
} from "@/features/tools/barcode-scanner";

const STORAGE_KEY = "mytoolsbox-barcode-scanner-history";

export function BarcodeScannerEngine() {
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "manual">("upload");
  const [scannedResult, setScannedResult] = useState<ParsedBarcodeResult | null>(null);
  const [history, setHistory] = useState<ParsedBarcodeResult[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [cameraActive, setCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 30)));
  }, [history]);

  // Handle a new scan result
  const handleNewScan = useCallback((rawValue: string, format: string = "QR_CODE") => {
    const result = parseBarcode(rawValue, format);
    setScannedResult(result);
    setHistory((prev) => [result, ...prev.filter((h) => h.rawValue !== result.rawValue)]);
    toast.success(`Scanned: ${result.rawValue}`);
  }, []);

  // Native BarcodeDetector scanning function
  const scanMediaElement = async (element: HTMLVideoElement | HTMLImageElement): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    // Check if BarcodeDetector API exists in browser
    if ("BarcodeDetector" in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Detector = (window as any).BarcodeDetector;
        const formats = await Detector.getSupportedFormats();
        const detector = new Detector({
          formats: formats.length > 0 ? formats : ["qr_code", "ean_13", "upc_a", "code_128", "code_39"],
        });
        const barcodes = await detector.detect(element);

        if (barcodes.length > 0) {
          const first = barcodes[0];
          handleNewScan(first.rawValue, first.format || "BARCODE");
          return true;
        }
      } catch (e) {
        console.warn("BarcodeDetector error:", e);
      }
    }
    return false;
  };

  // Camera continuous loop
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);

        const checkFrame = async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const detected = await scanMediaElement(videoRef.current);
            if (detected) {
              stopCamera();
              return;
            }
          }
          animFrameRef.current = requestAnimationFrame(checkFrame);
        };
        animFrameRef.current = requestAnimationFrame(checkFrame);
      }
    } catch {
      toast.error("Camera access was denied or is unavailable.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle uploaded image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = async () => {
      const detected = await scanMediaElement(img);
      if (!detected) {
        // Fallback: If native BarcodeDetector is absent on this browser, inform user or accept manual entry
        toast.info("No barcode detected automatically. You can verify or check digits with manual input.");
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    handleNewScan(manualInput.trim(), "MANUAL_INPUT");
    setManualInput("");
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast.success("Scan history cleared.");
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" /> Barcode & QR Code Scanner
          </h2>
          <p className="text-sm text-muted-foreground">Scan and validate UPC, EAN-13, and QR codes via camera, image upload, or digits</p>
        </div>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearHistory} className="text-xs text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear History
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Scanner Controls (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              if (activeTab === "camera" && v !== "camera") stopCamera();
              setActiveTab(v as "camera" | "upload" | "manual");
            }}
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="upload" className="text-xs gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Upload Image
              </TabsTrigger>
              <TabsTrigger value="camera" className="text-xs gap-1.5">
                <Camera className="h-3.5 w-3.5" /> Camera
              </TabsTrigger>
              <TabsTrigger value="manual" className="text-xs gap-1.5">
                <QrCode className="h-3.5 w-3.5" /> Manual Digits
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-3">
              <label className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-muted/20 hover:bg-muted/30 text-center min-h-[220px]">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs font-semibold">Click to upload barcode or QR code image</p>
                <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG, WebP supported</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </TabsContent>

            <TabsContent value="camera" className="mt-3">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />

                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4 text-center">
                    <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                    <Button onClick={startCamera} size="sm" className="text-xs gap-1.5">
                      Start Camera Scanner
                    </Button>
                  </div>
                )}

                {cameraActive && (
                  <div className="absolute inset-x-0 bottom-3 flex justify-center">
                    <Button onClick={stopCamera} variant="destructive" size="sm" className="text-xs">
                      Stop Camera
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual" className="mt-3 space-y-2">
              <Card className="p-4">
                <Label className="text-xs mb-1 block">Barcode / QR String Verification</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter EAN-13, UPC-A, or QR text..."
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                    className="h-8 text-xs font-mono"
                  />
                  <Button onClick={handleManualSubmit} size="sm" className="h-8 text-xs px-3">
                    Verify
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Example valid EAN-13: <code>4006381333931</code> | Valid UPC-A: <code>036000291452</code>
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Active Result Card */}
          {scannedResult && (
            <Card className="p-4 border-primary/40 bg-primary/5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Scan Result</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {scannedResult.format}
                    </Badge>
                    {scannedResult.isValidChecksum ? (
                      <Badge variant="outline" className="text-[10px] gap-1 text-green-500 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Checksum Valid
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[10px] gap-1">
                        <AlertCircle className="h-3 w-3" /> Invalid Checksum
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-background rounded-lg border font-mono text-xs break-all select-all flex items-center justify-between gap-2">
                  <span>{scannedResult.rawValue}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleCopy(scannedResult.rawValue)}
                  >
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>

                {/* Structured Metadata Actions */}
                {scannedResult.dataType === "url" && (
                  <Button
                    size="sm"
                    className="w-full text-xs gap-1.5"
                    onClick={() => window.open(scannedResult.rawValue, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open Link in Browser
                  </Button>
                )}

                {scannedResult.dataType === "wifi" && scannedResult.metadata && (
                  <div className="p-3 bg-background rounded-lg border text-xs space-y-1">
                    <p className="font-semibold flex items-center gap-1 text-primary">
                      <Wifi className="h-3.5 w-3.5" /> WiFi Network Details
                    </p>
                    <p><strong className="text-muted-foreground">SSID:</strong> {scannedResult.metadata.ssid}</p>
                    <p><strong className="text-muted-foreground">Security:</strong> {scannedResult.metadata.type}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span><strong className="text-muted-foreground">Password:</strong> {scannedResult.metadata.password}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px]"
                        onClick={() => handleCopy(scannedResult.metadata?.password || "")}
                      >
                        Copy Password
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Scan History (5 cols) */}
        <div className="md:col-span-5 space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase">Scan History ({history.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {history.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  No scan history yet.
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[360px] overflow-y-auto">
                  {history.map((item, idx) => (
                    <div key={`${item.rawValue}_${idx}`} className="p-3 text-xs space-y-1 hover:bg-muted/20">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {item.format}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {item.dataType}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] truncate text-foreground select-all">
                        {item.rawValue}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}