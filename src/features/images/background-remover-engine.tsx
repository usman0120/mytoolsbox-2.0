"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Trash2, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProcessing } from "@/hooks/use-processing";
import { removeBackground } from "@/features/images/background-remover";

export function BackgroundRemoverEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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

  const handleRemove = async () => {
    if (!file) return;
    await process(() => removeBackground(file));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const a = document.createElement("a");
      a.href = result.outputUrl;
      a.download = (result.data as { downloadName?: string } | undefined)?.downloadName || "nobg.png";
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
          <p className="text-sm text-muted-foreground">Best results with solid backgrounds. Output: PNG.</p>
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

          <div className="p-3 rounded-xl bg-muted/30 text-xs text-muted-foreground">
            <p>Background removal works best with:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Solid or uniform backgrounds</li>
              <li>Clear contrast between subject and background</li>
              <li>Output is always PNG (transparency support)</li>
            </ul>
          </div>

          <Button onClick={handleRemove} className="w-full gap-2 rounded-xl">
            <Scissors className="h-4 w-4" /> Remove Background
          </Button>
        </div>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-medium">Removing background...</p>
        </div>
      )}

      {status === "success" && result && (
        <div className="text-center py-6 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 mx-auto">
            <Scissors className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-lg">Background Removed!</p>
            <p className="text-sm text-muted-foreground">{result.message}</p>
          </div>
          {result.outputUrl && (
            <div className="bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2NkYPj/n4EBAwMDg4GBAdNgYmBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgAABqYgYCiQx1FQAAAABJRU5ErkJggg==')] p-2 rounded-lg inline-block">
              <img src={result.outputUrl} alt="No Background" className="max-w-xs mx-auto rounded" />
            </div>
          )}
          <div className="flex gap-2 justify-center">
            <Button onClick={handleDownload} className="gap-2 rounded-xl"><Download className="h-4 w-4" /> Download PNG</Button>
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