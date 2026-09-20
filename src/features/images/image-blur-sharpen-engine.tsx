"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useProcessing } from "@/hooks/use-processing";
import { applyFilter, FilterType } from "@/features/images/image-blur-sharpen";

export function ImageBlurSharpenEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("sharpen");
  const [intensity, setIntensity] = useState(5);
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

  const handleFilter = async () => {
    if (!file) return;
    await process(() => applyFilter(file, { type: filterType, intensity }));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const a = document.createElement("a");
      a.href = result.outputUrl;
      a.download = (result.data as { downloadName?: string } | undefined)?.downloadName || "filtered.jpg";
      a.click();
    }
  };

  const handleReset = () => {
    reset();
    setFile(null);
    setPreview(null);
  };

  const filters: { value: FilterType; label: string; icon: string }[] = [
    { value: "blur", label: "Blur", icon: "🌫️" },
    { value: "sharpen", label: "Sharpen", icon: "✨" },
    { value: "edgeDetect", label: "Edge Detect", icon: "📐" },
    { value: "emboss", label: "Emboss", icon: "🪨" },
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

          <div className="grid grid-cols-2 gap-2">
            {filters.map((f) => (
              <button key={f.value}
                onClick={() => setFilterType(f.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  filterType === f.value ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50 hover:border-primary/30"
                }`}
              >
                <span className="text-xl">{f.icon}</span>
                <p className="font-medium text-sm mt-1">{f.label}</p>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between"><Label className="text-sm">Intensity: {intensity}</Label></div>
            <Slider value={[intensity]} onValueChange={(v) => setIntensity(Array.isArray(v) ? v[0] : v)} min={1} max={10} step={1} />
          </div>

          <Button onClick={handleFilter} className="w-full gap-2 rounded-xl">
            <Sparkles className="h-4 w-4" /> Apply Filter
          </Button>
        </div>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-medium">Applying filter...</p>
        </div>
      )}

      {status === "success" && result && (
        <div className="text-center py-6 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 mx-auto">
            <Sparkles className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-lg">Filter Applied!</p>
            <p className="text-sm text-muted-foreground">{result.message}</p>
          </div>
          {result.outputUrl && (
            <img src={result.outputUrl} alt="Filtered" className="max-w-xs mx-auto rounded-lg border" />
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