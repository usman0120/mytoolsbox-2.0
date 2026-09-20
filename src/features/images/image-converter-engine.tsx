"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, ImageIcon, Download, Trash2, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProcessing } from "@/hooks/use-processing";
import { convertImage } from "@/features/images/image-converter";

const FORMATS = [
  { value: "image/png" as const, label: "PNG", ext: "png" },
  { value: "image/jpeg" as const, label: "JPEG", ext: "jpg" },
  { value: "image/webp" as const, label: "WebP", ext: "webp" },
];

export function ImageConverterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, process, reset } = useProcessing();

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    reset();
  }, [reset]);

  const handleConvert = async () => {
    if (!file) return;
    await process(() => convertImage(file, targetFormat));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const ext = (result.data as { extension?: string })?.extension || targetFormat.split("/")[1].replace("jpeg", "jpg");
      const a = document.createElement("a");
      a.href = result.outputUrl;
      a.download = `converted.${ext}`;
      a.click();
    }
  };

  const handleReset = () => {
    reset();
    setFile(null);
    setPreview(null);
  };

  const currentFormatLabel = file ? (file.type === "image/png" ? "PNG" : file.type === "image/jpeg" ? "JPEG" : file.type === "image/webp" ? "WebP" : "Image") : "";

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
          <p className="text-sm text-muted-foreground">or click to browse. Convert between PNG, JPEG, and WebP.</p>
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
                <p className="text-xs text-muted-foreground">{currentFormatLabel} · {(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>

          <div>
            <p className="text-sm font-medium mb-2">Convert to:</p>
            <div className="flex gap-2">
              {FORMATS.map((fmt) => (
                <Button
                  key={fmt.value}
                  variant={targetFormat === fmt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTargetFormat(fmt.value)}
                  disabled={file.type === fmt.value}
                  className="flex-1"
                >
                  {fmt.label}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleConvert} className="w-full">
            <ArrowLeftRight className="h-4 w-4 mr-2" /> Convert to {FORMATS.find((f) => f.value === targetFormat)?.label}
          </Button>
        </>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Converting image...</p>
        </div>
      )}

      {status === "success" && result && (
        <div className="space-y-3">
          <div className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl p-4 text-sm font-medium text-center">{result.message}</div>
          {result.outputUrl && (
            <Card className="overflow-hidden">
              <CardContent className="p-4 flex items-center justify-center bg-muted/30">
                <img src={result.outputUrl} alt="Converted" className="max-w-full max-h-100 rounded-lg shadow-lg" />
              </CardContent>
            </Card>
          )}
          <Button onClick={handleDownload} className="w-full"><Download className="h-4 w-4 mr-2" /> Download</Button>
          <Button variant="outline" onClick={handleReset} className="w-full">Convert Another</Button>
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