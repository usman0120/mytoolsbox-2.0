"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  ImageIcon,
  Download,
  Trash2,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { compressImage, formatSize, CompressionStats } from "@/features/images/image-compressor";

export function ImageCompressorEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [outputFormat, setOutputFormat] = useState<"auto" | "image/webp" | "image/jpeg" | "image/png">("image/webp");
  const [maxDimension, setMaxDimension] = useState<number>(1920);

  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<CompressionStats | null>(null);
  const [downloadName, setDownloadName] = useState<string>("compressed.webp");

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please drop a valid image (JPEG, PNG, WebP).");
      return;
    }
    setFile(f);
    setError(null);
    setCompressedUrl(null);
    setStats(null);

    const reader = new FileReader();
    reader.onload = () => setOriginalPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const runCompression = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const res = await compressImage(file, {
        quality: quality / 100,
        maxWidth: maxDimension,
        maxHeight: maxDimension,
        format: outputFormat,
      });

      if (res.status === "success" && res.outputUrl) {
        setCompressedUrl(res.outputUrl);
        const data = res.data as { downloadName: string; stats: CompressionStats };
        setStats(data.stats);
        setDownloadName(data.downloadName);
      } else {
        setError(res.error || "Failed to compress image.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed.");
    } finally {
      setProcessing(false);
    }
  }, [file, quality, outputFormat, maxDimension]);

  // Re-run compression when settings change if file loaded
  useEffect(() => {
    if (file) {
      const timer = setTimeout(() => {
        runCompression();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [file, quality, outputFormat, maxDimension, runCompression]);

  const handleDownload = () => {
    if (!compressedUrl) return;
    const a = document.createElement("a");
    a.href = compressedUrl;
    a.download = downloadName;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setOriginalPreview(null);
    setCompressedUrl(null);
    setStats(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            Image Compressor Studio
          </Badge>
          <span className="text-xs text-muted-foreground">
            Client-side image optimizer with real-time compression, format conversion & live savings analytics
          </span>
        </div>
        {file && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" /> Start Over
          </Button>
        )}
      </div>

      {!file && (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            dragOver ? "border-emerald-500 bg-emerald-500/5 scale-[0.99]" : "border-border/60 hover:border-emerald-500/40 bg-card/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-600">
            <ImageIcon className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base mb-1">Drop an image to compress</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Shrink image file size by up to 90% without visible loss of detail. Runs entirely in your browser with zero data uploads.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <Button size="sm" className="rounded-xl gap-2 pointer-events-none bg-emerald-600 hover:bg-emerald-700 text-white">
            <Upload className="h-4 w-4" /> Select Image
          </Button>
        </div>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {file && (
        <div className="space-y-6">
          {/* Header Summary & Download Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Original: {formatSize(file.size)}</span>
                  {stats && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">
                        Compressed: {formatSize(stats.compressedSize)} (-{stats.savingsPercent}%)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {compressedUrl && (
              <Button onClick={handleDownload} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                <Download className="h-4 w-4" /> Download Compressed Image
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Controls & Sliders */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Compression Settings</h4>
                    {processing && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-emerald-600 border-t-transparent rounded-full" />
                        Updating...
                      </div>
                    )}
                  </div>

                  {/* Quality Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="text-xs font-medium">Quality Level</Label>
                      <span className="font-mono font-bold text-emerald-600">{quality}%</span>
                    </div>
                    <Slider
                      value={[quality]}
                      onValueChange={(vals) => setQuality(Array.isArray(vals) ? vals[0] : vals)}
                      min={10}
                      max={100}
                      step={5}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Maximum Savings</span>
                      <span>Balanced (75%)</span>
                      <span>Lossless</span>
                    </div>
                  </div>

                  {/* Output Format */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Output Format</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "image/webp", label: "WebP", desc: "Best Size" },
                        { id: "image/jpeg", label: "JPEG", desc: "Universal" },
                        { id: "image/png", label: "PNG", desc: "Crisp Alpha" },
                      ].map((fmt) => (
                        <Button
                          key={fmt.id}
                          type="button"
                          size="sm"
                          variant={outputFormat === fmt.id ? "default" : "outline"}
                          className={`rounded-xl text-xs flex-col h-14 ${outputFormat === fmt.id ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                          onClick={() => setOutputFormat(fmt.id as typeof outputFormat)}
                        >
                          <span className="font-semibold">{fmt.label}</span>
                          <span className="text-[10px] opacity-80">{fmt.desc}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Max Resolution Preset */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Resolution Limit</Label>
                    <select
                      value={maxDimension}
                      onChange={(e) => setMaxDimension(Number(e.target.value))}
                      className="w-full rounded-xl border border-border/50 bg-background p-2 text-xs h-9"
                    >
                      <option value={4096}>Original Bounds (Up to 4K / 4096px)</option>
                      <option value={1920}>Full HD 1080p (Max 1920px)</option>
                      <option value={1280}>HD 720p (Max 1280px)</option>
                      <option value={800}>Web Optimized (Max 800px)</option>
                    </select>
                  </div>

                  {/* Analytics Grid */}
                  {stats && (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">Total Savings:</span>
                        <Badge className="bg-emerald-600 text-white font-mono text-xs">
                          -{stats.savingsPercent}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="p-2 rounded-lg bg-background/80 border border-border/40">
                          <p className="text-muted-foreground text-[10px]">Original</p>
                          <p className="font-bold">{formatSize(stats.originalSize)}</p>
                          <p className="text-[10px] text-muted-foreground">{stats.originalWidth}×{stats.originalHeight}px</p>
                        </div>
                        <div className="p-2 rounded-lg bg-background/80 border border-border/40">
                          <p className="text-muted-foreground text-[10px]">Compressed</p>
                          <p className="font-bold text-emerald-600">{formatSize(stats.compressedSize)}</p>
                          <p className="text-[10px] text-muted-foreground">{stats.outputWidth}×{stats.outputHeight}px</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Visual Image Preview */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-emerald-600" /> Output Preview
                    </span>
                    {stats && (
                      <span className="text-muted-foreground text-[11px]">
                        Saved {(stats.savingsPercent)}% of original size
                      </span>
                    )}
                  </div>

                  <div className="relative rounded-xl border border-border/50 bg-black/5 dark:bg-black/30 overflow-hidden min-h-[340px] flex items-center justify-center p-2">
                    {compressedUrl ? (
                      <img
                        src={compressedUrl}
                        alt="Compressed Output"
                        className="max-h-[460px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                      />
                    ) : originalPreview ? (
                      <img
                        src={originalPreview}
                        alt="Original"
                        className="max-h-[460px] w-auto max-w-full object-contain rounded-lg opacity-60"
                      />
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}