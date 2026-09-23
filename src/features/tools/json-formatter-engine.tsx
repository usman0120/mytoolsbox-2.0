"use client";

import { useState } from "react";
import {
  Braces, Copy, Check, Trash2, Minus, AlignLeft, Download,
  Wrench, FileSpreadsheet, FileCode, Search, Sparkles, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatJSON, minifyJSON, validateJSON, repairJSON,
  queryJSON, jsonToCSV, jsonToYAML, type JSONProcessResult
} from "@/features/tools/json-formatter";

const SAMPLE_JSON = `{
  "projectName": "Toolbox Suite",
  "version": "2.4.0",
  "active": true,
  "stats": {
    "totalUsers": 125000,
    "rating": 4.9
  },
  "modules": ["documents", "media", "financial", "developer"],
  "tags": ["productivity", "developer-tools", "utilities"]
}`;

export function JSONFormatterEngine() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState<2 | 4 | "\t">(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [mode, setMode] = useState<"format" | "minify" | "repair" | "yaml" | "csv" | "query">("format");
  const [queryPath, setQueryPath] = useState("$.stats.totalUsers");
  const [stats, setStats] = useState<JSONProcessResult["stats"] | null>(null);

  const handleProcess = (overrideMode?: typeof mode) => {
    setError(null);
    const activeMode = overrideMode || mode;
    let res: JSONProcessResult;

    switch (activeMode) {
      case "format":
        res = formatJSON(input, { indent, sortKeys });
        break;
      case "minify":
        res = minifyJSON(input);
        break;
      case "repair":
        res = repairJSON(input);
        break;
      case "yaml":
        res = jsonToYAML(input);
        break;
      case "csv":
        res = jsonToCSV(input);
        break;
      case "query":
        res = queryJSON(input, queryPath);
        break;
      default:
        res = formatJSON(input);
    }

    if (!res.success) {
      setError(res.error || "Invalid JSON syntax.");
      setOutput(res.output || "");
      setStats(undefined);
    } else {
      setOutput(res.output);
      setStats(res.stats);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const ext = mode === "yaml" ? "yaml" : mode === "csv" ? "csv" : "json";
    const mime = mode === "yaml" ? "text/yaml" : mode === "csv" ? "text/csv" : "application/json";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toolbox-${mode}-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar / Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border bg-card/60">
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={mode === "format" ? "default" : "outline"}
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={() => { setMode("format"); handleProcess("format"); }}
          >
            <AlignLeft className="h-3.5 w-3.5" /> Beautify
          </Button>
          <Button
            variant={mode === "minify" ? "default" : "outline"}
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={() => { setMode("minify"); handleProcess("minify"); }}
          >
            <Minus className="h-3.5 w-3.5" /> Minify
          </Button>
          <Button
            variant={mode === "repair" ? "default" : "outline"}
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={() => { setMode("repair"); handleProcess("repair"); }}
          >
            <Wrench className="h-3.5 w-3.5" /> Auto-Fix / Repair
          </Button>
          <Button
            variant={mode === "yaml" ? "default" : "outline"}
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={() => { setMode("yaml"); handleProcess("yaml"); }}
          >
            <FileCode className="h-3.5 w-3.5" /> JSON to YAML
          </Button>
          <Button
            variant={mode === "csv" ? "default" : "outline"}
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={() => { setMode("csv"); handleProcess("csv"); }}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> JSON to CSV
          </Button>
          <Button
            variant={mode === "query" ? "default" : "outline"}
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={() => { setMode("query"); handleProcess("query"); }}
          >
            <Search className="h-3.5 w-3.5" /> JSONPath Filter
          </Button>
        </div>

        {/* Options */}
        {mode === "format" && (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Indent:</span>
              <div className="flex bg-muted rounded p-0.5">
                <button
                  onClick={() => setIndent(2)}
                  className={`px-2 py-0.5 rounded ${indent === 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  2
                </button>
                <button
                  onClick={() => setIndent(4)}
                  className={`px-2 py-0.5 rounded ${indent === 4 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  4
                </button>
                <button
                  onClick={() => setIndent("\t")}
                  className={`px-2 py-0.5 rounded ${indent === "\t" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Tab
                </button>
              </div>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={e => setSortKeys(e.target.checked)}
                className="rounded"
              />
              <span>Sort Keys (A-Z)</span>
            </label>
          </div>
        )}
      </div>

      {/* JSONPath Query Bar if active */}
      {mode === "query" && (
        <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
          <Label className="text-xs font-mono shrink-0">JSONPath:</Label>
          <Input
            value={queryPath}
            onChange={e => setQueryPath(e.target.value)}
            placeholder="e.g. $.stats.totalUsers or modules[0]"
            className="font-mono text-xs h-8"
            onKeyDown={e => e.key === "Enter" && handleProcess("query")}
          />
          <Button size="sm" className="h-8 gap-1 text-xs" onClick={() => handleProcess("query")}>
            <Search className="h-3 w-3" /> Query
          </Button>
        </div>
      )}

      {/* Input / Output Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Column */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Label className="font-semibold text-foreground">JSON Input</Label>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setInput(SAMPLE_JSON)}
              >
                <Sparkles className="h-3 w-3 mr-1" /> Load Sample
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => { setInput(""); setOutput(""); setError(null); }}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Clear
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Paste your JSON string here..."
            className="font-mono text-xs min-h-[360px] leading-relaxed resize-y bg-background"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => handleProcess()} className="w-full gap-2">
            <Braces className="h-4 w-4" /> Process JSON ({mode.toUpperCase()})
          </Button>
        </div>

        {/* Output Column */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Label className="font-semibold text-foreground">
              {mode === "yaml" ? "YAML Output" : mode === "csv" ? "CSV Output" : "Formatted JSON"}
            </Label>
            {output && (
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" onClick={handleCopy} className="h-6 text-xs gap-1">
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="h-6 text-xs gap-1">
                  <Download className="h-3 w-3" /> Download
                </Button>
              </div>
            )}
          </div>

          {error ? (
            <Card className="border-destructive/40 bg-destructive/5 min-h-[360px] flex items-center justify-center p-6">
              <div className="text-center space-y-2 max-w-md">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                <h4 className="font-semibold text-destructive text-sm">JSON Parsing Error</h4>
                <p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1 mt-2"
                  onClick={() => { setMode("repair"); handleProcess("repair"); }}
                >
                  <Wrench className="h-3 w-3" /> Try Auto-Repair
                </Button>
              </div>
            </Card>
          ) : (
            <Textarea
              readOnly
              value={output || "Click Process JSON to view formatted output..."}
              className="font-mono text-xs min-h-[360px] leading-relaxed resize-y bg-muted/30"
            />
          )}

          {/* Stats Bar */}
          {stats && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <Badge variant="secondary" className="font-mono">
                Size: {stats.originalSize} B → {stats.formattedSize} B
              </Badge>
              <Badge variant="secondary" className="font-mono">
                {stats.keyCount} keys
              </Badge>
              <Badge variant="secondary" className="font-mono">
                Depth: {stats.depth}
              </Badge>
              {stats.compressionPercent !== 0 && (
                <Badge variant="outline" className="font-mono text-primary">
                  {stats.compressionPercent > 0 ? `-${stats.compressionPercent}% space` : `+${Math.abs(stats.compressionPercent)}% formatting`}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}