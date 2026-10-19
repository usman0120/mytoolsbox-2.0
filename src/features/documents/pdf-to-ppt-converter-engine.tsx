"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { extractPdfPages } from "@/lib/documents/pdf-text-extractor";
import { createPptxBlob, createTextSlides, PptxSlide } from "@/lib/documents/openxml-builder";

export function PDFToPPTConverterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [slides, setSlides] = useState<PptxSlide[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF presentation or document.");
      return;
    }

    setFile(selected);
    setConvertedBlob(null);
    setConvertedUrl(null);
    setSlides([]);
  };

  const handleConvert = async () => {
    if (!file || isConverting) return;
    setIsConverting(true);
    setConvertedBlob(null);
    setConvertedUrl(null);
    setSlides([]);

    try {
      const pages = await extractPdfPages(file);

      const generatedSlides = createTextSlides(pages);
      const blob = await createPptxBlob(generatedSlides);
      const url = URL.createObjectURL(blob);

      setSlides(generatedSlides);
      setConvertedBlob(blob);
      setConvertedUrl(url);
      toast.success(`Generated ${generatedSlides.length} text slides as PowerPoint (.pptx)!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl || !file) return;
    const a = document.createElement("a");
    a.href = convertedUrl;
    const base = file.name.replace(/\.pdf$/i, "");
    a.download = `${base}.pptx`;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setConvertedBlob(null);
    setConvertedUrl(null);
    setSlides([]);
  };

  useEffect(() => {
    return () => {
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, [convertedUrl]);

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Upload Drop Zone */}
      {!file && (
        <div
          className="border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer border-border hover:border-primary/50 hover:bg-muted/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mx-auto mb-4">
            <Presentation className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Upload PDF to Convert to PowerPoint (.pptx)</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Export extracted PDF text as editable slides. Original layouts and images are not preserved.
          </p>
          <Button variant="outline" onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-lg">
            <Plus className="h-4 w-4 mr-1.5" /> Select PDF Document
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Workspace */}
      {file && (
        <section aria-label="PowerPoint export" className="min-w-0">
          <div className="p-4 bg-muted/40 border-b border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
                <Presentation className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isConverting}
              className="text-xs h-8 text-destructive hover:text-destructive rounded-lg"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Change Document
            </Button>
          </div>

          <div className="py-4 space-y-4">
            <details className="border-b border-border/50 pb-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-semibold text-foreground">PowerPoint conversion details</summary>
              <p>
                Extractable text is paginated across widescreen (16:9) slides. A PDF page may produce multiple slides. Original layouts, images, and formatting are not preserved; scanned pages require OCR.
              </p>
            </details>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleConvert}
                disabled={isConverting}
                className="rounded-xl px-6 font-semibold"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Slides...
                  </>
                ) : (
                  <>
                    <Presentation className="h-4 w-4 mr-2" /> Convert to PowerPoint (.pptx)
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {convertedBlob && convertedUrl && (
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">PowerPoint Presentation Ready!</h4>
                <p className="text-xs text-muted-foreground">
                  {slides.length} slides generated • {(convertedBlob.size / 1024).toFixed(1)} KB • OpenXML .pptx
                </p>
              </div>
            </div>

            <Button
              size="sm"
              className="rounded-xl h-10 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" /> Download .PPTX Presentation
            </Button>
          </div>

          {/* Slide Deck Summary */}
          {slides.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {slides.slice(0, 4).map((s, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-background border border-border/60">
                  <div className="font-bold text-foreground truncate">Slide {idx + 1}: {s.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {s.bullets.length} bullet point(s)
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}