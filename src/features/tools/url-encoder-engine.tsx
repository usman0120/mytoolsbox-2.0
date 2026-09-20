"use client";

import { useState } from "react";
import { Link, Copy, Check, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { encodeURL, decodeURL } from "@/features/tools/url-encoder";

export function URLEncoderEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    const result = mode === "encode" ? encodeURL(input) : decodeURL(input);
    setOutput(result.status === "success" ? result.message || "" : "");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={mode === "encode" ? "default" : "outline"} size="sm" onClick={() => { setMode("encode"); setOutput(""); }}>
          Encode
        </Button>
        <Button variant={mode === "decode" ? "default" : "outline"} size="sm" onClick={() => { setMode("decode"); setOutput(""); }}>
          Decode
        </Button>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">{mode === "encode" ? "Text" : "Encoded URL"}</label>
        <Textarea
          placeholder={mode === "encode" ? "Enter text to URL-encode..." : "Enter URL-encoded string..."}
          className="min-h-25 font-mono text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleProcess} className="flex-1 gap-2" disabled={!input.trim()}>
          <Link className="h-4 w-4" /> {mode === "encode" ? "Encode" : "Decode"}
        </Button>
        <Button variant="outline" size="icon" onClick={() => { setMode(mode === "encode" ? "decode" : "encode"); setInput(output); setOutput(""); }}>
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">Output</label>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 h-7">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-sm font-mono overflow-auto max-h-64 whitespace-pre-wrap break-all">{output}</pre>
        </div>
      )}
    </div>
  );
}