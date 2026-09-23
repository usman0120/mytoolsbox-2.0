"use client";

import { useState, useMemo } from "react";
import {
  GitCompare,
  Copy,
  Check,
  ArrowLeftRight,
  Download,
  Trash2,
  Columns,
  AlignJustify,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  computeDiff,
  generatePatch,
  DiffMode,
  DiffResult,
} from "@/features/tools/diff-checker";
import { toast } from "sonner";

const SAMPLE_ORIGINAL = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

const SAMPLE_MODIFIED = `function calculateTotal(items, taxRate = 0.05) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * taxRate;
  return Number((subtotal + tax).toFixed(2));
}`;

export function DiffCheckerEngine() {
  const [text1, setText1] = useState(SAMPLE_ORIGINAL);
  const [text2, setText2] = useState(SAMPLE_MODIFIED);
  const [mode, setMode] = useState<DiffMode>("lines");
  const [view, setView] = useState<"unified" | "split">("split");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [copied, setCopied] = useState(false);

  const diffResults: DiffResult[] = useMemo(() => {
    if (!text1 && !text2) return [];
    return computeDiff(text1, text2, mode, { ignoreWhitespace, ignoreCase });
  }, [text1, text2, mode, ignoreWhitespace, ignoreCase]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let unchanged = 0;

    diffResults.forEach((r) => {
      const lines = r.value.split("\n").filter(Boolean).length || 1;
      if (r.type === "added") added += lines;
      else if (r.type === "removed") removed += lines;
      else unchanged += lines;
    });

    return { added, removed, unchanged };
  }, [diffResults]);

  const handleSwap = () => {
    setText1(text2);
    setText2(text1);
    toast.info("Swapped original and modified texts");
  };

  const handleClear = () => {
    setText1("");
    setText2("");
  };

  const handleCopyPatch = async () => {
    const patch = generatePatch("diff-output.txt", text1, text2);
    await navigator.clipboard.writeText(patch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied Git patch to clipboard!");
  };

  const handleDownloadPatch = () => {
    const patch = generatePatch("diff-output.txt", text1, text2);
    const blob = new Blob([patch], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diff-${Date.now()}.patch`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded .patch file!");
  };

  return (
    <div className="space-y-6">
      {/* Controls & Configuration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card rounded-xl border shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Diff Mode:</span>
          {(["lines", "words", "chars"] as DiffMode[]).map((m) => (
            <Button
              key={m}
              variant={mode === m ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(m)}
              className="text-xs h-8 capitalize"
            >
              By {m}
            </Button>
          ))}

          <div className="h-4 w-px bg-border mx-1" />

          <span className="text-xs font-semibold text-muted-foreground mr-1">View:</span>
          <Button
            variant={view === "split" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("split")}
            className="text-xs h-8 gap-1.5"
          >
            <Columns className="h-3.5 w-3.5" /> Side-by-Side
          </Button>
          <Button
            variant={view === "unified" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("unified")}
            className="text-xs h-8 gap-1.5"
          >
            <AlignJustify className="h-3.5 w-3.5" /> Unified
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="rounded"
            />
            Ignore Whitespace
          </label>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="rounded"
            />
            Ignore Case
          </label>
        </div>
      </div>

      {/* Input Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="flex flex-col rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <Label className="text-sm font-semibold">Original Text (A)</Label>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setText1("")}
                disabled={!text1}
                className="gap-1 h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Paste original text here..."
            className="min-h-52 resize-y font-mono text-xs leading-relaxed"
            value={text1}
            onChange={(e) => setText1(e.target.value)}
          />
        </div>

        {/* Modified */}
        <div className="flex flex-col rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <Label className="text-sm font-semibold">Modified Text (B)</Label>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwap}
                className="gap-1 h-7 text-xs"
                title="Swap original and modified"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" /> Swap
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setText2("")}
                disabled={!text2}
                className="gap-1 h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Paste modified text here..."
            className="min-h-52 resize-y font-mono text-xs leading-relaxed"
            value={text2}
            onChange={(e) => setText2(e.target.value)}
          />
        </div>
      </div>

      {/* Comparison Statistics & Action Ribbon */}
      <div className="rounded-xl border bg-card p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold flex items-center gap-1.5">
            <GitCompare className="h-4 w-4 text-primary" /> Diff Summary:
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            +{stats.added} Added
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            -{stats.removed} Removed
          </span>
          <span className="text-xs text-muted-foreground">
            {stats.unchanged} Unchanged
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyPatch} className="h-8 gap-1.5 text-xs">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            Copy Patch
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPatch} className="h-8 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Download .patch
          </Button>
        </div>
      </div>

      {/* Diff Output Visualization */}
      <div className="rounded-xl border bg-card p-5 shadow-xs">
        <div className="pb-3 border-b mb-4 flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <FileCode className="h-4 w-4 text-primary" /> Visual Diff Inspector
          </Label>
          <span className="text-xs text-muted-foreground font-mono">
            {view === "split" ? "Side-by-Side Comparison" : "Unified Inline Diff"}
          </span>
        </div>

        {view === "split" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left (Original deletions) */}
            <div className="rounded-lg border bg-muted/20 p-3 font-mono text-xs overflow-auto max-h-96 whitespace-pre-wrap leading-relaxed">
              <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 pb-1 mb-2 border-b">
                --- Original Deletions
              </div>
              {diffResults
                .filter((part) => part.type !== "added")
                .map((part, i) => (
                  <span
                    key={i}
                    className={
                      part.type === "removed"
                        ? "bg-rose-200/80 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 line-through decoration-rose-500 px-0.5 rounded"
                        : "text-foreground"
                    }
                  >
                    {part.value}
                  </span>
                ))}
            </div>

            {/* Right (Modified additions) */}
            <div className="rounded-lg border bg-muted/20 p-3 font-mono text-xs overflow-auto max-h-96 whitespace-pre-wrap leading-relaxed">
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pb-1 mb-2 border-b">
                +++ Modified Additions
              </div>
              {diffResults
                .filter((part) => part.type !== "removed")
                .map((part, i) => (
                  <span
                    key={i}
                    className={
                      part.type === "added"
                        ? "bg-emerald-200/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-semibold px-0.5 rounded"
                        : "text-foreground"
                    }
                  >
                    {part.value}
                  </span>
                ))}
            </div>
          </div>
        ) : (
          /* Unified View */
          <div className="rounded-lg border bg-muted/20 p-3 font-mono text-xs overflow-auto max-h-96 whitespace-pre-wrap leading-relaxed">
            {diffResults.map((part, i) => (
              <span
                key={i}
                className={
                  part.type === "added"
                    ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 font-medium px-0.5"
                    : part.type === "removed"
                    ? "bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 line-through decoration-rose-500 px-0.5"
                    : "text-foreground"
                }
              >
                {part.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}