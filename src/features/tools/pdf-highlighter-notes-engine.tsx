"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FileText, Upload, Loader2, Copy, CheckCircle2, XCircle,
  Highlighter, Download, Palette, Trash2,
} from "lucide-react";

interface Highlight {
  id: string;
  text: string;
  color: string;
  page: number;
  note: string;
}

const COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa"];

export function PDFHighlighterNotesEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null);
  const [noteText, setNoteText] = useState("");
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setError(null);

    if (selected.type !== "application/pdf" && !selected.name.endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setError("PDF file size must be under 50MB.");
      return;
    }

    setFile(selected);

    // Extract text from PDF using basic parsing
    try {
      const arrayBuffer = await selected.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const textContent = extractTextFromPDF(uint8Array);
      setText(textContent);
      toast.success("PDF loaded successfully!");
    } catch (err) {
      setError("Failed to extract text from PDF. The file may be scanned or image-based.");
      toast.error("PDF extraction failed");
    }
  }, []);

  const handleTextSelect = useCallback(() => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selected = text.substring(start, end);
      setSelectedText(selected);
      setSelectedRange([start, end]);
    } else {
      setSelectedText("");
      setSelectedRange(null);
    }
  }, [text]);

  const addHighlight = useCallback(() => {
    if (!selectedRange || !selectedText) {
      setError("Please select some text first.");
      return;
    }

    const highlight: Highlight = {
      id: crypto.randomUUID(),
      text: selectedText,
      color: activeColor,
      page: 1,
      note: noteText,
    };

    setHighlights((prev) => [...prev, highlight]);
    setNoteText("");
    setSelectedText("");
    setSelectedRange(null);
    setError(null);
    toast.success("Highlight added!");
  }, [selectedRange, selectedText, noteText, activeColor]);

  const removeHighlight = useCallback((id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
    toast.success("Highlight removed.");
  }, []);

  const exportNotes = useCallback(() => {
    if (highlights.length === 0) {
      setError("No highlights to export.");
      return;
    }

    const exportText = highlights
      .map((h) => `📌 Highlight:\n"${h.text}"\n${h.note ? `📝 Note: ${h.note}\n` : ""}---`)
      .join("\n\n");

    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pdf_highlights.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Notes exported!");
  }, [highlights]);

  const handleCopy = useCallback(async () => {
    const exportText = highlights
      .map((h) => `"${h.text}"${h.note ? ` — ${h.note}` : ""}`)
      .join("\n");
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    toast.success("Highlights copied!");
    setTimeout(() => setCopied(false), 2000);
  }, [highlights]);

  // Render text with highlights
  const renderHighlightedText = () => {
    if (highlights.length === 0 || !text) {
      return <p className="text-sm whitespace-pre-wrap">{text || "PDF text will appear here..."}</p>;
    }

    const sorted = [...highlights].sort((a, b) => {
      const aIdx = text.indexOf(a.text);
      const bIdx = text.indexOf(b.text);
      return aIdx - bIdx;
    });

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const h of sorted) {
      const idx = text.indexOf(h.text, lastIndex);
      if (idx === -1) continue;

      if (idx > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{text.substring(lastIndex, idx)}</span>
        );
      }
      elements.push(
        <span
          key={h.id}
          style={{ backgroundColor: h.color }}
          className="rounded px-0.5 cursor-pointer relative group"
          title={h.note || h.text}
        >
          {h.text}
          {h.note && (
            <span className="absolute -top-6 left-0 hidden group-hover:block bg-background border rounded px-2 py-0.5 text-xs shadow z-10 whitespace-nowrap">
              {h.note}
            </span>
          )}
        </span>
      );
      lastIndex = idx + h.text.length;
    }

    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>
      );
    }

    return <p className="text-sm whitespace-pre-wrap leading-relaxed">{elements}</p>;
  };

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <Highlighter className="h-3.5 w-3.5" /> PDF Highlighter & Notes
      </Badge>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {file ? (
              <div className="space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="font-medium">Drop PDF here or click to browse</p>
                <p className="text-sm text-muted-foreground">Max 50MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Highlight controls */}
      {text && selectedText && (
        <Card className="border-primary/50">
          <CardContent className="py-3 space-y-3">
            <div>
              <p className="text-xs font-medium mb-1">Selected: &ldquo;{selectedText.substring(0, 50)}{selectedText.length > 50 ? "..." : ""}&rdquo;</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Note (optional)</label>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="min-h-15"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Color</label>
              <div className="flex gap-1.5">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      activeColor === color ? "border-primary scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button onClick={addHighlight} size="sm" className="gap-1.5">
              <Highlighter className="h-3.5 w-3.5" />
              Add Highlight
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text preview */}
      {text && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Document Text</CardTitle>
              <span className="text-xs text-muted-foreground">
                {highlights.length} highlight{highlights.length !== 1 ? "s" : ""}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-100 overflow-y-auto">
              {renderHighlightedText()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Highlights list */}
      {highlights.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Your Highlights & Notes</CardTitle>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5">
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={exportNotes} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highlights.map((h) => (
                <div key={h.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                  <div
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: h.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">&ldquo;{h.text.substring(0, 100)}{h.text.length > 100 ? "..." : ""}&rdquo;</p>
                    {h.note && (
                      <p className="text-xs text-muted-foreground mt-0.5">📝 {h.note}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive shrink-0"
                    onClick={() => removeHighlight(h.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Basic PDF text extraction (handles simple text-based PDFs)
function extractTextFromPDF(data: Uint8Array): string {
  const text = new TextDecoder("utf-8").decode(data);

  // Look for text between BT and ET markers (PDF text objects)
  const textBlocks: string[] = [];
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;

  while ((match = btRegex.exec(text)) !== null) {
    const block = match[1];
    // Extract text from Tj, TJ, ' operators
    const tjRegex = /\((.*?)\)\s*Tj/g;
    const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;

    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textBlocks.push(tjMatch[1]);
    }

    let tjArrMatch;
    while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
      const arrContent = tjArrMatch[1];
      const strRegex = /\((.*?)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(arrContent)) !== null) {
        textBlocks.push(strMatch[1]);
      }
    }
  }

  if (textBlocks.length > 0) {
    return textBlocks.join(" ");
  }

  // Fallback: try to extract readable text
  const readable = text
    .replace(/[^\x20-\x7E\n\r\t]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (readable.length > 100) {
    return readable.substring(0, 50000);
  }

  return "Could not extract text from this PDF. The file may be scanned/image-based or use unsupported encoding.";
}