"use client";

import { useState } from "react";
import { CaseSensitive, Copy, Check, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { convertCase, CaseType } from "@/features/tools/case-converter";
import { toast } from "sonner";

const CASE_OPTIONS: { id: CaseType; label: string; example: string }[] = [
  { id: "upper", label: "UPPERCASE", example: "HELLO WORLD" },
  { id: "lower", label: "lowercase", example: "hello world" },
  { id: "title", label: "Title Case", example: "Hello World" },
  { id: "sentence", label: "Sentence case", example: "Hello world" },
  { id: "camel", label: "camelCase", example: "helloWorld" },
  { id: "snake", label: "snake_case", example: "hello_world" },
  { id: "kebab", label: "kebab-case", example: "hello-world" },
  { id: "pascal", label: "PascalCase", example: "HelloWorld" },
];

export function CaseConverterEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeCase, setActiveCase] = useState<CaseType | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = (caseType: CaseType) => {
    const result = convertCase(input, caseType);
    if (result.status === "error") {
      setOutput("");
    } else {
      setOutput(result.message || "");
      // Actually convert
      setActiveCase(caseType);
      const converted = applyCase(input, caseType);
      setOutput(converted);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `case-converted-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium">Input Text</label>
          <Button variant="ghost" size="sm" onClick={() => { setInput(""); setOutput(""); }} className="gap-1.5 h-7">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
        <Textarea
          placeholder="Type or paste your text here..."
          className="min-h-30"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CASE_OPTIONS.map((opt) => (
          <Button
            key={opt.id}
            variant={activeCase === opt.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleConvert(opt.id)}
            disabled={!input.trim()}
            className="text-xs"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">Output</label>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 h-7">
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1.5 h-7">
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </div>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-sm overflow-auto max-h-64 whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}

      {!input.trim() && (
        <div className="text-center py-8 text-muted-foreground">
          <CaseSensitive className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Enter text and choose a case conversion</p>
        </div>
      )}
    </div>
  );
}

// Direct case conversion (duplicated from engine for immediate UI feedback)
function applyCase(text: string, caseType: CaseType): string {
  switch (caseType) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title": return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case "sentence": return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
    case "camel": return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
    case "snake": return text.replace(/\s+/g, "_").replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
    case "kebab": return text.replace(/\s+/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    case "pascal": return text.toLowerCase().replace(/(?:^|[^a-zA-Z0-9]+)(.)/g, (_, c) => c.toUpperCase());
    default: return text;
  }
}