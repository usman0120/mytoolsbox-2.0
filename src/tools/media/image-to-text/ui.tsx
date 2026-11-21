"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  Download,
  Copy,
  Check,
  Trash2,
  Languages,
  Sparkles,
  Zap,
  Sliders,
  AlignLeft,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const LANGUAGES = [
  { value: "eng", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "jpn", label: "Japanese" },
  { value: "ara", label: "Arabic" },
  { value: "hin", label: "Hindi" },
  { value: "por", label: "Portuguese" },
  { value: "rus", label: "Russian" },
  { value: "ita", label: "Italian" },
];

export function ImageToTextOCREngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [engineMode, setEngineMode] = useState<"ai" | "tesseract">("ai");
  const [language, setLanguage] = useState("eng");
  const [autoEnhance, setAutoEnhance] = useState(true);

  // Status & Results
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [extractedText, setExtractedText] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadFile = (f: File) => {
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") return;
    setFile(f);
    setExtractedText("");
    setProgressMsg("");
    setProgressPercent(0);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  // Pre-process canvas for OCR (Binarization & contrast stretch)
  const preprocessImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        // Binarize high-contrast
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const val = lum < 140 ? 0 : 255;
          d[i] = val;
          d[i + 1] = val;
          d[i + 2] = val;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleExtractText = async () => {
    if (!preview) return;
    setIsProcessing(true);
    setProgressMsg("Preparing image...");
    setProgressPercent(10);

    const imageToScan = autoEnhance ? await preprocessImage(preview) : preview;

    if (engineMode === "ai") {
      setProgressMsg("Querying neural vision OCR model...");
      setProgressPercent(40);

      try {
        const langObj = LANGUAGES.find((l) => l.value === language);
        const langName = langObj ? langObj.label : "English";

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Transcribe and extract ALL text, numbers, labels, tables, and handwritten/printed content from this image verbatim.
Language expected: ${langName}.
Maintain original layout, paragraph breaks, and table structure where applicable. Output ONLY the extracted text with no conversational preamble.`,
          }),
        });

        setProgressPercent(80);

        if (res.ok) {
          const json = await res.json();
          if (json.text) {
            setExtractedText(json.text.trim());
            setIsProcessing(false);
            setProgressPercent(100);
            return;
          }
        }
      } catch {
        // Fallback to Tesseract if AI route fails
      }
    }

    // Tesseract.js Client-side local OCR
    try {
      setProgressMsg("Loading Tesseract OCR engine...");
      setProgressPercent(25);

      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(language, 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setProgressMsg(`Recognizing text (${Math.round(m.progress * 100)}%)...`);
            setProgressPercent(30 + Math.round(m.progress * 65));
          } else if (m.status) {
            setProgressMsg(`${m.status}...`);
          }
        },
      });

      const ret = await worker.recognize(imageToScan);
      await worker.terminate();

      const text = ret.data.text.trim();
      setExtractedText(text || "No legible text found in this document.");
      setProgressPercent(100);
    } catch (err: unknown) {
      console.error("OCR execution error:", err);
      setExtractedText("Failed to process OCR. Please check that the image contains clear, legible text.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!extractedText) return;
    await navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = file?.name.replace(/\.[^.]+$/, "") || "ocr_result";
    a.download = `${base}_extracted.txt`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!extractedText) return;
    const data = {
      filename: file?.name || "image",
      extractedAt: new Date().toISOString(),
      language,
      wordCount: extractedText.split(/\s+/).filter(Boolean).length,
      text: extractedText,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = file?.name.replace(/\.[^.]+$/, "") || "ocr_result";
    a.download = `${base}_ocr.json`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCleanFormatting = () => {
    if (!extractedText) return;
    // Remove extra line breaks, fix hyphens
    const cleaned = extractedText
      .replace(/(\w+)-\n(\w+)/g, "$1$2")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    setExtractedText(cleaned);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setExtractedText("");
    setIsProcessing(false);
  };

  const words = extractedText.split(/\s+/).filter(Boolean).length;
  const chars = extractedText.length;

  return (
    <div className="space-y-6">
      {!file && (
        <div
          className="border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 border-muted-foreground/25"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) handleLoadFile(e.dataTransfer.files[0]);
          }}
        >
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Optical Character Recognition (OCR)</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Extract text from scanned documents, receipts, invoices, book pages, and screenshots into editable text.
          </p>
          <Button variant="outline" className="rounded-xl shadow-xs">
            Browse Document or Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleLoadFile(e.target.files[0])}
          />
        </div>
      )}

      {file && preview && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls & Image Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl border bg-card/60 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">OCR Engine Mode</h4>
                  <p className="text-xs text-muted-foreground">Select transcription pipeline</p>
                </div>
                <div className="flex gap-1 p-1 bg-muted rounded-xl">
                  <Button
                    size="sm"
                    variant={engineMode === "ai" ? "default" : "ghost"}
                    className="h-8 rounded-lg text-xs"
                    onClick={() => setEngineMode("ai")}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-yellow-500" /> AI Vision
                  </Button>
                  <Button
                    size="sm"
                    variant={engineMode === "tesseract" ? "default" : "ghost"}
                    className="h-8 rounded-lg text-xs"
                    onClick={() => setEngineMode("tesseract")}
                  >
                    <Zap className="h-3.5 w-3.5 mr-1" /> Browser OCR
                  </Button>
                </div>
              </div>

              {/* Language selection */}
              <div className="space-y-1.5 pt-2 border-t">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Languages className="h-3.5 w-3.5" /> Document Language
                </Label>
                <select
                  aria-label="Document Language Selection"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full text-xs rounded-xl border bg-background px-3 py-2"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pre-processing */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="enhance-toggle" className="text-xs font-medium">
                    Auto-Binarize & Contrast Stretch
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Cleans faint or blurry document text</p>
                </div>
                <Switch id="enhance-toggle" checked={autoEnhance} onCheckedChange={setAutoEnhance} />
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t">
                <Button
                  onClick={handleExtractText}
                  disabled={isProcessing}
                  className="w-full gap-2 rounded-xl font-medium"
                >
                  <FileText className="h-4 w-4" />
                  {isProcessing ? "Extracting Text..." : "Extract Text Now"}
                </Button>
              </div>
            </div>

            {/* Document Thumbnail Preview */}
            <div className="p-3 border rounded-2xl bg-card space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground truncate max-w-[200px]">{file.name}</span>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 text-xs text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden max-h-52 bg-muted/40 flex items-center justify-center border">
                <img src={preview} alt="Document" className="max-h-52 w-auto object-contain" />
              </div>
            </div>
          </div>

          {/* Extracted Text Editor & Actions */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="p-5 rounded-2xl border bg-card flex flex-col justify-between min-h-[460px] shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b">
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-1.5">
                      <AlignLeft className="h-4 w-4 text-primary" /> Extracted Text Content
                    </h4>
                    {extractedText && (
                      <p className="text-[11px] text-muted-foreground">
                        {words} words · {chars} characters
                      </p>
                    )}
                  </div>

                  {extractedText && (
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="outline" onClick={handleCleanFormatting} className="h-7 text-xs rounded-lg">
                        Clean Layout
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 text-xs rounded-lg">
                        {copied ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  )}
                </div>

                {isProcessing && (
                  <div className="py-20 text-center space-y-3">
                    <div className="h-9 w-9 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="font-medium text-xs text-foreground">{progressMsg}</p>
                    <div className="w-48 bg-muted rounded-full h-1.5 mx-auto overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {!isProcessing && !extractedText && (
                  <div className="py-24 text-center text-muted-foreground space-y-2">
                    <FileText className="h-10 w-10 mx-auto opacity-30" />
                    <p className="text-xs">Click &quot;Extract Text Now&quot; to scan and transcribe this document.</p>
                  </div>
                )}

                {!isProcessing && extractedText && (
                  <Textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="min-h-[320px] rounded-xl text-xs font-mono leading-relaxed resize-none bg-background/80"
                    placeholder="Extracted text will appear here..."
                  />
                )}
              </div>

              {extractedText && (
                <div className="flex gap-2 pt-3 border-t">
                  <Button onClick={handleDownloadTxt} className="flex-1 rounded-xl gap-1.5 text-xs font-medium">
                    <Download className="h-4 w-4" /> Save as .TXT
                  </Button>
                  <Button variant="outline" onClick={handleDownloadJson} className="rounded-xl gap-1.5 text-xs">
                    <FileCode className="h-4 w-4" /> Save as .JSON
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}