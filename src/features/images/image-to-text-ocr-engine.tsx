"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, Copy, Check, Trash2, Languages, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProcessing } from "@/hooks/use-processing";
import type { ProcessingResult } from "@/lib/processing/types";

// Simple client-side OCR using canvas pixel analysis
// For production, this would use Tesseract.js or a server-side OCR API
function performOCR(imageDataUrl: string, language: string): Promise<ProcessingResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve({ status: "error", error: "Unable to process image" }); return; }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Extract text regions by analyzing pixel density
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;

      // Simple OCR: detect dark pixels and group them into character-like regions
      const threshold = 128;
      const charRegions: { x: number; y: number; w: number; h: number }[] = [];
      const visited = new Set<string>();

      // Scan for dark pixel clusters
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          const idx = (y * width + x) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

          if (gray < threshold && !visited.has(`${x},${y}`)) {
            // Found a dark pixel - flood fill to find region bounds
            let minX = x, maxX = x, minY = y, maxY = y;
            const stack = [[x, y]];

            while (stack.length > 0) {
              const [cx, cy] = stack.pop()!;
              const key = `${cx},${cy}`;
              if (visited.has(key) || cx < 0 || cy < 0 || cx >= width || cy >= height) continue;

              const cidx = (cy * width + cx) * 4;
              const cgray = (data[cidx] + data[cidx + 1] + data[cidx + 2]) / 3;
              if (cgray >= threshold) continue;

              visited.add(key);
              minX = Math.min(minX, cx);
              maxX = Math.max(maxX, cx);
              minY = Math.min(minY, cy);
              maxY = Math.max(maxY, cy);

              stack.push([cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]);
            }

            const w = maxX - minX;
            const h = maxY - minY;
            if (w > 3 && h > 5 && w < width * 0.8 && h < height * 0.3) {
              charRegions.push({ x: minX, y: minY, w, h });
            }
          }
        }
      }

      // Sort regions by position (top-to-bottom, left-to-right)
      charRegions.sort((a, b) => {
        const rowDiff = a.y - b.y;
        if (Math.abs(rowDiff) < 20) return a.x - b.x;
        return rowDiff;
      });

      // Group into lines
      const lines: { x: number; y: number; w: number; h: number }[][] = [];
      let currentLine: typeof charRegions = [];
      let lastY = -100;

      for (const region of charRegions) {
        if (Math.abs(region.y - lastY) > 20 && currentLine.length > 0) {
          lines.push([...currentLine]);
          currentLine = [];
        }
        currentLine.push(region);
        lastY = region.y;
      }
      if (currentLine.length > 0) lines.push(currentLine);

      // Generate placeholder text based on detected regions
      const resultLines: string[] = [];
      for (const line of lines) {
        const avgHeight = line.reduce((s, r) => s + r.h, 0) / line.length;
        const charCount = Math.max(1, Math.round(line.length * 0.8));

        // Generate readable placeholder based on region count
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?";
        let text = "";
        for (let i = 0; i < charCount; i++) {
          text += chars[Math.floor(Math.random() * chars.length)];
        }
        resultLines.push(text.trim());
      }

      // For a real implementation, this would use Tesseract.js
      const mockResult = resultLines.length > 0
        ? `[OCR detected ${charRegions.length} character regions across ${lines.length} lines]\n\nFor production OCR, integrate Tesseract.js or a cloud OCR API.\n\nDetected text regions suggest approximately ${resultLines.reduce((s, l) => s + l.length, 0)} characters of content.`
        : "No text regions detected in the image. Try a clearer image with dark text on a light background.";

      resolve({
        status: "success",
        message: `Detected ${charRegions.length} character regions`,
        data: mockResult,
      });
    };
    img.src = imageDataUrl;
  });
}

const LANGUAGES = [
  { value: "eng", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "jpn", label: "Japanese" },
  { value: "kor", label: "Korean" },
  { value: "ara", label: "Arabic" },
  { value: "hin", label: "Hindi" },
  { value: "por", label: "Portuguese" },
  { value: "rus", label: "Russian" },
  { value: "ita", label: "Italian" },
];

export function ImageToTextOCREngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [language, setLanguage] = useState("eng");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, process, reset: resetProcessing } = useProcessing();

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") return;
    setFile(f);
    resetProcessing();
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, [resetProcessing]);

  const handleExtract = async () => {
    if (!preview) return;
    await process(() => performOCR(preview, language));
  };

  const handleCopy = async () => {
    if (result?.data) {
      await navigator.clipboard.writeText(result.data as string);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result?.data) return;
    const blob = new Blob([result.data as string], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `ocr-result-${Date.now()}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    resetProcessing();
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
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop an image to extract text</p>
          <p className="text-sm text-muted-foreground">JPG, PNG, WebP, or PDF. OCR works best with clear, high-contrast images.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/bmp,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </div>
      )}

      {status === "idle" && file && preview && (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={handleReset}>
                <Trash2 className="h-3 w-3 mr-1" /> Remove
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1">
              <Languages className="h-3.5 w-3.5" /> Language
            </Label>
            <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleExtract} className="w-full gap-2">
            <FileText className="h-4 w-4" /> Extract Text
          </Button>
        </div>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Analyzing image and extracting text...</p>
        </div>
      )}

      {status === "success" && result?.data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" /> Extracted Text
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" /> TXT
              </Button>
            </div>
          </div>
          <div className="border rounded-lg p-4 bg-muted/30 max-h-[400px] overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-sans">{String(result.data)}</pre>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>Extract Another</Button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">{error || "OCR extraction failed"}</p>
          <Button variant="outline" size="sm" onClick={handleReset}>Try Again</Button>
        </div>
      )}
    </div>
  );
}