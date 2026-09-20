"use client";

import { useState } from "react";
import { Type, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function SentenceCounterEngine() {
  const [text, setText] = useState("");

  const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean) : [];
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const avgWordsPerSentence = sentences.length ? Math.round((words / sentences.length) * 10) / 10 : 0;
  const readingTime = Math.ceil(words / 200);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Sentence Counter</Badge>
        <span className="text-xs text-muted-foreground">Analyze sentence structure & readability</span>
      </div>

      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here..." className="w-full h-40 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-muted/30 rounded-xl text-center">
          <div className="text-lg font-bold">{sentences.length}</div>
          <div className="text-xs text-muted-foreground">Sentences</div>
        </div>
        <div className="p-3 bg-muted/30 rounded-xl text-center">
          <div className="text-lg font-bold">{words}</div>
          <div className="text-xs text-muted-foreground">Words</div>
        </div>
        <div className="p-3 bg-muted/30 rounded-xl text-center">
          <div className="text-lg font-bold">{avgWordsPerSentence}</div>
          <div className="text-xs text-muted-foreground">Avg Words/Sentence</div>
        </div>
        <div className="p-3 bg-muted/30 rounded-xl text-center">
          <div className="text-lg font-bold">{readingTime} min</div>
          <div className="text-xs text-muted-foreground">Reading Time</div>
        </div>
      </div>

      {sentences.length > 0 && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground">Sentences:</p>
          {sentences.map((s, i) => (
            <div key={i} className="text-xs p-2 bg-muted/20 rounded-lg">{i + 1}. {s.trim()}</div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied!"); }} className="rounded-xl text-xs gap-1"><Copy className="h-3 w-3" />Copy</Button>
        <Button variant="outline" size="sm" onClick={() => setText("")} className="rounded-xl text-xs gap-1"><Trash2 className="h-3 w-3" />Clear</Button>
      </div>
    </div>
  );
}