"use client";

import { useState } from "react";
import { Binary, Copy, Check, ArrowLeftRight, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { encodeBase64, decodeBase64 } from "@/features/tools/base64-encoder";
import { Base64 } from "js-base64";
import { toast } from "sonner";

export function Base64EncoderEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    setError(null);
    const result = mode === "encode" ? encodeBase64(input) : decodeBase64(input);
    if (result.status === "error") {
      setError(result.error || "Error");
      setOutput("");
    } else {
      setOutput(result.message || "");
      // For encode, we need to actually encode
      if (mode === "encode") {
        try {
          setOutput(Base64.encode(input));
        } catch {
          setOutput("");
        }
      } else {
        try {
          setOutput(Base64.decode(input));
        } catch {
          setError("Invalid Base64 string");
          setOutput("");
        }
      }
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
    a.download = `base64-${mode}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput("");
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={mode === "encode" ? "default" : "outline"}
          size="sm"
          onClick={() => { setMode("encode"); setOutput(""); setError(null); }}
        >
          Encode
        </Button>
        <Button
          variant={mode === "decode" ? "default" : "outline"}
          size="sm"
          onClick={() => { setMode("decode"); setOutput(""); setError(null); }}
        >
          Decode
        </Button>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">
          {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
        </label>
        <Textarea
          placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 string to decode..."}
          className="min-h-30 font-mono text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleProcess} className="flex-1 gap-2" disabled={!input.trim()}>
          <Binary className="h-4 w-4" />
          {mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
        </Button>
        <Button variant="outline" size="icon" onClick={handleSwap} title="Swap mode">
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

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
          <pre className="p-4 rounded-lg bg-muted text-sm font-mono overflow-auto max-h-64 whitespace-pre-wrap break-all">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}