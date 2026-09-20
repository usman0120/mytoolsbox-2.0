"use client";

import { useState } from "react";
import { Link, Copy, Trash2, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function URLDecoderEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("decode");

  const process = () => {
    try {
      setOutput(mode === "decode" ? decodeURIComponent(input) : encodeURIComponent(input));
    } catch {
      toast.error(`Failed to ${mode} URL`);
    }
  };

  const toggle = () => {
    setMode(mode === "decode" ? "encode" : "decode");
    setInput(output);
    setOutput("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">URL Encoder/Decoder</Badge>
        <span className="text-xs text-muted-foreground">Encode or decode URL strings</span>
      </div>

      <div className="flex gap-2">
        <Button variant={mode === "decode" ? "default" : "outline"} size="sm" onClick={() => setMode("decode")} className="rounded-xl text-xs">Decode</Button>
        <Button variant={mode === "encode" ? "default" : "outline"} size="sm" onClick={() => setMode("encode")} className="rounded-xl text-xs">Encode</Button>
      </div>

      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "decode" ? "Paste encoded URL..." : "Enter text to encode..."} className="w-full h-28 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />

      <div className="flex gap-2">
        <Button onClick={process} disabled={!input} className="gap-2 rounded-xl flex-1"><ArrowLeftRight className="h-4 w-4" />{mode === "decode" ? "Decode" : "Encode"}</Button>
        <Button variant="outline" size="sm" onClick={toggle} disabled={!output} className="rounded-xl text-xs">Swap</Button>
      </div>

      {output && (
        <div className="relative">
          <textarea readOnly value={output} className="w-full h-28 px-3 py-2 text-sm rounded-xl border border-border/50 bg-muted/20 resize-y" />
          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }} className="absolute top-2 right-2 rounded-xl text-xs gap-1"><Copy className="h-3 w-3" /></Button>
        </div>
      )}
    </div>
  );
}