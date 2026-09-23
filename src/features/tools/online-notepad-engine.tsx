"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Copy, Check, Trash2, Download, Save, Clock,
  ArrowUpDown, Search, Replace, Sparkles, Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  computeTextStatistics,
  transformCase,
  sortLines,
  removeDuplicateLines,
  findAndReplace,
  CaseTransform,
} from "@/features/tools/online-notepad";

const STORAGE_KEY = "mytoolsbox-online-notepad-content";
const SAVED_AT_KEY = "mytoolsbox-online-notepad-saved-at";

export function OnlineNotepadEngine() {
  const [content, setContent] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });

  const [copied, setCopied] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SAVED_AT_KEY) || null;
    } catch {
      return null;
    }
  });

  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Auto-save on edit with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== undefined) {
        localStorage.setItem(STORAGE_KEY, content);
        const now = new Date().toLocaleTimeString();
        localStorage.setItem(SAVED_AT_KEY, now);
        setLastSaved(now);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content]);

  const stats = computeTextStatistics(content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleClear = () => {
    if (content && confirm("Are you sure you want to clear your notepad?")) {
      setContent("");
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SAVED_AT_KEY);
      setLastSaved(null);
      toast.success("Notepad cleared.");
    }
  };

  const handleDownload = (format: "txt" | "md") => {
    const mime = format === "md" ? "text/markdown" : "text/plain";
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Notes downloaded as .${format}!`);
  };

  const applyCase = (type: CaseTransform) => {
    if (!content) return;
    setContent(transformCase(content, type));
    toast.success(`Transformed to ${type}!`);
  };

  const handleSort = (dir: "asc" | "desc") => {
    if (!content) return;
    setContent(sortLines(content, dir));
    toast.success(`Lines sorted ${dir === "asc" ? "A-Z" : "Z-A"}!`);
  };

  const handleDedupe = () => {
    if (!content) return;
    setContent(removeDuplicateLines(content));
    toast.success("Duplicate lines removed!");
  };

  const handleExecuteReplace = () => {
    if (!findQuery) {
      toast.error("Please enter a term to find.");
      return;
    }
    const updated = findAndReplace(content, findQuery, replaceQuery, { caseSensitive });
    setContent(updated);
    toast.success("Find & replace executed!");
  };

  return (
    <div className="space-y-3">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Online Notepad
          </h2>
          {lastSaved && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
              <Check className="h-3 w-3 text-green-500" /> Auto-saved {lastSaved}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant={showFindReplace ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFindReplace(!showFindReplace)}
            className="text-xs h-8 gap-1"
          >
            <Search className="h-3.5 w-3.5" /> Find & Replace
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs h-8 gap-1">
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Copy
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload("txt")} className="text-xs h-8 gap-1">
            <Download className="h-3.5 w-3.5" /> TXT
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload("md")} className="text-xs h-8 gap-1">
            <Download className="h-3.5 w-3.5" /> MD
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs h-8 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Find & Replace Bar */}
      {showFindReplace && (
        <Card className="p-3 bg-muted/40 border border-border">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-1 min-w-44">
              <Input
                placeholder="Find..."
                value={findQuery}
                onChange={(e) => setFindQuery(e.target.value)}
                className="h-7 text-xs"
              />
              <Input
                placeholder="Replace with..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <label className="flex items-center gap-1 cursor-pointer text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded"
              />
              Match case
            </label>
            <Button size="sm" onClick={handleExecuteReplace} className="h-7 text-xs gap-1">
              <Replace className="h-3 w-3" /> Replace All
            </Button>
          </div>
        </Card>
      )}

      {/* Text Transformations Toolbar */}
      <div className="flex flex-wrap items-center gap-1 text-xs">
        <span className="text-[10px] text-muted-foreground mr-1 uppercase font-semibold">Transform:</span>
        <Button variant="ghost" size="sm" onClick={() => applyCase("titlecase")} className="h-6 text-[10px] px-2">
          Title Case
        </Button>
        <Button variant="ghost" size="sm" onClick={() => applyCase("sentencecase")} className="h-6 text-[10px] px-2">
          Sentence case
        </Button>
        <Button variant="ghost" size="sm" onClick={() => applyCase("uppercase")} className="h-6 text-[10px] px-2">
          UPPERCASE
        </Button>
        <Button variant="ghost" size="sm" onClick={() => applyCase("lowercase")} className="h-6 text-[10px] px-2">
          lowercase
        </Button>
        <span className="text-muted-foreground">|</span>
        <Button variant="ghost" size="sm" onClick={() => handleSort("asc")} className="h-6 text-[10px] px-2">
          Sort A-Z
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleSort("desc")} className="h-6 text-[10px] px-2">
          Sort Z-A
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDedupe} className="h-6 text-[10px] px-2">
          Deduplicate Lines
        </Button>
      </div>

      {/* Editor Area */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing your notes, thoughts, or drafts here..."
        className="font-mono text-xs min-h-[380px] leading-relaxed p-4 border rounded-xl resize-y shadow-xs"
      />

      {/* Statistics Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground px-1 gap-2 border-t pt-2">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
          <span><strong>{stats.words.toLocaleString()}</strong> words</span>
          <span><strong>{stats.characters.toLocaleString()}</strong> characters</span>
          <span><strong>{stats.sentences}</strong> sentences</span>
          <span><strong>{stats.paragraphs}</strong> paragraphs</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>~{stats.readingTimeMinutes}m read</span>
          <span>~{stats.speakingTimeMinutes}m speech</span>
        </div>
      </div>
    </div>
  );
}