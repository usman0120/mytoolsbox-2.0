"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, ImageIcon, Download, Trash2, Maximize, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useProcessing } from "@/hooks/use-processing";
import { resizeImage } from "@/features/images/image-resizer";

export function ImageResizerEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [percentage, setPercentage] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [mode, setMode] = useState<"dimensions" | "percentage">("dimensions");
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        setWidth(img.width.toString());
        setHeight(img.height.toString());
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(f);
    reset();
  }, [reset]);

  const handleResize = async () => {
    if (!file) return;
    const options: any = {};
    if (mode === "percentage" && percentage) {
      options.percentage = parseInt(percentage);
    } else {
      if (width) options.width = parseInt(width);
      if (height) options.height = parseInt(height);
    }
    options.maintainAspectRatio = lockAspect;
    await process(() => resizeImage(file, options));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const ext = file?.type === "image/png" ? "png" : "jpg";
      const a = document.createElement("a");
      a.href = result.outputUrl;
      a.download = `resized.${ext}`;
      a.click();
    }
  };

  const handleReset = () => {
    reset();
    setFile(null);
    setPreview(null);
  };

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
              {preview && <img src={preview} alt="" className="h-10 w-10 rounded object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant={mode === "dimensions" ? "default" : "outline"} size="sm" onClick={() => setMode("dimensions")}>
              <Maximize className="h-3.5 w-3.5 mr-1.5" /> Dimensions
            </Button>
            <Button variant={mode === "percentage" ? "default" : "outline"} size="sm" onClick={() => setMode("percentage")}>
              Percentage
            </Button>
          </div>

          {mode === "dimensions" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Width (px)</Label>
                  <Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs">Height (px)</Label>
                  <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-9" />
                </div>
              </div>
              <button
                onClick={() => setLockAspect(!lockAspect)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {lockAspect ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                {lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
              </button>
            </div>
          ) : (
            <div>
              <Label className="text-xs">Scale (%)</Label>
              <Input type="number" value={percentage} onChange={(e) => setPercentage(e.target.value)} placeholder="50" className="h-9" />
            </div>
          )}

          <Button onClick={handleResize} className="w-full">
            <Maximize className="h-4 w-4 mr-2" /> Resize Image
          </Button>
        </>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Resizing image...</p>
        </div>
      )}

      {status === "success" && result && (
        <div className="space-y-3">
          <div className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl p-4 text-sm font-medium text-center">{result.message}</div>
          {result.outputUrl && (
            <Card className="overflow-hidden">
              <CardContent className="p-4 flex items-center justify-center bg-muted/30">
                <img src={result.outputUrl} alt="Resized" className="max-w-full max-h-[400px] rounded-lg shadow-lg" />
              </CardContent>
            </Card>
          )}
          <Button onClick={handleDownload} className="w-full"><Download className="h-4 w-4 mr-2" /> Download</Button>
          <Button variant="outline" onClick={handleReset} className="w-full">Resize Another</Button>
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