"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Highlighter,
  Copy,
  Download,
  Trash2,
  FileText,
  Tag,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface Annotation {
  id: string;
  text: string;
  note: string;
  color: string;
  category: string;
  startIndex: number;
  endIndex: number;
}

const PALETTES = [
  { color: "#fef08a", darkColor: "#713f12", name: "Key Idea", bgClass: "bg-yellow-200 dark:bg-yellow-900/60" },
  { color: "#bbf7d0", darkColor: "#14532d", name: "Action Item", bgClass: "bg-green-200 dark:bg-green-900/60" },
  { color: "#bfdbfe", darkColor: "#1e3a8a", name: "Definition", bgClass: "bg-blue-200 dark:bg-blue-900/60" },
  { color: "#fecaca", darkColor: "#7f1d1d", name: "Question / Review", bgClass: "bg-red-200 dark:bg-red-900/60" },
  { color: "#e9d5ff", darkColor: "#581c87", name: "Key Quote", bgClass: "bg-purple-200 dark:bg-purple-900/60" },
  { color: "#fed7aa", darkColor: "#7c2d12", name: "Urgent", bgClass: "bg-orange-200 dark:bg-orange-900/60" },
];

export function TextAnnotatorEngine() {
  const [input, setInput] = useState(
    "Antigravity is an advanced agentic coding environment built to empower developers. It combines powerful autonomous workflows with an interactive IDE experience. Software developers can seamlessly plan, write, test, and verify complex full-stack applications in record time."
  );
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null);
  const [noteText, setNoteText] = useState("");
  const [activePalette, setActivePalette] = useState(PALETTES[0]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextSelect = useCallback(() => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;

    if (start !== end && start >= 0 && end <= input.length) {
      const selected = input.substring(start, end);
      setSelectedText(selected);
      setSelectedRange([start, end]);
    } else {
      setSelectedText("");
      setSelectedRange(null);
    }
  }, [input]);

  const addAnnotation = useCallback(() => {
    if (!selectedRange || !selectedText.trim()) {
      toast.error("Please highlight some text in the editor first.");
      return;
    }

    const newAnn: Annotation = {
      id: crypto.randomUUID(),
      text: selectedText,
      note: noteText.trim(),
      color: activePalette.color,
      category: activePalette.name,
      startIndex: selectedRange[0],
      endIndex: selectedRange[1],
    };

    setAnnotations((prev) => [...prev, newAnn]);
    setNoteText("");
    setSelectedText("");
    setSelectedRange(null);
    toast.success(`Annotated: "${selectedText.slice(0, 24)}..." as [${activePalette.name}]`);
  }, [selectedRange, selectedText, noteText, activePalette]);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    toast.info("Annotation removed.");
  }, []);

  const handleDownloadMarkdown = () => {
    let md = `# Annotated Document\n\n`;
    const sorted = [...annotations].sort((a, b) => a.startIndex - b.startIndex);

    let lastIdx = 0;
    for (let i = 0; i < sorted.length; i++) {
      const ann = sorted[i];
      md += input.substring(lastIdx, ann.startIndex);
      md += `==${input.substring(ann.startIndex, ann.endIndex)}==[^note${i + 1}]`;
      lastIdx = ann.endIndex;
    }
    md += input.substring(lastIdx);

    md += `\n\n## Notes & Annotations\n\n`;
    sorted.forEach((ann, idx) => {
      md += `[^note${idx + 1}]: **[${ann.category}]** ${ann.note || "No additional note"}\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `annotated-notes-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded annotated Markdown document!");
  };

  const handleCopyMarkdown = async () => {
    let md = "";
    const sorted = [...annotations].sort((a, b) => a.startIndex - b.startIndex);
    let lastIdx = 0;
    for (let i = 0; i < sorted.length; i++) {
      const ann = sorted[i];
      md += input.substring(lastIdx, ann.startIndex);
      md += `==${input.substring(ann.startIndex, ann.endIndex)}== [${ann.category}: ${ann.note || "marked"}]`;
      lastIdx = ann.endIndex;
    }
    md += input.substring(lastIdx);
    await navigator.clipboard.writeText(md);
    toast.success("Copied annotated text to clipboard!");
  };

  // Visual highlight renderer
  const renderHighlightedView = () => {
    if (annotations.length === 0) {
      return <p className="text-sm whitespace-pre-wrap leading-relaxed">{input}</p>;
    }

    const sorted = [...annotations].sort((a, b) => a.startIndex - b.startIndex);
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((ann, idx) => {
      if (ann.startIndex > lastIndex) {
        nodes.push(
          <span key={`text-${lastIndex}`}>{input.substring(lastIndex, ann.startIndex)}</span>
        );
      }

      nodes.push(
        <mark
          key={ann.id}
          style={{ backgroundColor: ann.color }}
          className="rounded px-1 py-0.5 font-medium text-slate-900 dark:text-slate-900 cursor-pointer relative group inline-block"
          title={`${ann.category}${ann.note ? `: ${ann.note}` : ""}`}
        >
          {input.substring(ann.startIndex, ann.endIndex)}
          <span className="text-[10px] ml-1 opacity-75 font-mono">[{idx + 1}]</span>
        </mark>
      );
      lastIndex = ann.endIndex;
    });

    if (lastIndex < input.length) {
      nodes.push(<span key={`text-${lastIndex}`}>{input.substring(lastIndex)}</span>);
    }

    return <div className="text-sm leading-relaxed whitespace-pre-wrap">{nodes}</div>;
  };

  return (
    <div className="space-y-6">
      {/* Editor & Highlight Toolbar */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b gap-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Highlighter className="h-4 w-4 text-primary" /> Source Text
          </label>
          <span className="text-xs text-muted-foreground">
            Select any word or passage below to apply a highlight or comment
          </span>
        </div>

        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSelect={handleTextSelect}
          placeholder="Type or paste text here, then select phrases to highlight and annotate..."
          className="min-h-44 font-mono text-sm leading-relaxed"
        />

        {/* Selected Text Action Banner */}
        {selectedText ? (
          <div className="p-3.5 rounded-xl border border-primary/40 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-primary">
                Selected: &ldquo;{selectedText.slice(0, 40)}{selectedText.length > 40 ? "..." : ""}&rdquo;
              </span>
              <span className="text-muted-foreground">
                Indices: [{selectedRange?.[0]}, {selectedRange?.[1]}]
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Highlight Tag:</span>
              {PALETTES.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setActivePalette(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    activePalette.name === p.name
                      ? "ring-2 ring-primary font-bold shadow-xs scale-105"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: p.color, color: "#1e293b" }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Optional annotation note / comment..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="h-8 text-xs bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addAnnotation();
                }}
              />
              <Button onClick={addAnnotation} size="sm" className="h-8 text-xs gap-1.5 shrink-0">
                <Highlighter className="h-3.5 w-3.5" /> Save Annotation
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Tip: Highlight any portion of text with your cursor to add an annotation.
          </p>
        )}
      </div>

      {/* Visual Preview & Annotations Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highlighted Visual View (2 cols) */}
        <div className="md:col-span-2 rounded-xl border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b">
            <span className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Visual Highlight Preview
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleCopyMarkdown} className="gap-1 h-7 text-xs">
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadMarkdown} className="gap-1 h-7 text-xs">
                <Download className="h-3.5 w-3.5" /> Download .md
              </Button>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/20 border min-h-48">
            {renderHighlightedView()}
          </div>
        </div>

        {/* Notes & Annotations List (1 col) */}
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b">
            <span className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Notes ({annotations.length})
            </span>
            {annotations.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAnnotations([])}
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </div>

          {annotations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-10">
              No annotations added yet. Select text to highlight.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {annotations.map((ann, idx) => (
                <div key={ann.id} className="p-2.5 rounded-lg border bg-muted/30 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-1.5 py-0.5 rounded font-semibold text-[10px]"
                      style={{ backgroundColor: ann.color, color: "#1e293b" }}
                    >
                      #{idx + 1} {ann.category}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-destructive"
                      onClick={() => removeAnnotation(ann.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-mono text-muted-foreground truncate">&ldquo;{ann.text}&rdquo;</p>
                  {ann.note && <p className="font-sans font-medium text-foreground pt-0.5">{ann.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}