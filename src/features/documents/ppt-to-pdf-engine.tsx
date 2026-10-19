"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  Presentation,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Palette,
  Eye,
  Layers,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pptToPDF, PptToPdfOptions } from "@/features/documents/ppt-to-pdf";
import { parsePptxSlides, PptxSlide } from "@/lib/documents/openxml-builder";

export function PPTToPDFEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<PptxSlide[]>([]);
  const [theme, setTheme] = useState<"clean-light" | "modern-navy" | "dark-slate">("clean-light");

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("presentation.pdf");
  const [successMsg, setSuccessMsg] = useState("");

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (f: File) => {
    const isPpt = f.name.toLowerCase().endsWith(".pptx") || f.name.toLowerCase().endsWith(".ppt");
    if (!isPpt) {
      setError("Please select a PowerPoint file (.pptx or .ppt).");
      return;
    }

    setLoading(true);
    setError(null);
    setOutputUrl(null);
    setSlides([]);

    try {
      const parsed = await parsePptxSlides(f);
      if (parsed.length === 0) {
        throw new Error("Could not extract any slides from this PowerPoint file.");
      }
      setFile(f);
      setSlides(parsed);
      setDownloadName(`${f.name.replace(/\.[^.]+$/, "")}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse PowerPoint presentation.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConvert = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);

    try {
      const res = await pptToPDF(file, { theme });
      if (res.status === "success" && res.outputUrl) {
        setOutputUrl(res.outputUrl);
        setDownloadName((res.data as { downloadName?: string })?.downloadName || "presentation.pdf");
        setSuccessMsg(res.message || "Converted to PDF!");
      } else {
        setError(res.error || "Failed to convert presentation to PDF.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert PPT to PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = downloadName;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setOutputUrl(null);
    setError(null);
    setSlides([]);
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
            PowerPoint (.pptx) to PDF Converter
          </Badge>
          <span className="text-xs text-muted-foreground">
            Convert PowerPoint presentations into 16:9 widescreen PDF slide decks with themes
          </span>
        </div>
        {file && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" /> Start Over
          </Button>
        )}
      </div>

      {!file && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer ${
            dragOver ? "border-orange-500 bg-orange-500/5 scale-[0.99]" : "border-border/60 hover:border-orange-500/40 bg-card/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 ring-1 ring-orange-500/20 text-orange-600">
            <Presentation className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base mb-1">Drop your PowerPoint presentation (.pptx)</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Unpacks all slide titles and bullet points, and generates high quality 16:9 PDF presentation slides in your browser.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <Button onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-lg gap-2 bg-orange-600 hover:bg-orange-700 text-white">
            <Upload className="h-4 w-4" /> Select Presentation
          </Button>
        </div>
      )}

      {loading && (
        <div className="py-12 text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Unpacking slides from PowerPoint package...</p>
        </div>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {file && !loading && (
        <div className="space-y-6">
          {/* Header Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 shrink-0">
                <Presentation className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{slides.length} slide(s) extracted</span>
                </div>
              </div>
            </div>

            {outputUrl ? (
              <Button onClick={handleDownload} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="h-4 w-4" /> Download PDF Slide Deck
              </Button>
            ) : (
              <Button onClick={handleConvert} disabled={processing} className="gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white">
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Rendering Slides...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Convert to PDF Slides
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Success Banner */}
          {outputUrl && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">PDF Slide Deck Generated!</p>
                    <p className="text-xs text-muted-foreground">{successMsg}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDownload} className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="h-3.5 w-3.5" /> Download ({downloadName})
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(outputUrl, "_blank")} className="rounded-xl gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Preview PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Theme Selector */}
          <section aria-label="Slide theme">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-orange-600" />
                <Label className="text-xs font-semibold">Choose Presentation Slide Theme:</Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "clean-light", label: "Clean Corporate (Light)", desc: "Blue banner on crisp light background", bg: "bg-white border-blue-500/30 text-blue-900" },
                  { id: "modern-navy", label: "Modern Navy (Dark)", desc: "Deep navy background with cyan accents", bg: "bg-blue-950 border-blue-400/40 text-blue-100" },
                  { id: "dark-slate", label: "Dark Slate (OLED)", desc: "Charcoal background with warm amber accents", bg: "bg-zinc-900 border-zinc-700 text-zinc-100" },
                ].map((th) => (
                  <button
                    type="button"
                    aria-pressed={theme === th.id}
                    key={th.id}
                    onClick={() => setTheme(th.id as typeof theme)}
                    className={`min-h-11 p-3 rounded-lg border text-left transition-colors ${
                      theme === th.id
                        ? "border-orange-600 ring-2 ring-orange-500/30 bg-orange-500/5 shadow-xs"
                        : "border-border/60 hover:border-orange-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">{th.label}</p>
                      {theme === th.id && <span className="h-2 w-2 rounded-full bg-orange-600" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{th.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Slide Deck Grid Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-orange-600" />
              <h4 className="text-xs font-semibold">Slide Deck Outline ({slides.length} Slides)</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {slides.map((s, sIdx) => {
                const items = s.bullets || s.body || [];
                return (
                  <Card key={s.slideNumber || sIdx} className="border-border/50 hover:border-orange-500/30 transition-colors">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                        <span className="text-[11px] font-bold text-orange-600">Slide {s.slideNumber || sIdx + 1}</span>
                        <span className="text-[10px] text-muted-foreground">{items.length} item(s)</span>
                      </div>
                      <p className="text-xs font-semibold line-clamp-1">{s.title || "(Untitled Slide)"}</p>
                      <div className="space-y-1 text-[11px] text-muted-foreground line-clamp-3">
                        {items.length > 0 ? (
                          items.slice(0, 3).map((item: string, idx: number) => (
                            <p key={idx} className="truncate">• {item}</p>
                          ))
                        ) : (
                          <p className="italic text-[10px]">Graphics / chart slide</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}