"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  FileType,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { HelpDisclosure } from "@/components/common/workload-layouts";
import { Badge } from "@/components/ui/badge";
import { convertRawTextToDocx } from "@/features/documents/txt-to-docx";

const SAMPLE_TEXT = `# Project Scope of Work
Client: Global Logistics Inc. • Version: 2.1

## Overview
This document specifies the architectural implementation of the automated document processing workflow.

### Key Milestones
- Requirements Gathering & Specification Review
- Client-Side Parsing Engine Development (JSZip & PDF-lib)
- User Interface Polish & Responsive Testing
- Production Deployment & End-to-End Verification

## Technical Details
All documents are parsed and assembled directly in the browser using standard Microsoft OpenXML schemas. No sensitive document data is uploaded to remote servers.`;

export function TxtToDocxEngine() {
  const [activeTab, setActiveTab] = useState<"file" | "editor">("file");
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState(SAMPLE_TEXT);
  const [docTitle, setDocTitle] = useState("");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("document.docx");
  const [statusMessage, setStatusMessage] = useState("");

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (f: File) => {
    setError(null);
    setOutputUrl(null);
    setFile(f);
    if (!docTitle) setDocTitle(f.name.replace(/\.[^.]+$/, ""));
    const text = await f.text();
    setTextContent(text);
  }, [docTitle]);

  const handleConvert = async () => {
    const textToProcess = textContent;
    if (!textToProcess.trim()) {
      setError("Please provide text content or upload a text file.");
      return;
    }

    setProcessing(true);
    setError(null);

    const baseName = docTitle.trim() || (file ? file.name.replace(/\.[^.]+$/, "") : "document");

    try {
      const res = await convertRawTextToDocx(textToProcess, baseName, {
        title: docTitle.trim() || undefined,
      });

      if (res.status === "success" && res.outputUrl) {
        setOutputUrl(res.outputUrl);
        setDownloadName((res.data as { downloadName?: string })?.downloadName || `${baseName}.docx`);
        setStatusMessage(res.message || "Converted to Word!");
      } else {
        setError(res.error || "Failed to convert TXT to DOCX.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate Word document.");
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
    setDocTitle("");
  };

  // Quick stats
  const lineCount = textContent.split(/\r?\n/).length;
  const headingCount = (textContent.match(/^#{1,3}\s/gm) || []).length;
  const bulletCount = (textContent.match(/^[-*]\s/gm) || []).length;

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
            TXT to Microsoft Word (.docx)
          </Badge>
          <span className="text-xs text-muted-foreground">
            Convert plain text & markdown into genuine Microsoft Word OpenXML documents (.docx)
          </span>
        </div>
        {(file || outputUrl) && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" /> Start Over
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {outputUrl && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Microsoft Word (.docx) Ready!</p>
                <p className="text-xs text-muted-foreground">{statusMessage}</p>
              </div>
            </div>
            <Button size="sm" onClick={handleDownload} className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Download className="h-3.5 w-3.5" /> Download ({downloadName})
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Left: Dual Input Tabs */}
        <div className="min-w-0 space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
            <TabsList className="grid h-auto grid-cols-1 sm:grid-cols-2 rounded-lg p-1 bg-muted/50 border border-border/50">
              <TabsTrigger value="file" className="rounded-lg gap-2 text-xs sm:text-sm">
                <Upload className="h-4 w-4" /> Upload File (.txt, .md)
              </TabsTrigger>
              <TabsTrigger value="editor" className="rounded-lg gap-2 text-xs sm:text-sm">
                <FileCode className="h-4 w-4" /> Live Text Editor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4">
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    dragOver ? "border-blue-500 bg-blue-500/5 scale-[0.99]" : "border-border/60 hover:border-blue-500/40 bg-card/50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">Drop your text file here</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-3">
                    Accepts .txt, .md, and plain text files. Converts automatically into Word formatting.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.text,text/plain"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
                  />
                  <Button variant="outline" onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-lg">
                    Browse File
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-card border border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileType className="h-7 w-7 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[11px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB • {lineCount} lines</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setFile(null)} className="text-xs h-7">
                      Replace File
                    </Button>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/40 max-h-[220px] overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                    {textContent.slice(0, 1500)}
                    {textContent.length > 1500 && "... (truncated in preview)"}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="editor" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <Label className="text-xs">Direct Text & Markdown Input</Label>
                  <span className="text-muted-foreground">{textContent.length} characters</span>
                </div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Type or paste plain text here..."
                  aria-label="Document text editor"
                  className="w-full min-h-80 rounded-lg border border-border/60 bg-background p-3 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Document Settings & Structure Analysis */}
        <section aria-label="Word document properties" className="min-w-0 space-y-4">
          <div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-1">Document Properties</h4>
                <p className="text-xs text-muted-foreground">Customize output Word document metadata.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Document Title (Heading 1 in Word)</Label>
                <Input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Project Scope of Work"
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-2">
                <p className="text-xs font-semibold">Detected Document Structure</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-background border border-border/50">
                    <p className="text-xs font-bold text-blue-600">{lineCount}</p>
                    <p className="text-[10px] text-muted-foreground">Lines</p>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border/50">
                    <p className="text-xs font-bold text-purple-600">{headingCount}</p>
                    <p className="text-[10px] text-muted-foreground">Headings</p>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border/50">
                    <p className="text-xs font-bold text-emerald-600">{bulletCount}</p>
                    <p className="text-[10px] text-muted-foreground">Bullets</p>
                  </div>
                </div>
              </div>

              <HelpDisclosure title="DOCX compatibility">
                <p className="text-[11px]">
                  Output is a valid Microsoft Word .docx archive containing document.xml, styles.xml, and content types. Fully editable in Word, Google Docs, and LibreOffice.
                </p>
              </HelpDisclosure>

              <Button
                onClick={handleConvert}
                disabled={processing}
                className="w-full py-5 rounded-2xl text-xs sm:text-sm font-semibold shadow-md gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Generating DOCX...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Convert to Word (.docx)
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}