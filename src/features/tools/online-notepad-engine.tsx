"use client";

import { useState, useEffect, useCallback } from "react";
import { Pencil, Copy, Check, Trash2, Download, Save, FileText, Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function OnlineNotepadEngine() {
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load saved content from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("online-notepad-content");
    const savedAt = localStorage.getItem("online-notepad-saved-at");
    if (saved) {
      setContent(saved);
      if (savedAt) setLastSaved(savedAt);
    }
  }, []);

  // Update stats on content change
  useEffect(() => {
    const trimmed = content.trim();
    setCharCount(content.length);
    setWordCount(trimmed ? trimmed.split(/\s+/).filter((w) => w.length > 0).length : 0);
  }, [content]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (content) {
        localStorage.setItem("online-notepad-content", content);
        const now = new Date().toLocaleTimeString();
        localStorage.setItem("online-notepad-saved-at", now);
        setLastSaved(now);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [content]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleClear = () => {
    if (content && !confirm("Are you sure you want to clear all content?")) return;
    setContent("");
    localStorage.removeItem("online-notepad-content");
    localStorage.removeItem("online-notepad-saved-at");
    setLastSaved(null);
    toast.success("Notepad cleared.");
  };

  const handleSave = () => {
    localStorage.setItem("online-notepad-content", content);
    const now = new Date().toLocaleTimeString();
    localStorage.setItem("online-notepad-saved-at", now);
    setLastSaved(now);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success("Saved to browser storage!");
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notepad-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as .txt file!");
  };

  const insertFormatting = (format: "bold" | "italic" | "underline" | "bullet" | "number") => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    let replacement = "";
    switch (format) {
      case "bold": replacement = `**${selected || "bold text"}**`; break;
      case "italic": replacement = `*${selected || "italic text"}*`; break;
      case "underline": replacement = `<u>${selected || "underlined text"}</u>`; break;
      case "bullet": replacement = `\n- ${selected || "list item"}`; break;
      case "number": replacement = `\n1. ${selected || "list item"}`; break;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Online Notepad</Badge>
        <span className="text-xs text-muted-foreground">Quick text editor with auto-save</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap">
        <div className="flex items-center gap-0.5 p-1 bg-muted/50 rounded-xl">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => insertFormatting("bold")} title="Bold">
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => insertFormatting("italic")} title="Italic">
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => insertFormatting("underline")} title="Underline">
            <Underline className="h-3.5 w-3.5" />
          </Button>
          <span className="w-px h-4 bg-border mx-0.5" />
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => insertFormatting("bullet")} title="Bullet List">
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => insertFormatting("number")} title="Numbered List">
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 h-7">
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave} className="gap-1.5 h-7">
            {saved ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved" : "Save"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1.5 h-7">
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1.5 h-7 text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* Editor */}
      <Textarea
        placeholder="Start typing here... (auto-saves every 30 seconds)"
        className="min-h-[350px] rounded-xl font-mono text-sm leading-relaxed"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* Stats bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Words: <strong>{wordCount.toLocaleString()}</strong></span>
          <span>Characters: <strong>{charCount.toLocaleString()}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="flex items-center gap-1">
              <Save className="h-3 w-3" />
              Last saved: {lastSaved}
            </span>
          )}
          <Badge variant="outline" className="text-[10px] h-5 px-1.5 rounded-full">Local Storage</Badge>
        </div>
      </div>

      {!content && (
        <div className="text-center py-6 text-muted-foreground">
          <Pencil className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Start typing to use the notepad. Content is saved in your browser.</p>
        </div>
      )}
    </div>
  );
}