"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  ImageIcon,
  Download,
  Trash2,
  ArrowLeftRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { convertImage, ConvertOptions } from "@/features/images/image-converter";

const FORMAT_OPTIONS = [
  { id: "png", label: "PNG", desc: "Lossless with Alpha Transparency", ext: "png" },
  { id: "webp", label: "WebP", desc: "Modern High Efficiency & Small Size", ext: "webp" },
  { id: "jpeg", label: "JPEG", desc: "Universal Compatibility", ext: "jpg" },
  { id: "bmp", label: "BMP", desc: "Uncompressed Bitmap", ext: "bmp" },
  { id: "ico", label: "ICO", desc: "Website Favicon (256x256)", ext: "ico" },
];

export function ImageConverterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<ConvertOptions["format"]>("webp");
  const [quality, setQuality] = useState<number>(90);
  const [bgColor, setBgColor] = useState<string>("#ffffff");

  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>("converted.webp");
  const [outputSize, setOutputSize] = useState<number>(0);

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please drop a valid image file.");
      return;
    }
    setFile(f);
    setError(null);
    setOutputUrl(null);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const res = await convertImage(file, {
        format: targetFormat,
        quality: quality / 100,
        backgroundColor: bgColor,
      });

      if (res.status === "success" && res.outputUrl) {
        setOutputUrl(res.outputUrl);
        const data = res.data as { downloadName: string; size: number };
        setDownloadName(data.downloadName);
        setOutputSize(data.size);
      } else {
        setError(res.error || "Failed to convert image.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = downloadName;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setOutputUrl(null);
    setError(null);
  };

  const currentExt = file ? file.name.split(".").pop()?.toUpperCase() : "";

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
            Image Converter Studio
          </Badge>
          <span className="text-xs text-muted-foreground">
            Convert images between PNG, JPEG, WebP, BMP, and ICO with background fill & quality controls
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
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer ${
            dragOver ? "border-purple-500 bg-purple-500/5 scale-[0.99]" : "border-border/60 hover:border-purple-500/40 bg-card/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20 text-purple-600">
            <ArrowLeftRight className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base mb-1">Drop image to convert</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Convert PNG, JPG, WebP, GIF, or BMP into modern WebP, crisp PNG, universal JPEG, or ICO favicons.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <Button onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-lg gap-2 bg-purple-600 hover:bg-purple-700 text-white">
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
          {/* Header Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{currentExt}</Badge>
                  <span>•</span>
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  {outputUrl && (
                    <>
                      <span>•</span>
                      <span className="text-purple-600 font-semibold">
                        Converted: {(outputSize / 1024).toFixed(1)} KB ({targetFormat.toUpperCase()})
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {outputUrl ? (
              <Button onClick={handleDownload} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                <Download className="h-4 w-4" /> Download Converted File
              </Button>
            ) : (
              <Button onClick={handleConvert} disabled={processing} className="gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs">
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Convert to {targetFormat.toUpperCase()}
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
            {/* Left Options */}
            <section aria-label="Conversion settings" className="min-w-0 xl:col-start-2 xl:row-start-1">
              <div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Target Format</h4>
                    <p className="text-xs text-muted-foreground">Select the destination format for your image.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {FORMAT_OPTIONS.map((fmt) => (
                      <button type="button" aria-pressed={targetFormat === fmt.id}
                        key={fmt.id}
                        onClick={() => {
                          setTargetFormat(fmt.id as ConvertOptions["format"]);
                          setOutputUrl(null);
                        }}
                        className={`p-3 rounded-lg border text-left transition-colors flex items-center justify-between ${
                          targetFormat === fmt.id
                            ? "border-purple-600 bg-purple-500/10 shadow-xs"
                            : "border-border/50 hover:border-purple-500/30"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{fmt.label}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">.{fmt.ext}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{fmt.desc}</p>
                        </div>
                        {targetFormat === fmt.id && <span className="h-2 w-2 rounded-full bg-purple-600" />}
                      </button>
                    ))}
                  </div>

                  {/* Quality slider for WebP and JPEG */}
                  {(targetFormat === "webp" || targetFormat === "jpeg") && (
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <div className="flex justify-between items-center text-xs">
                        <Label className="text-xs font-medium">Encoding Quality</Label>
                        <span className="font-mono font-bold text-purple-600">{quality}%</span>
                      </div>
                      <Slider
                        value={[quality]}
                        onValueChange={(vals) => setQuality(Array.isArray(vals) ? vals[0] : vals)}
                        min={10}
                        max={100}
                        step={5}
                      />
                    </div>
                  )}

                  {/* Background Fill color for JPEG / BMP if converting transparent PNG */}
                  {(targetFormat === "jpeg" || targetFormat === "bmp") && (
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <Label className="text-xs font-medium">Background Color (for transparent areas)</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="h-8 w-12 rounded cursor-pointer border border-border"
                        />
                        <span className="text-xs font-mono text-muted-foreground">{bgColor}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Right Preview */}
            <section aria-label="Image preview" className="order-first min-w-0 xl:col-start-1 xl:row-start-1">
              <div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-purple-600" /> Image Preview
                    </span>
                    {outputUrl && (
                      <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Converted to {targetFormat.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="relative rounded-xl border border-border/50 bg-black/5 dark:bg-black/30 overflow-hidden min-h-[340px] flex items-center justify-center p-2">
                    <img
                      src={outputUrl || preview || ""}
                      alt="Preview"
                      className="max-h-[460px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}