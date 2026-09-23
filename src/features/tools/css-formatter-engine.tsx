"use client";

import { useState, useMemo, useId } from "react";
import {
  Paintbrush,
  Copy,
  Check,
  Trash2,
  Minus,
  AlignLeft,
  Download,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { formatCSS, minifyCSS } from "@/features/tools/css-formatter";
import { toast } from "sonner";

const SAMPLE_CSS = `/* Card Component Styles */
.card-container{padding:24px;border-radius:12px;background-color:#ffffff;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);display:flex;flex-direction:column;max-width:400px;margin:0 auto;}
.card-title{font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:8px;}
.card-body{color:#64748b;line-height:1.6;font-size:0.875rem;}
@media (max-width: 640px){
.card-container{padding:16px;margin:8px;}
.card-title{font-size:1.25rem;}
}`;

export function CSSFormatterEngine() {
  const [input, setInput] = useState(SAMPLE_CSS);
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [indent, setIndent] = useState<2 | 4 | "tab">(2);
  const [sortProperties, setSortProperties] = useState(false);
  const [preserveComments, setPreserveComments] = useState(true);
  const [copied, setCopied] = useState(false);

  const sortId = useId();
  const commentsId = useId();

  const result = useMemo(() => {
    if (!input.trim()) return null;
    if (mode === "minify") {
      return minifyCSS(input);
    }
    return formatCSS(input, {
      indentSize: indent === "tab" ? 2 : indent,
      useTabs: indent === "tab",
      sortProperties,
      preserveComments,
    });
  }, [input, mode, indent, sortProperties, preserveComments]);

  const output = result?.data?.output || "";

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `styles-${mode}-${Date.now()}.css`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded CSS file!");
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant={mode === "format" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("format")}
            className="h-8 text-xs gap-1.5"
          >
            <AlignLeft className="h-3.5 w-3.5" /> Format (Beautify)
          </Button>
          <Button
            variant={mode === "minify" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("minify")}
            className="h-8 text-xs gap-1.5"
          >
            <Minus className="h-3.5 w-3.5" /> Minify (Compact)
          </Button>
        </div>

        {mode === "format" && (
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-md text-xs">
            <span className="text-muted-foreground font-medium px-1">Indent:</span>
            {([2, 4, "tab"] as const).map((opt) => (
              <Button
                key={String(opt)}
                variant={indent === opt ? "secondary" : "ghost"}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setIndent(opt)}
              >
                {opt === "tab" ? "Tab" : `${opt} spaces`}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Options row */}
      {mode === "format" && (
        <div className="flex flex-wrap items-center gap-6 p-2.5 bg-muted/40 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <Switch
              id={sortId}
              checked={sortProperties}
              onCheckedChange={setSortProperties}
            />
            <Label htmlFor={sortId} className="cursor-pointer font-medium flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3 text-primary" /> Sort CSS Declarations A-Z
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id={commentsId}
              checked={preserveComments}
              onCheckedChange={setPreserveComments}
            />
            <Label htmlFor={commentsId} className="cursor-pointer font-medium">
              Keep /* comments */
            </Label>
          </div>
        </div>
      )}

      {/* Editor textareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <Paintbrush className="h-4 w-4 text-primary" /> Input CSS
            </Label>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setInput(SAMPLE_CSS)}
              >
                <Sparkles className="h-3 w-3 mr-1" /> Reset Sample
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => setInput("")}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Clear
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Paste your CSS here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-80 font-mono text-xs leading-relaxed"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              {mode === "format" ? "Formatted CSS" : "Minified CSS"}
            </Label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleCopy}
                disabled={!output}
              >
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleDownload}
                disabled={!output}
              >
                <Download className="h-3 w-3" /> Save .css
              </Button>
            </div>
          </div>

          <Textarea
            readOnly
            value={output}
            placeholder="Processed CSS will appear here..."
            className="min-h-80 font-mono text-xs leading-relaxed bg-muted/40 cursor-text"
          />

          {result?.data && (
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <Badge variant="secondary">
                Original: {result.data.originalBytes.toLocaleString()} bytes
              </Badge>
              <Badge variant="secondary">
                Result: {result.data.resultBytes.toLocaleString()} bytes
              </Badge>
              <Badge variant="outline">
                Saved: {result.data.diffPct}
              </Badge>
              <Badge variant="outline">
                Rules: {result.data.ruleCount}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}