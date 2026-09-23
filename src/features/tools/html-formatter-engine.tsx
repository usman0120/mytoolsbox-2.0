"use client";

import { useState, useMemo } from "react";
import {
  FileCode,
  Copy,
  Check,
  Trash2,
  Minus,
  AlignLeft,
  Download,
  Eye,
  Sparkles,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatHTML, minifyHTML } from "@/features/tools/html-formatter";
import { toast } from "sonner";

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Product Card Demo</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8fafc; }
.card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 320px; }
.btn { background: #6366f1; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; }
</style>
</head>
<body>
<div class="card">
<h2>Modern Web Tools</h2>
<p>Format and minify HTML documents cleanly with zero dependencies.</p>
<button class="btn">Explore Features</button>
</div>
</body>
</html>`;

export function HTMLFormatterEngine() {
  const [input, setInput] = useState(SAMPLE_HTML);
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [indent, setIndent] = useState<2 | 4 | "tab">(2);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [copied, setCopied] = useState(false);

  // Live processed result
  const result = useMemo(() => {
    if (!input.trim()) return null;
    if (mode === "minify") {
      return minifyHTML(input);
    }
    return formatHTML(input, {
      indentSize: indent === "tab" ? 2 : indent,
      useTabs: indent === "tab",
    });
  }, [input, mode, indent]);

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
    const blob = new Blob([output], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document-${mode}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded HTML file!");
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

        <div className="flex items-center gap-2">
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

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "code" | "preview")}>
            <TabsList className="h-8">
              <TabsTrigger value="code" className="text-xs gap-1">
                <FileCode className="h-3 w-3" /> Code
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs gap-1">
                <Eye className="h-3 w-3" /> Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {activeTab === "code" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input side */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-primary" /> Input HTML
              </Label>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setInput(SAMPLE_HTML)}
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
              placeholder="Paste raw or messy HTML here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-80 font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Output side */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                {mode === "format" ? "Beautified HTML" : "Minified HTML"}
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
                  <Download className="h-3 w-3" /> Save .html
                </Button>
              </div>
            </div>

            <Textarea
              readOnly
              value={output}
              placeholder="Processed HTML will appear here immediately..."
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
                  Size: {result.data.diffPct}
                </Badge>
                <Badge variant="outline">
                  Lines: {result.data.lineCount}
                </Badge>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Sandboxed Iframe Preview */
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Sandboxed Rendered Preview
              </span>
              <span className="text-[11px] text-muted-foreground">Safe Isolated iframe</span>
            </div>
            <div className="border rounded-xl overflow-hidden bg-white min-h-96">
              <iframe
                title="HTML Preview"
                srcDoc={output || input}
                sandbox="allow-scripts"
                className="w-full h-96 border-0"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}