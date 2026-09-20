"use client";

import { useState } from "react";
import { SprayCan, Copy, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cleanText } from "@/features/tools/text-cleaner";

export function TextCleanerEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    removeExtraSpaces: true,
    removeLineBreaks: false,
    removeHTML: false,
    trimLines: true,
  });

  const handleClean = () => {
    setOutput(cleanText(input, options));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm mb-1.5 block">Input Text</Label>
        <Textarea
          placeholder="Paste your text here..."
          className="min-h-30"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {([
          { key: "removeExtraSpaces", label: "Remove extra spaces" },
          { key: "removeLineBreaks", label: "Remove line breaks" },
          { key: "removeHTML", label: "Remove HTML tags" },
          { key: "trimLines", label: "Trim lines" },
        ] as const).map((opt) => (
          <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={options[opt.key]}
              onChange={(e) => setOptions({ ...options, [opt.key]: e.target.checked })}
              className="rounded"
            />
            {opt.label}
          </label>
        ))}
      </div>

      <Button onClick={handleClean} className="w-full gap-2" disabled={!input.trim()}>
        <SprayCan className="h-4 w-4" /> Clean Text
      </Button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-sm">Cleaned Text</Label>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 h-7">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-sm overflow-auto max-h-64 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}