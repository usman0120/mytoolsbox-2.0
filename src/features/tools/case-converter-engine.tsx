"use client";

import { useState, useMemo } from "react";
import {
  CaseSensitive,
  Copy,
  Check,
  Trash2,
  Download,
  ArrowUpDown,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { applyCaseConversion, CaseType } from "@/features/tools/case-converter";
import { toast } from "sonner";

interface CaseOption {
  id: CaseType;
  label: string;
  example: string;
  category: "Standard" | "Code" | "Special";
}

const CASE_OPTIONS: CaseOption[] = [
  { id: "upper", label: "UPPERCASE", example: "HELLO WORLD", category: "Standard" },
  { id: "lower", label: "lowercase", example: "hello world", category: "Standard" },
  { id: "title", label: "Title Case", example: "Hello World", category: "Standard" },
  { id: "sentence", label: "Sentence case", example: "Hello world.", category: "Standard" },
  { id: "camel", label: "camelCase", example: "helloWorld", category: "Code" },
  { id: "pascal", label: "PascalCase", example: "HelloWorld", category: "Code" },
  { id: "snake", label: "snake_case", example: "hello_world", category: "Code" },
  { id: "constant", label: "CONSTANT_CASE", example: "HELLO_WORLD", category: "Code" },
  { id: "kebab", label: "kebab-case", example: "hello-world", category: "Code" },
  { id: "dot", label: "dot.case", example: "hello.world", category: "Code" },
  { id: "path", label: "path/case", example: "hello/world", category: "Code" },
  { id: "alternating", label: "aLtErNaTiNg", example: "hElLo WoRlD", category: "Special" },
];

export function CaseConverterEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeCase, setActiveCase] = useState<CaseType | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleConvert = (caseType: CaseType) => {
    if (!input.trim()) {
      toast.error("Please enter some text to convert.");
      return;
    }
    setActiveCase(caseType);
    const converted = applyCaseConversion(input, caseType);
    setOutput(converted);
    toast.success(`Converted to ${caseType} case`);
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
    a.download = `case-${activeCase || "converted"}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded converted text file!");
  };

  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setOutput(input);
    toast.info("Swapped input and output");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Card */}
        <div className="flex flex-col rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Source Text</label>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInput("");
                  setOutput("");
                  setActiveCase(null);
                }}
                disabled={!input}
                className="gap-1.5 h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Type, paste, or draft your text here..."
            className="min-h-56 resize-y font-mono text-sm leading-relaxed"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (activeCase) {
                setOutput(applyCaseConversion(e.target.value, activeCase));
              }
            }}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{inputStats.words} words</span>
            <span>{inputStats.chars} chars</span>
            <span>{inputStats.lines} lines</span>
          </div>
        </div>

        {/* Output Card */}
        <div className="flex flex-col rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <label className="text-sm font-semibold">
                Converted Result {activeCase && <span className="font-mono text-xs text-primary font-normal">({activeCase})</span>}
              </label>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwap}
                disabled={!output}
                className="gap-1 h-7 text-xs"
                title="Swap input and output"
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
            placeholder="Your converted text will appear here automatically..."
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

      {/* Case Options Grid */}
      <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-2">
            <CaseSensitive className="h-4 w-4 text-primary" /> Transform Case Style
          </span>
          <span className="text-xs text-muted-foreground">12 formatting styles</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {CASE_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              variant={activeCase === opt.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleConvert(opt.id)}
              disabled={!input.trim()}
              className="flex flex-col h-auto py-2 items-start justify-center text-left"
            >
              <span className="font-semibold text-xs">{opt.label}</span>
              <span className="text-[10px] opacity-70 font-mono truncate w-full">{opt.example}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}