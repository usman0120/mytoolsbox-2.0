"use client";

import { useState } from "react";
import { Link, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function SlugGeneratorEngine() {
  const [text, setText] = useState("");
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);

  const generateSlug = (input: string) => {
    let slug = input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s_-]/g, "")
      .trim()
      .replace(/[\s_]+/g, separator)
      .replace(new RegExp(`${separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}+`, "g"), separator);
    if (lowercase) slug = slug.toLowerCase();
    return slug;
  };

  const slug = generateSlug(text);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Slug Generator</Badge>
        <span className="text-xs text-muted-foreground">Generate URL-friendly slugs from text</span>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium">Input Text</label>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="My Article Title Here!" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      <div className="flex gap-2">
        <Button variant={separator === "-" ? "default" : "outline"} size="sm" onClick={() => setSeparator("-")} className="rounded-xl text-xs">Hyphen (-)</Button>
        <Button variant={separator === "_" ? "default" : "outline"} size="sm" onClick={() => setSeparator("_")} className="rounded-xl text-xs">Underscore (_)</Button>
        <Button variant={lowercase ? "default" : "outline"} size="sm" onClick={() => setLowercase(!lowercase)} className="rounded-xl text-xs">lowercase</Button>
      </div>

      {slug && (
        <div className="p-3 bg-muted/30 rounded-xl">
          <div className="text-sm font-mono break-all">{slug}</div>
          <div className="text-xs text-muted-foreground mt-1">{slug.length} characters</div>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(slug); toast.success("Slug copied!"); }} disabled={!slug} className="rounded-xl text-xs gap-1"><Copy className="h-3 w-3" />Copy Slug</Button>
        <Button variant="outline" size="sm" onClick={() => setText("")} className="rounded-xl text-xs gap-1"><Trash2 className="h-3 w-3" />Clear</Button>
      </div>
    </div>
  );
}