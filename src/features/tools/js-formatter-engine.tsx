"use client";

import { useState } from "react";
import { Code, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function JSFormatterEngine() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState("2");
  const [output, setOutput] = useState("");

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, Number(indent)));
      toast.success("JSON formatted successfully");
    } catch {
      toast.error("Invalid JSON");
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      toast.success("JSON minified");
    } catch {
      toast.error("Invalid JSON");
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      toast.success("Valid JSON ✓");
    } catch (e: unknown) {
      toast.error(`Invalid JSON: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">JSON Formatter</Badge>
        <span className="text-xs text-muted-foreground">Format, minify & validate JSON</span>
      </div>

      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='{"name":"John","age":30}' className="w-full h-36 px-3 py-2 text-sm font-mono rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />

      <div className="flex gap-2 flex-wrap">
        <Button onClick={format} disabled={!input} className="gap-2 rounded-xl text-xs"><Code className="h-3 w-3" />Format</Button>
        <Button onClick={minify} disabled={!input} variant="outline" className="rounded-xl text-xs">Minify</Button>
        <Button onClick={validate} disabled={!input} variant="outline" className="rounded-xl text-xs">Validate</Button>
        <select value={indent} onChange={(e) => setIndent(e.target.value)} className="px-2 py-1 text-xs rounded-xl border border-border/50 bg-background">
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="0">Tab</option>
        </select>
      </div>

      {output && (
        <div className="relative">
          <textarea readOnly value={output} className="w-full h-36 px-3 py-2 text-sm font-mono rounded-xl border border-border/50 bg-muted/20 resize-y" />
          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }} className="absolute top-2 right-2 rounded-xl text-xs gap-1"><Copy className="h-3 w-3" /></Button>
        </div>
      )}
    </div>
  );
}