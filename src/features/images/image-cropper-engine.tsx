"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Trash2, Crop, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProcessing } from "@/hooks/use-processing";
import { cropImage } from "@/features/images/image-cropper";

export function ImageCropperEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragCorner, setDragCorner] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { status, result, error, process, reset } = useProcessing();

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const img = new Image();
      img.onload = () => {
        const size = Math.min(200, img.width, img.height);
        setImageSize({ width: img.width, height: img.height });
        setCrop({ x: 0, y: 0, width: size, height: size });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(f);
    reset();
  }, [reset]);

  const handleCrop = async () => {
    if (!file) return;
    await process(() => cropImage(file, crop));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const ext = file?.type === "image/png" ? "png" : "jpg";
      const a = document.createElement("a");
      a.href = result.outputUrl;
      a.download = `cropped.${ext}`;
      a.click();
    }
  };

  const handleReset = () => {
    reset();
    setFile(null);
    setPreview(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(e.clientX - rect.left, imageSize.width - crop.width));
      const y = Math.max(0, Math.min(e.clientY - rect.top, imageSize.height - crop.height));
      setCrop((prev) => ({ ...prev, x, y }));
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, imageSize, crop.width, crop.height]);

  return (
    <div className="space-y-4">
      {status === "idle" && !file && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop an image here</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
        </div>
      )}

      {file && status === "idle" && (
        <>
          <Card className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{imageSize.width}×{imageSize.height}px</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>

          {preview && (
            <div ref={containerRef} className="relative inline-block max-w-full overflow-hidden rounded-lg border border-border/50 select-none">
              <img src={preview} alt="Crop preview" className="max-w-full max-h-[400px]" draggable={false} />
              <div
                className="absolute border-2 border-primary bg-primary/10 cursor-move"
                style={{ left: crop.x, top: crop.y, width: crop.width, height: crop.height }}
                onMouseDown={handleMouseDown}
              >
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm text-xs px-2 py-0.5 rounded whitespace-nowrap border border-border/50">
                  {Math.round(crop.width)}×{Math.round(crop.height)}
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `0 0 0 9999px rgba(0,0,0,0.4), 0 0 0 ${crop.x}px rgba(0,0,0,0.4) inset, 0 0 0 ${crop.y}px rgba(0,0,0,0.4) inset` }} />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleCrop} className="flex-1">
              <Crop className="h-4 w-4 mr-2" /> Crop Image
            </Button>
          </div>
        </>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Cropping image...</p>
        </div>
      )}

      {status === "success" && result && (
        <div className="space-y-3">
          <div className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl p-4 text-sm font-medium text-center">{result.message}</div>
          {result.outputUrl && (
            <Card className="overflow-hidden">
              <CardContent className="p-4 flex items-center justify-center bg-muted/30">
                <img src={result.outputUrl} alt="Cropped" className="max-w-full max-h-[400px] rounded-lg shadow-lg" />
              </CardContent>
            </Card>
          )}
          <Button onClick={handleDownload} className="w-full"><Download className="h-4 w-4 mr-2" /> Download</Button>
          <Button variant="outline" onClick={handleReset} className="w-full">Crop Another</Button>
        </div>
      )}

      {status === "error" && error && (
        <div className="space-y-3">
          <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm text-center">{error}</div>
          <Button variant="outline" onClick={handleReset} className="w-full">Try Again</Button>
        </div>
      )}
    </div>
  );
}