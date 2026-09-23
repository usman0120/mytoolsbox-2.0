"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Download,
  Trash2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { rotateImage, FlipDirection } from "@/features/images/image-rotator";

export function ImageRotatorEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [angle, setAngle] = useState<number>(0);
  const [flip, setFlip] = useState<FlipDirection>("none");
  const [bgColor, setBgColor] = useState<string>("transparent");

  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>("rotated.png");
  const [rotatedDims, setRotatedDims] = useState<{ w: number; h: number } | null>(null);

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
    setAngle(0);
    setFlip("none");

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleApplyRotate = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const res = await rotateImage(file, {
        angle,
        flip,
        backgroundColor: bgColor,
      });

      if (res.status === "success" && res.outputUrl) {
        setOutputUrl(res.outputUrl);
        const data = res.data as { downloadName: string; width: number; height: number };
        setDownloadName(data.downloadName);
        setRotatedDims({ w: data.width, h: data.height });
      } else {
        setError(res.error || "Failed to rotate image.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rotation failed.");
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
    setAngle(0);
    setFlip("none");
    setError(null);
  };

  const toggleFlip = (dir: "horizontal" | "vertical") => {
    setOutputUrl(null);
    if (dir === "horizontal") {
      if (flip === "none") setFlip("horizontal");
      else if (flip === "horizontal") setFlip("none");
      else if (flip === "vertical") setFlip("both");
      else setFlip("vertical");
    } else {
      if (flip === "none") setFlip("vertical");
      else if (flip === "vertical") setFlip("none");
      else if (flip === "horizontal") setFlip("both");
      else setFlip("horizontal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
            Image Rotator Studio
          </Badge>
          <span className="text-xs text-muted-foreground">
            Rotate 90°/180°/270°, horizontal/vertical flip, and custom degrees with bounding box expansion
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
            dragOver ? "border-indigo-500 bg-indigo-500/5 scale-[0.99]" : "border-border/60 hover:border-indigo-500/40 bg-card/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20 text-indigo-600">
            <RotateCw className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base mb-1">Drop image to rotate or flip</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Correct orientation, straighten tilted scans, or mirror images with instant high-quality rendering.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <Button size="sm" className="rounded-xl gap-2 pointer-events-none bg-indigo-600 hover:bg-indigo-700 text-white">
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
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>Rotation: {angle}°</span>
                  {flip !== "none" && <span>• Flipped: {flip}</span>}
                </div>
              </div>
            </div>

            {outputUrl ? (
              <Button onClick={handleDownload} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                <Download className="h-4 w-4" /> Download Rotated Image
              </Button>
            ) : (
              <Button onClick={handleApplyRotate} disabled={processing} className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Rotating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Apply & Save Rotation
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-5">
                  {/* Quick Preset Buttons */}
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">Quick Rotation Presets</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs gap-1.5"
                        onClick={() => { setAngle((prev) => (prev - 90 + 360) % 360); setOutputUrl(null); }}
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-indigo-600" /> 90° Left
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs gap-1.5"
                        onClick={() => { setAngle((prev) => (prev + 90) % 360); setOutputUrl(null); }}
                      >
                        <RotateCw className="h-3.5 w-3.5 text-indigo-600" /> 90° Right
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs gap-1.5"
                        onClick={() => { setAngle((prev) => (prev + 180) % 360); setOutputUrl(null); }}
                      >
                        <RotateCw className="h-3.5 w-3.5 text-indigo-600" /> 180° Invert
                      </Button>
                    </div>
                  </div>

                  {/* Flipping Buttons */}
                  <div className="pt-2 border-t border-border/40">
                    <Label className="text-xs font-semibold mb-2 block">Mirror & Flip</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={flip === "horizontal" || flip === "both" ? "default" : "outline"}
                        size="sm"
                        className={`rounded-xl text-xs gap-1.5 ${flip === "horizontal" || flip === "both" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}`}
                        onClick={() => toggleFlip("horizontal")}
                      >
                        <FlipHorizontal className="h-3.5 w-3.5" /> Flip Horizontal
                      </Button>
                      <Button
                        type="button"
                        variant={flip === "vertical" || flip === "both" ? "default" : "outline"}
                        size="sm"
                        className={`rounded-xl text-xs gap-1.5 ${flip === "vertical" || flip === "both" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}`}
                        onClick={() => toggleFlip("vertical")}
                      >
                        <FlipVertical className="h-3.5 w-3.5" /> Flip Vertical
                      </Button>
                    </div>
                  </div>

                  {/* Arbitrary Angle Slider */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="text-xs font-semibold">Custom Angle Fine-Tuning</Label>
                      <span className="font-mono font-bold text-indigo-600">{angle}°</span>
                    </div>
                    <Slider
                      value={[angle]}
                      onValueChange={(vals) => {
                        setAngle(Array.isArray(vals) ? vals[0] : vals);
                        setOutputUrl(null);
                      }}
                      min={-180}
                      max={180}
                      step={1}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>-180°</span>
                      <button onClick={() => setAngle(0)} className="text-indigo-600 hover:underline">Reset to 0°</button>
                      <span>+180°</span>
                    </div>
                  </div>

                  {/* Background Fill when rotated */}
                  <div className="space-y-1.5 pt-2 border-t border-border/40">
                    <Label className="text-xs">Corner Background Fill</Label>
                    <select
                      value={bgColor}
                      onChange={(e) => {
                        setBgColor(e.target.value);
                        setOutputUrl(null);
                      }}
                      className="w-full rounded-xl border border-border/50 bg-background p-2 text-xs h-9"
                    >
                      <option value="transparent">Transparent (PNG)</option>
                      <option value="#ffffff">White Background</option>
                      <option value="#000000">Black Background</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Preview */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-indigo-600" /> Interactive Live Preview
                    </span>
                    {rotatedDims && (
                      <span className="text-muted-foreground text-[11px] font-mono">
                        Output: {rotatedDims.w}×{rotatedDims.h} px
                      </span>
                    )}
                  </div>

                  <div className="relative rounded-xl border border-border/50 bg-black/5 dark:bg-black/30 overflow-hidden min-h-[380px] flex items-center justify-center p-4">
                    {preview && (
                      <img
                        src={outputUrl || preview}
                        alt="Preview"
                        className="max-h-[440px] w-auto max-w-full object-contain rounded-lg shadow-sm transition-transform duration-200"
                        style={
                          !outputUrl
                            ? {
                                transform: `rotate(${angle}deg) scale(${flip === "horizontal" || flip === "both" ? -1 : 1}, ${flip === "vertical" || flip === "both" ? -1 : 1})`,
                              }
                            : undefined
                        }
                      />
                    )}
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