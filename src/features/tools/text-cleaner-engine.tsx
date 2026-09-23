"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Trash2,
  Download,
  ArrowUpDown,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cleanText, CleanTextOptions } from "@/features/tools/text-cleaner";
import { toast } from "sonner";

export function TextCleanerEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const [options, setOptions] = useState<CleanTextOptions>({
    removeExtraSpaces: true,
    removeLineBreaks: false,
    removeHTML: false,
    trimLines: true,
    removeEmptyLines: true,
    removeDuplicateLines: false,
    stripEmojis: false,
    stripNonAscii: false,
    sortLines: "none",
    numberLines: false,
    removePunctuation: false,
    findText: "",
    replaceText: "",
    useRegex: false,
  });

  const handleClean = (customOpts?: Partial<CleanTextOptions>) => {
    const activeOpts = { ...options, ...customOpts };
    if (!input.trim()) {
      toast.error("Please enter some text to clean.");
      return;
    }
    const cleaned = cleanText(input, activeOpts);
    setOutput(cleaned);
    toast.success("Text cleaned successfully!");
  };

  const applyPreset = (preset: "html" | "dedup" | "spaces" | "plain") => {
    let nextOpts: CleanTextOptions = { ...options };
    if (preset === "html") {
      nextOpts = {
        ...nextOpts,
        removeHTML: true,
        removeExtraSpaces: true,
        trimLines: true,
        removeEmptyLines: true,
      };
    } else if (preset === "dedup") {
      nextOpts = {
        ...nextOpts,
        removeDuplicateLines: true,
        removeEmptyLines: true,
        trimLines: true,
        sortLines: "asc",
      };
    } else if (preset === "spaces") {
      nextOpts = {
        ...nextOpts,
        removeExtraSpaces: true,
        trimLines: true,
        removeEmptyLines: true,
      };
    } else if (preset === "plain") {
      nextOpts = {
        ...nextOpts,
        removeHTML: true,
        stripEmojis: true,
        stripNonAscii: true,
        removeExtraSpaces: true,
      };
    }
    setOptions(nextOpts);
    if (input.trim()) {
      setOutput(cleanText(input, nextOpts));
      toast.success(`Applied ${preset.toUpperCase()} preset and cleaned!`);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cleaned-text-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded cleaned text file!");
  };

  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setOutput(input);
    toast.info("Swapped input and output");
  };

  const inputStats = useMemo(() => {
    const chars = input.length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const lines = input ? input.split("\n").length : 0;
    return { chars, words, lines };
  }, [input]);

  const outputStats = useMemo(() => {
    const chars = output.length;
    const words = output.trim() ? output.trim().split(/\s+/).length : 0;
    const lines = output ? output.split("\n").length : 0;
    return { chars, words, lines };
  }, [output]);

  return (
    <div className="space-y-6">
      {/* Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/40 rounded-xl border">
        <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
          <Filter className="h-3.5 w-3.5" /> Quick Presets:
        </span>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyPreset("spaces")}>
          Extra Spaces & Blanks
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyPreset("html")}>
          Strip HTML & Tags
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyPreset("dedup")}>
          Deduplicate & Sort A-Z
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyPreset("plain")}>
          Plain ASCII (No Emojis)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="flex flex-col rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b mb-3">
            <Label className="text-sm font-semibold">Raw Text Input</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setInput("");
                setOutput("");
              }}
              disabled={!input}
              className="gap-1 h-7 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
          <Textarea
            placeholder="Paste messy, formatted, or duplicated text here..."
            className="min-h-56 resize-y font-mono text-sm leading-relaxed"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{inputStats.words} words</span>
            <span>{inputStats.chars} chars</span>
            <span>{inputStats.lines} lines</span>
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b mb-3">
            <Label className="text-sm font-semibold">Cleaned Text</Label>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwap}
                disabled={!output}
                className="gap-1 h-7 text-xs"
              >
                <ArrowUpDown className="h-3.5 w-3.5" /> Swap
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!output}
                className="gap-1 h-7 text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={!output}
                className="gap-1 h-7 text-xs"
              >
                <Download className="h-3.5 w-3.5" /> Save
              </Button>
            </div>
          </div>
          <Textarea
            readOnly
            placeholder="Cleaned output will appear here after clicking Clean Text..."
            className="min-h-56 resize-y font-mono text-sm leading-relaxed bg-muted/30"
            value={output}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{outputStats.words} words</span>
            <span>{outputStats.chars} chars</span>
            <span>{outputStats.lines} lines</span>
          </div>
        </div>
      </div>

      {/* Cleaning Rules Grid */}
      <div className="rounded-xl border bg-card p-4 shadow-xs space-y-4">
        <h4 className="text-sm font-semibold">Cleaning Rules & Options</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg border hover:bg-muted/40">
            <input
              type="checkbox"
              checked={options.removeExtraSpaces}
              onChange={(e) => setOptions({ ...options, removeExtraSpaces: e.target.checked })}
              className="rounded"
            />
            Remove extra spaces & tabs
          </label>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg border hover:bg-muted/40">
            <input
              type="checkbox"
              checked={options.trimLines}
              onChange={(e) => setOptions({ ...options, trimLines: e.target.checked })}
              className="rounded"
            />
            Trim whitespace on each line
          </label>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg border hover:bg-muted/40">
            <input
              type="checkbox"
              checked={options.removeEmptyLines}
              onChange={(e) => setOptions({ ...options, removeEmptyLines: e.target.checked })}
              className="rounded"
            />
            Remove blank/empty lines
          </label>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg border hover:bg-muted/40">
            <input
              type="checkbox"
              checked={options.removeDuplicateLines}
              onChange={(e) => setOptions({ ...options, removeDuplicateLines: e.target.checked })}
              className="rounded"
            />
            Deduplicate repeated lines
          </label>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg border hover:bg-muted/40">
            <input
              type="checkbox"
              checked={options.removeHTML}
              onChange={(e) => setOptions({ ...options, removeHTML: e.target.checked })}
              className="rounded"
            />
            Strip HTML tags & entities
          </label>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg border hover:bg-muted/40">
            <input
              type="checkbox"
              checked={options.removeLineBreaks}
              onChange={(e) => setOptions({ ...options, removeLineBreaks: e.target.checked })}
              className="rounded"
            />
            Merge into single line
          </label>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg border hover:bg-muted/40">
            <input
              type="checkbox"
              checked={options.stripEmojis}
              onChange={(e) => setOptions({ ...options, stripEmojis: e.target.checked })}
              className="rounded"
            />
            Strip emojis & symbols
          </label>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg border hover:bg-muted/40">
            <input
              type="checkbox"
              checked={options.stripNonAscii}
              onChange={(e) => setOptions({ ...options, stripNonAscii: e.target.checked })}
              className="rounded"
            />
            Strip non-ASCII characters
          </label>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg border hover:bg-muted/40">
            <input
              type="checkbox"
              checked={options.numberLines}
              onChange={(e) => setOptions({ ...options, numberLines: e.target.checked })}
              className="rounded"
            />
            Number each line (1., 2., ...)
          </label>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg border hover:bg-muted/40">
            <input
              type="checkbox"
              checked={options.removePunctuation}
              onChange={(e) => setOptions({ ...options, removePunctuation: e.target.checked })}
              className="rounded"
            />
            Remove punctuation marks
          </label>
          <div className="flex items-center gap-2 p-2 rounded-lg border">
            <span className="text-xs font-medium">Sort Lines:</span>
            <select
              value={options.sortLines || "none"}
              onChange={(e) =>
                setOptions({
                  ...options,
                  sortLines: e.target.value as "none" | "asc" | "desc",
                })
              }
              className="text-xs bg-background border rounded px-1.5 py-1"
            >
              <option value="none">No Sorting</option>
              <option value="asc">A to Z</option>
              <option value="desc">Z to A</option>
            </select>
          </div>
        </div>

        {/* Find & Replace Bar */}
        <div className="pt-2 border-t flex flex-wrap sm:flex-nowrap gap-2 items-center">
          <div className="flex items-center gap-1.5 flex-1 min-w-40">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Find text or pattern..."
              value={options.findText || ""}
              onChange={(e) => setOptions({ ...options, findText: e.target.value })}
              className="h-8 text-xs font-mono"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-40">
            <Input
              placeholder="Replace with..."
              value={options.replaceText || ""}
              onChange={(e) => setOptions({ ...options, replaceText: e.target.value })}
              className="h-8 text-xs font-mono"
            />
          </div>
          <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={options.useRegex}
              onChange={(e) => setOptions({ ...options, useRegex: e.target.checked })}
              className="rounded"
            />
            Regex
          </label>
        </div>

        <Button onClick={() => handleClean()} className="w-full gap-2 font-medium" disabled={!input.trim()}>
          <Sparkles className="h-4 w-4" /> Clean Text Now
        </Button>
      </div>
    </div>
  );
}