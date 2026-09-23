"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  Download,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  FileDown,
  Trash2,
  Copy,
  Check,
  Printer,
  Sparkles,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createDocxBlob, parseDocxText } from "@/lib/documents/openxml-builder";
import { extractPdfPages } from "@/lib/documents/pdf-text-extractor";

export function ONLYOFFICEEditorEngine() {
  const [docTitle, setDocTitle] = useState("Untitled Document");
  const [content, setContent] = useState(
    "Welcome to ONLYOFFICE Document Suite.\n\nStart typing or upload an existing Word, PDF, or text file to edit directly in your browser.\n\nYou can format text, organize sections, and export to genuine Word (.docx), PDF, or Markdown."
  );
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 350));

  // Format insertion helpers
  const applyPrefix = (prefix: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const replacement = `${prefix} ${selected || "Heading"}\n`;
    setContent(before + replacement + after);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 20);
  };

  const applyWrap = (wrapChar: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;

    const before = text.substring(0, start);
    const selected = text.substring(start, end) || "text";
    const after = text.substring(end);

    setContent(`${before}${wrapChar}${selected}${wrapChar}${after}`);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 20);
  };

  // Upload and open document
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      setDocTitle(file.name.replace(/\.[^/.]+$/, ""));

      if (ext === "docx") {
        const text = await parseDocxText(file);
        setContent(text);
        toast.success(`Loaded Word document: ${file.name}`);
      } else if (ext === "pdf") {
        const pages = await extractPdfPages(file);
        const text = pages.map((p) => p.text).join("\n\n");
        setContent(text);
        toast.success(`Extracted text from PDF: ${file.name}`);
      } else {
        const text = await file.text();
        setContent(text);
        toast.success(`Loaded file: ${file.name}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open document.");
    }
  };

  // Export to Genuine DOCX
  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      const paragraphs = content.split("\n").map((line) => {
        const isH1 = line.startsWith("# ");
        const isH2 = line.startsWith("## ");
        const clean = line.replace(/^#{1,3}\s/, "");
        return {
          text: clean,
          isHeading: isH1 || isH2,
          fontSize: isH1 ? 32 : isH2 ? 28 : 24,
          isBold: isH1 || isH2,
        };
      });

      const blob = await createDocxBlob(paragraphs, docTitle);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docTitle || "document"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded genuine Word (.docx) file!");
    } catch {
      toast.error("Failed to generate DOCX.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export to Typeset PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = await PDFDocument.create();
      const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

      const margin = 54;
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const maxWidth = pageWidth - margin * 2;
      const lineHeight = 16;

      let currentPage = pdf.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Draw document title
      currentPage.drawText(docTitle, {
        x: margin,
        y: currentY,
        size: 20,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.4),
      });
      currentY -= 28;

      const lines = content.split("\n");

      for (const line of lines) {
        const isH1 = line.startsWith("# ");
        const isH2 = line.startsWith("## ");
        const clean = line.replace(/^#{1,3}\s/, "").trim();

        if (!clean) {
          currentY -= lineHeight * 0.75;
          continue;
        }

        const font = isH1 || isH2 ? fontBold : fontRegular;
        const size = isH1 ? 14 : isH2 ? 12 : 10;
        const words = clean.split(/\s+/);
        let cur = "";

        for (const w of words) {
          const cand = cur ? `${cur} ${w}` : w;
          const wWidth = font.widthOfTextAtSize(cand, size);
          if (wWidth > maxWidth && cur) {
            if (currentY < margin + lineHeight) {
              currentPage = pdf.addPage([pageWidth, pageHeight]);
              currentY = pageHeight - margin;
            }
            currentPage.drawText(cur, {
              x: margin,
              y: currentY,
              size,
              font,
              color: isH1 || isH2 ? rgb(0.1, 0.2, 0.35) : rgb(0.15, 0.15, 0.15),
            });
            currentY -= isH1 ? 20 : lineHeight;
            cur = w;
          } else {
            cur = cand;
          }
        }

        if (cur) {
          if (currentY < margin + lineHeight) {
            currentPage = pdf.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
          currentPage.drawText(cur, {
            x: margin,
            y: currentY,
            size,
            font,
            color: isH1 || isH2 ? rgb(0.1, 0.2, 0.35) : rgb(0.15, 0.15, 0.15),
          });
          currentY -= isH1 ? 22 : lineHeight;
        }
      }

      const bytes = await pdf.save({ useObjectStreams: true });
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docTitle || "document"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded typeset PDF!");
    } catch {
      toast.error("Failed to generate PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Document text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Document Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/60 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="text-base font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-hidden px-1 py-0.5 max-w-xs sm:max-w-md truncate"
            placeholder="Document Title"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs h-9 rounded-xl gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" /> Open File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.pdf,.txt,.md"
            className="hidden"
            onChange={handleUpload}
          />

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer outline-none shadow-xs">
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 text-xs shadow-xl">
              <DropdownMenuItem onClick={handleExportDocx} className="gap-2 cursor-pointer rounded-xl p-2 font-medium">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Microsoft Word (.docx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer rounded-xl p-2 font-medium">
                <FileDown className="h-4 w-4 text-red-500" />
                <span>PDF Document (.pdf)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const blob = new Blob([content], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${docTitle}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="gap-2 cursor-pointer rounded-xl p-2"
              >
                <FileCheck2 className="h-4 w-4 text-amber-500" />
                <span>Markdown (.md)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Formatting Ribbon */}
      <div className="flex flex-wrap items-center gap-1 p-2 rounded-xl bg-muted/40 border border-border/50 text-xs">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => applyPrefix("#")} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => applyPrefix("##")} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border/60 mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => applyWrap("**")} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => applyWrap("*")} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => applyWrap("__")} title="Underline">
          <Underline className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border/60 mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => applyPrefix("- ")} title="Bullet List">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => applyPrefix("1. ")} title="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-2 text-muted-foreground text-[11px] font-mono pr-1">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} chars</span>
          <span>•</span>
          <span>~{estimatedPages} {estimatedPages === 1 ? "page" : "pages"}</span>
        </div>
      </div>

      {/* Document Workspace Canvas */}
      <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 sm:p-8 flex justify-center shadow-inner min-h-[500px]">
        <div className="w-full max-w-3xl bg-background rounded-xl border border-border shadow-lg p-6 sm:p-12 min-h-[600px] flex flex-col">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your document content here..."
            className="w-full flex-1 resize-none bg-transparent text-sm sm:text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-hidden font-normal"
          />
        </div>
      </div>
    </div>
  );
}