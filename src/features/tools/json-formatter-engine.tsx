"use client";

import { useState } from "react";
import { Braces, Copy, Check, Trash2, Minus, AlignLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatJSON, minifyJSON, validateJSON } from "@/features/tools/json-formatter";
import { toast } from "sonner";

export function JSONFormatterEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"format" | "validate" | "minify">("format");

  const handleFormat = () => {
    setError(null);
    const result = formatJSON(input);
    if (result.status === "error") {
      setError(result.error || "Invalid JSON");
      setOutput("");
    } else {
      try {
        setOutput(JSON.stringify(JSON.parse(input), null, 2));
      } catch {
        setOutput("");
      }
    }
  };

  const handleValidate = () => {
    setError(null);
    const result = validateJSON(input);
    if (result.status === "error") {
      setError(result.error || "Invalid JSON");
      setOutput("");
    } else {
      setError(null);
      setOutput(result.message || "Valid JSON");
    }
  };

  const handleMinify = () => {
    setError(null);
    const result = minifyJSON(input);
    if (result.status === "error") {
      setError(result.error || "Invalid JSON");
      setOutput("");
    } else {
      try {
        setOutput(JSON.stringify(JSON.parse(input)));
      } catch {
        setOutput("");
      }
    }
  };

  const handleProcess = () => {
    switch (mode) {
      case "format": handleFormat(); break;
      case "validate": handleValidate(); break;
      case "minify": handleMinify(); break;
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const ext = mode === "minify" ? "json" : "json";
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        {([
          { id: "format", label: "Format", icon: Braces },
          { id: "validate", label: "Validate", icon: Check },
          { id: "minify", label: "Minify", icon: Minus },
        ] as const).map((m) => (
          <Button
            key={m.id}
            variant={mode === m.id ? "default" : "outline"}
            size="sm"
            onClick={() => { setMode(m.id); setOutput(""); setError(null); }}
            className="gap-1.5"
          >
            <m.icon className="h-3.5 w-3.5" />
            {m.label}
          </Button>
        ))}
      </div>

      {/* Input */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Input</label>
        <Textarea
          placeholder='{"hello": "world"}'
          className="font-mono text-sm min-h-[160px]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <Button onClick={handleProcess} className="w-full gap-2">
        <AlignLeft className="h-4 w-4" />
        {mode === "format" ? "Format JSON" : mode === "validate" ? "Validate JSON" : "Minify JSON"}
      </Button>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-mono">
          {error}
        </div>
      )}

      {/* Output */}
      {output && !error && (
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
          <pre className="p-4 rounded-lg bg-muted text-sm font-mono overflow-auto max-h-96 whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}