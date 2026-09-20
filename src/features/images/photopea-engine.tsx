"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, ImageIcon, Trash2, Layers, SlidersHorizontal, Sun, Contrast, Droplets, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PhotopeaEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    // Reset adjustments
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setRotation(0);
  }, []);

  const applyFilters = useCallback(() => {
    if (!preview || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
      ctx.save();
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    };
    img.src = preview;
  }, [preview, brightness, contrast, saturation, blur, rotation]);

  // Apply filters whenever adjustments change
  const handleAdjustmentChange = useCallback(() => {
    setTimeout(applyFilters, 0);
  }, [applyFilters]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `edited-${file?.name || "image"}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setRotation(0);
  };

  return (
    <div className="space-y-4">
      {!file && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop an image to edit</p>
          <p className="text-sm text-muted-foreground">Supports PSD, JPG, PNG, WebP, SVG, and more</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.psd,.xcf,.sketch"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </div>
      )}

      {file && preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-50">{file.name}</span>
              <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <Trash2 className="h-4 w-4 mr-1" /> Remove
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" /> Export PNG
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Canvas preview */}
            <div className="lg:col-span-2 bg-muted/30 rounded-lg p-2 flex items-center justify-center min-h-75">
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-100 object-contain rounded"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`,
                    transform: `rotate(${rotation}deg)`,
                  }}
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Adjustments
              </h3>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label className="text-xs flex items-center gap-1"><Sun className="h-3 w-3" /> Brightness</Label>
                    <span className="text-xs text-muted-foreground">{brightness}%</span>
                  </div>
                  <Slider value={[brightness]} onValueChange={(v) => setBrightness(Array.isArray(v) ? v[0] : v)} min={0} max={200} step={1} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label className="text-xs flex items-center gap-1"><Contrast className="h-3 w-3" /> Contrast</Label>
                    <span className="text-xs text-muted-foreground">{contrast}%</span>
                  </div>
                  <Slider value={[contrast]} onValueChange={(v) => setContrast(Array.isArray(v) ? v[0] : v)} min={0} max={200} step={1} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label className="text-xs flex items-center gap-1"><Droplets className="h-3 w-3" /> Saturation</Label>
                    <span className="text-xs text-muted-foreground">{saturation}%</span>
                  </div>
                  <Slider value={[saturation]} onValueChange={(v) => setSaturation(Array.isArray(v) ? v[0] : v)} min={0} max={200} step={1} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label className="text-xs">Blur</Label>
                    <span className="text-xs text-muted-foreground">{blur}px</span>
                  </div>
                  <Slider value={[blur]} onValueChange={(v) => setBlur(Array.isArray(v) ? v[0] : v)} min={0} max={20} step={0.5} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label className="text-xs flex items-center gap-1"><Crop className="h-3 w-3" /> Rotation</Label>
                    <span className="text-xs text-muted-foreground">{rotation}°</span>
                  </div>
                  <Slider value={[rotation]} onValueChange={(v) => setRotation(Array.isArray(v) ? v[0] : v)} min={-180} max={180} step={1} />
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full" onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); setBlur(0); setRotation(0); }}>
                Reset All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}