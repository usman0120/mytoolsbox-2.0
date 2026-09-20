"use client";

import { useState } from "react";
import { Type, Copy, Trash2, CaseUpper, CaseLower, CaseSensitive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function TextFormatterEngine() {
  const [text, setText] = useState("");

  const operations = {
    uppercase: () => setText(text.toUpperCase()),
    lowercase: () => setText(text.toLowerCase()),
    titleCase: () => setText(text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())),
    sentenceCase: () => setText(text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase())),
    trim: () => setText(text.trim().replace(/\s+/g, " ")),
    removeExtraLines: () => setText(text.replace(/\n\s*\n\s*\n/g, "\n\n")),
    stripHtml: () => setText(text.replace(/<[^>]*>/g, "")),
    reverse: () => setText(text.split("").reverse().join("")),
    alternateCase: () => setText(text.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join("")),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Text Formatter</Badge>
        <span className="text-xs text-muted-foreground">Transform text case & formatting</span>
      </div>

      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here..." className="w-full h-36 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />

      <div className="flex flex-wrap gap-1.5">
        {[
          { label: "UPPER", icon: CaseUpper, action: operations.uppercase },
          { label: "lower", icon: CaseLower, action: operations.lowercase },
          { label: "Title Case", icon: Type, action: operations.titleCase },
          { label: "Sentence case", icon: CaseSensitive, action: operations.sentenceCase },
          { label: "Trim Spaces", action: operations.trim },
          { label: "Remove Extra Lines", action: operations.removeExtraLines },
          { label: "Strip HTML", action: operations.stripHtml },
          { label: "Reverse", action: operations.reverse },
          { label: "aLtErNaTe", action: operations.alternateCase },
        ].map(op => (
          <Button key={op.label} variant="outline" size="sm" onClick={op.action} disabled={!text} className="rounded-xl text-xs gap-1">
            {op.icon && <op.icon className="h-3 w-3" />}{op.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied!"); }} className="rounded-xl text-xs gap-1"><Copy className="h-3 w-3" />Copy</Button>
        <Button variant="outline" size="sm" onClick={() => setText("")} className="rounded-xl text-xs gap-1"><Trash2 className="h-3 w-3" />Clear</Button>
      </div>
    </div>
  );
}