"use client";

import { useState } from "react";
import { Copy, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function DuplicateRemoverEngine() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"lines" | "words" | "csv">("lines");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [result, setResult] = useState<{ original: number; unique: number; removed: number } | null>(null);

  const process = () => {
    let items: string[];
    if (mode === "lines") items = text.split("\n");
    else if (mode === "words") items = text.split(/[\s,]+/).filter(Boolean);
    else items = text.split(",").map(s => s.trim());

    const original = items.length;
    const seen = new Set<string>();
    const unique = items.filter(item => {
      const key = caseSensitive ? item : item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setResult({ original, unique: unique.length, removed: original - unique.length });
    setText(mode === "csv" ? unique.join(", ") : mode === "words" ? unique.join(" ") : unique.join("\n"));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Duplicate Remover</Badge>
        <span className="text-xs text-muted-foreground">Remove duplicate lines, words, or CSV values</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["lines", "words", "csv"] as const).map(m => (
          <Button key={m} variant={mode === m ? "default" : "outline"} size="sm" onClick={() => setMode(m)} className="rounded-xl text-xs capitalize">{m}</Button>
        ))}
        <Button variant={caseSensitive ? "default" : "outline"} size="sm" onClick={() => setCaseSensitive(!caseSensitive)} className="rounded-xl text-xs">Case Sensitive</Button>
      </div>

      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={mode === "csv" ? "apple, banana, apple, orange, banana" : "Enter text with duplicates..."} className="w-full h-36 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />

      <Button onClick={process} disabled={!text} className="gap-2 rounded-xl w-full"><Filter className="h-4 w-4" />Remove Duplicates</Button>

      {result && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold">{result.original}</div>
            <div className="text-xs text-muted-foreground">Original</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold text-green-600">{result.unique}</div>
            <div className="text-xs text-muted-foreground">Unique</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold text-red-500">{result.removed}</div>
            <div className="text-xs text-muted-foreground">Removed</div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied!"); }} className="rounded-xl text-xs gap-1"><Copy className="h-3 w-3" />Copy</Button>
        <Button variant="outline" size="sm" onClick={() => { setText(""); setResult(null); }} className="rounded-xl text-xs gap-1"><Trash2 className="h-3 w-3" />Clear</Button>
      </div>
    </div>
  );
}