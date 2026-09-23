"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Trash2, Download, Search, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  extractTextFromPDF, exportToMarkdown, searchHighlights, sortHighlightsByPosition,
  HIGHLIGHT_COLORS, NOTE_TAGS,
  type Highlight, type HighlightColor, type NoteTag,
} from "@/features/tools/pdf-highlighter-notes";

export function PDFHighlighterNotesEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [pageCount, setPageCount] = useState(1);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null);
  const [noteText, setNoteText] = useState("");
  const [activeColor, setActiveColor] = useState<HighlightColor>("yellow");
  const [activeTag, setActiveTag] = useState<NoteTag>("concept");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.includes("pdf") && !selected.name.endsWith(".pdf")) {
      toast.error("Please select a PDF file.");
      return;
    }
    if (selected.size > 50 * 1024 * 1024) {
      toast.error("File must be under 50MB.");
      return;
    }

    setLoading(true);
    setFile(selected);
    setHighlights([]);

    try {
      const arrayBuffer = await selected.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const result = extractTextFromPDF(uint8Array);
      setText(result.text);
      setPageCount(result.pageCount);
      toast.success(`PDF loaded: ${result.pageCount} page(s), extracted via ${result.method} method.`);
    } catch {
      toast.error("Failed to extract text. The PDF may be scanned.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTextSelect = useCallback(() => {
    const textarea = document.getElementById("pdf-text-area") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      setSelectedText(text.substring(start, end));
      setSelectedRange([start, end]);
    } else {
      setSelectedText("");
      setSelectedRange(null);
    }
  }, [text]);

  const addHighlight = useCallback(() => {
    if (!selectedRange || !selectedText.trim()) {
      toast.error("Select some text in the document first.");
      return;
    }

    const hl: Highlight = {
      id: crypto.randomUUID(),
      text: selectedText.trim(),
      color: activeColor,
      note: noteText.trim(),
      tag: activeTag,
      page: 1,
      startIndex: selectedRange[0],
      endIndex: selectedRange[1],
      createdAt: new Date().toISOString(),
    };

    setHighlights(prev => sortHighlightsByPosition([...prev, hl]));
    setNoteText("");
    setSelectedText("");
    setSelectedRange(null);
    toast.success("Highlight added!");
  }, [selectedRange, selectedText, noteText, activeColor, activeTag]);

  const removeHighlight = (id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
    toast.success("Removed.");
  };

  const exportMarkdown = useCallback(() => {
    if (highlights.length === 0) { toast.error("No highlights to export."); return; }
    const md = exportToMarkdown(file?.name || "Document", highlights);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "study-notes.md"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Study guide exported as Markdown!");
  }, [highlights, file]);

  const visibleHighlights = searchQuery ? searchHighlights(highlights, searchQuery) : highlights;

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      {!file ? (
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Drop a PDF or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">Max 50MB · Text-based PDFs only (not scanned images)</p>
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileSelect} />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-[10px] text-muted-foreground">{pageCount} page(s) · {(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setFile(null); setText(""); setHighlights([]); }}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="animate-spin">⏳</span> Extracting text from PDF...
        </div>
      )}

      {text && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Document text (left, 3 cols) */}
          <div className="lg:col-span-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Document Text</Label>
              <Badge variant="outline" className="text-[10px]">{text.length.toLocaleString()} chars</Badge>
            </div>
            <Textarea
              id="pdf-text-area"
              value={text}
              onChange={e => setText(e.target.value)}
              onMouseUp={handleTextSelect}
              onKeyUp={handleTextSelect}
              className="font-mono text-xs min-h-72 resize-none"
              readOnly={false}
            />
            <p className="text-[10px] text-muted-foreground">Select text above to highlight it.</p>
          </div>

          {/* Annotation panel (right, 2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <Label className="text-xs font-semibold block">Annotation Tool</Label>

            {/* Color picker */}
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Highlight Color</Label>
              <div className="flex gap-1.5 flex-wrap">
                {(Object.entries(HIGHLIGHT_COLORS) as Array<[HighlightColor, string]>).map(([key, hex]) => (
                  <button
                    key={key}
                    onClick={() => setActiveColor(key)}
                    className={`h-7 w-7 rounded-full border-2 transition-all ${activeColor === key ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ background: hex }}
                    title={key}
                  />
                ))}
              </div>
            </div>

            {/* Tag selector */}
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Tag</Label>
              <Select value={activeTag} onValueChange={v => setActiveTag(v as NoteTag)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(NOTE_TAGS) as Array<[NoteTag, { label: string; emoji: string }]>).map(([key, { label, emoji }]) => (
                    <SelectItem key={key} value={key} className="text-xs">{emoji} {label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected text preview */}
            {selectedText && (
              <div className="rounded p-2 text-xs border" style={{ background: HIGHLIGHT_COLORS[activeColor] + "44" }}>
                <p className="text-[10px] text-muted-foreground mb-1">Selected:</p>
                <p className="font-medium line-clamp-3">"{selectedText}"</p>
              </div>
            )}

            {/* Note input */}
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Note (optional)</Label>
              <Textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add a note for this highlight..."
                className="text-xs min-h-16 resize-none"
              />
            </div>

            <Button
              onClick={addHighlight}
              disabled={!selectedText}
              className="w-full gap-1.5"
              size="sm"
            >
              Add Highlight
            </Button>
          </div>
        </div>
      )}

      {/* Highlights list */}
      {highlights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">{highlights.length} Highlight{highlights.length !== 1 ? "s" : ""}</Label>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search highlights..."
                  className="h-7 pl-6 text-xs w-44"
                />
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={exportMarkdown}>
                <Download className="h-3 w-3" /> Study Guide
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {visibleHighlights.map(h => {
              const tagMeta = NOTE_TAGS[h.tag];
              return (
                <Card key={h.id} className="overflow-hidden">
                  <div className="h-1" style={{ background: HIGHLIGHT_COLORS[h.color] }} />
                  <CardContent className="pt-2 pb-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="secondary" className="text-[9px] h-4 gap-0.5">
                            {tagMeta.emoji} {tagMeta.label}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium line-clamp-2">"{h.text}"</p>
                        {h.note && <p className="text-[10px] text-muted-foreground mt-0.5 italic">📝 {h.note}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeHighlight(h.id)}>
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}