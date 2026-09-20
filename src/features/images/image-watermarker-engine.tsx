"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Trash2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useProcessing } from "@/hooks/use-processing";
import { watermarkImage } from "@/features/images/image-watermarker";

export function ImageWatermarkerEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("© MyToolbox");
  const [opacity, setOpacity] = useState(50);
  const [fontSize, setFontSize] = useState(48);
  const [repeat, setRepeat] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, process, reset } = useProcessing();

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleWatermark = async () => {
    if (!file || !text.trim()) return;
    await process(() => watermarkImage(file, {
      text: text.trim(),
      opacity: opacity / 100,
      fontSize,
      repeat,
      position: "center",
      rotation: repeat ? -30 : -20,
      color: `rgba(255, 255, 255, ${opacity / 100})`,
    }));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const a = document.createElement("a");
      a.href = result.outputUrl;
      a.download = (result.data as { downloadName?: string } | undefined)?.downloadName || "watermarked.jpg";
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
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop an image here</p>
          <p className="text-sm text-muted-foreground">JPG, PNG, or WebP. Max 10MB.</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
        </div>
      )}

      {status === "idle" && file && preview && (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={handleReset}>Remove</Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm">Watermark Text</Label>
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="© Your Text" className="mt-1 rounded-xl" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between"><Label className="text-sm">Opacity: {opacity}%</Label></div>
              <Slider value={[opacity]} onValueChange={(v) => setOpacity(Array.isArray(v) ? v[0] : v)} min={5} max={100} step={5} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between"><Label className="text-sm">Font Size: {fontSize}px</Label></div>
              <Slider value={[fontSize]} onValueChange={(v) => setFontSize(Array.isArray(v) ? v[0] : v)} min={12} max={120} step={4} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="repeat" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} className="rounded" />
              <Label htmlFor="repeat" className="text-sm">Tile watermark across image</Label>
            </div>
          </div>

          <Button onClick={handleWatermark} className="w-full gap-2 rounded-xl" disabled={!text.trim()}>
            <Type className="h-4 w-4" /> Apply Watermark
          </Button>
        </div>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-medium">Applying watermark...</p>
        </div>
      )}

      {status === "success" && result && (
        <div className="text-center py-6 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 mx-auto">
            <Type className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-lg">Watermarked!</p>
            <p className="text-sm text-muted-foreground">{result.message}</p>
          </div>
          {result.outputUrl && (
            <img src={result.outputUrl} alt="Watermarked" className="max-w-xs mx-auto rounded-lg border" />
          )}
          <div className="flex gap-2 justify-center">
            <Button onClick={handleDownload} className="gap-2 rounded-xl"><Download className="h-4 w-4" /> Download</Button>
            <Button variant="outline" onClick={handleReset} className="gap-2 rounded-xl"><Trash2 className="h-4 w-4" /> Another</Button>
          </div>
        </div>
      )}

      {status === "error" && error && (
        <div className="text-center py-6">
          <p className="text-destructive font-medium mb-2">Error</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={handleReset}>Try Again</Button>
        </div>
      )}
    </div>
  );
}