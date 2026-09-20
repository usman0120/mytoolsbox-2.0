"use client";

import { useState } from "react";
import { Type, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function CharacterCounterEngine() {
  const [text, setText] = useState("");

  const stats = {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    sentences: text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0,
    paragraphs: text.trim() ? text.split(/\n\s*\n/).filter(Boolean).length : 0,
    lines: text.trim() ? text.split(/\n/).length : 0,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Character Counter</Badge>
        <span className="text-xs text-muted-foreground">Count characters, words, sentences & more</span>
      </div>

      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here..." className="w-full h-40 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Characters", value: stats.characters },
          { label: "No Spaces", value: stats.charactersNoSpaces },
          { label: "Words", value: stats.words },
          { label: "Sentences", value: stats.sentences },
          { label: "Paragraphs", value: stats.paragraphs },
          { label: "Lines", value: stats.lines },
        ].map(item => (
          <div key={item.label} className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold">{item.value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied!"); }} className="rounded-xl text-xs gap-1"><Copy className="h-3 w-3" />Copy</Button>
        <Button variant="outline" size="sm" onClick={() => setText("")} className="rounded-xl text-xs gap-1"><Trash2 className="h-3 w-3" />Clear</Button>
      </div>
    </div>
  );
}