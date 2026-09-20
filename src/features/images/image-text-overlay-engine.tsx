"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Trash2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useProcessing } from "@/hooks/use-processing";
import { addTextOverlay, TextPosition } from "@/features/images/image-text-overlay";

export function ImageTextOverlayEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [bgOpacity, setBgOpacity] = useState(60);
  const [position, setPosition] = useState<TextPosition>("bottom");
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

  const handleOverlay = async () => {
    if (!file || !text.trim()) return;
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    await process(() => addTextOverlay(file, {
      text: text.trim(),
      fontSize,
      color,
      backgroundColor: bgColor === "#000000" && bgOpacity === 0 ? "transparent" : hexToRgba(bgColor, bgOpacity / 100),
      position,
    }));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const a = document.createElement("a");
      a.href = result.outputUrl;
      a.download = (result.data as { downloadName?: string } | undefined)?.downloadName || "overlay.jpg";
      a.click();
    }
  };

  const handleReset = () => {
    reset();
    setFile(null);
    setPreview(null);
  };

  const positions: { value: TextPosition; label: string }[] = [
    { value: "top", label: "Top" },
    { value: "center", label: "Center" },
    { value: "bottom", label: "Bottom" },
    { value: "topLeft", label: "Top Left" },
    { value: "topRight", label: "Top Right" },
    { value: "bottomLeft", label: "Bottom Left" },
    { value: "bottomRight", label: "Bottom Right" },
  ];

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
              <Label className="text-sm">Overlay Text</Label>
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text to overlay..." className="mt-1 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Text Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                  <span className="text-xs text-muted-foreground">{color}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm">Background</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                  <span className="text-xs text-muted-foreground">{bgColor}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between"><Label className="text-sm">Font Size: {fontSize}px</Label></div>
              <Slider value={[fontSize]} onValueChange={(v) => setFontSize(Array.isArray(v) ? v[0] : v)} min={12} max={100} step={2} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between"><Label className="text-sm">BG Opacity: {bgOpacity}%</Label></div>
              <Slider value={[bgOpacity]} onValueChange={(v) => setBgOpacity(Array.isArray(v) ? v[0] : v)} min={0} max={100} step={5} />
            </div>

            <div>
              <Label className="text-sm">Position</Label>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {positions.map((p) => (
                  <button key={p.value}
                    onClick={() => setPosition(p.value)}
                    className={`p-2 text-xs rounded-lg border transition-all ${
                      position === p.value ? "border-primary bg-primary/5 text-primary" : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleOverlay} className="w-full gap-2 rounded-xl" disabled={!text.trim()}>
            <MessageSquareText className="h-4 w-4" /> Add Text Overlay
          </Button>
        </div>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-medium">Adding text overlay...</p>
        </div>
      )}

      {status === "success" && result && (
        <div className="text-center py-6 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 mx-auto">
            <MessageSquareText className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-lg">Text Added!</p>
            <p className="text-sm text-muted-foreground">{result.message}</p>
          </div>
          {result.outputUrl && (
            <img src={result.outputUrl} alt="With Text" className="max-w-xs mx-auto rounded-lg border" />
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