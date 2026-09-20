"use client";

import { useState } from "react";
import { Search, Copy, Trash2, Replace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function FindReplaceEngine() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [count, setCount] = useState(0);

  const doReplace = () => {
    if (!find) return;
    try {
      let pattern: RegExp | string = find;
      if (useRegex) pattern = new RegExp(find, caseSensitive ? "g" : "gi");
      const newText = useRegex
        ? text.replace(pattern as RegExp, replace)
        : caseSensitive
          ? text.split(find).join(replace)
          : text.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), replace);
      const occurrences = useRegex
        ? (text.match(pattern as RegExp) || []).length
        : caseSensitive
          ? text.split(find).length - 1
          : (text.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length;
      setText(newText);
      setCount(occurrences);
      toast.success(`Replaced ${occurrences} occurrence(s)`);
    } catch {
      toast.error("Invalid regex pattern");
    }
  };

  const highlightMatches = () => {
    if (!find || !text) return text;
    try {
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = useRegex ? new RegExp(`(${find})`, caseSensitive ? "g" : "gi") : new RegExp(`(${escaped})`, caseSensitive ? "g" : "gi");
      return text.split(regex).map((part, i) => regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{part}</mark> : part);
    } catch { return text; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Find & Replace</Badge>
        <span className="text-xs text-muted-foreground">Search and replace text with regex support</span>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-medium">Find</label>
          <input type="text" value={find} onChange={(e) => setFind(e.target.value)} placeholder="Search for..." className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-medium">Replace with</label>
          <input type="text" value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="Replace with..." className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={caseSensitive ? "default" : "outline"} size="sm" onClick={() => setCaseSensitive(!caseSensitive)} className="rounded-xl text-xs">Aa</Button>
        <Button variant={useRegex ? "default" : "outline"} size="sm" onClick={() => setUseRegex(!useRegex)} className="rounded-xl text-xs">.* Regex</Button>
      </div>

      <div className="p-3 bg-muted/20 rounded-xl min-h-[80px] max-h-48 overflow-y-auto text-sm whitespace-pre-wrap">
        {find ? highlightMatches() : text || <span className="text-muted-foreground">Enter text above...</span>}
      </div>

      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter your text here..." className="w-full h-28 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />

      <div className="flex gap-2">
        <Button onClick={doReplace} disabled={!find || !text} className="gap-2 rounded-xl flex-1"><Replace className="h-4 w-4" />Replace All</Button>
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied!"); }} className="rounded-xl text-xs gap-1"><Copy className="h-3 w-3" /></Button>
        <Button variant="outline" size="sm" onClick={() => { setText(""); setFind(""); setReplace(""); setCount(0); }} className="rounded-xl text-xs gap-1"><Trash2 className="h-3 w-3" /></Button>
      </div>
    </div>
  );
}