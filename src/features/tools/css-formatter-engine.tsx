"use client";

import { useState } from "react";
import { Paintbrush, Copy, Check, Trash2, Minus, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatCSS, minifyCSS } from "@/features/tools/css-formatter";

export function CSSFormatterEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    setError("");
    const result = mode === "format" ? formatCSS(input) : minifyCSS(input);
    if (result.status === "error") {
      setError(result.error || "Error");
      setOutput("");
    } else {
      setOutput(result.message || "");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={mode === "format" ? "default" : "outline"}
          size="sm"
          onClick={() => { setMode("format"); setOutput(""); setError(""); }}
        >
          <AlignLeft className="h-3.5 w-3.5 mr-1.5" /> Format
        </Button>
        <Button
          variant={mode === "minify" ? "default" : "outline"}
          size="sm"
          onClick={() => { setMode("minify"); setOutput(""); setError(""); }}
        >
          <Minus className="h-3.5 w-3.5 mr-1.5" /> Minify
        </Button>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Input CSS</label>
        <Textarea
          placeholder="body { color: red; font-size: 16px; }"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-37.5 font-mono text-sm"
        />
      </div>

      <Button onClick={handleProcess} className="w-full gap-2">
        <Paintbrush className="h-4 w-4" /> {mode === "format" ? "Format CSS" : "Minify CSS"}
      </Button>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">Output</label>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => setOutput("")}>
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          </div>
          <Textarea value={output} readOnly className="min-h-37.5 font-mono text-sm" />
        </div>
      )}
    </div>
  );
}