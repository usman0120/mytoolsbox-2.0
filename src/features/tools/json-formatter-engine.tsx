"use client";

import { useState } from "react";
import {
  Braces, Copy, Check, Trash2, Download, Wrench, Search, Sparkles, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  formatJSON, minifyJSON, repairJSON,
  queryJSON, jsonToCSV, jsonToYAML, type JSONProcessResult
} from "@/features/tools/json-formatter";
import { toast } from "sonner";

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
  const [outputReady, setOutputReady] = useState(false);

  const clearResult = () => {
    setOutput("");
    setOutputReady(false);
    setStats(null);
    setError(null);
    setCopied(false);
  };

  const changeInput = (value: string) => {
    setInput(value);
    clearResult();
  };

  const handleProcess = (overrideMode?: typeof mode) => {
    clearResult();
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
      setOutputReady(true);
    }
  };

  const handleCopy = async () => {
    if (!outputReady) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the result. Select the output to copy it manually.");
    }
  };

  const handleDownload = () => {
    if (!outputReady) return;
    const ext = mode === "yaml" ? "yaml" : mode === "csv" ? "csv" : mode === "query" ? "txt" : "json";
    const mime = mode === "yaml" ? "text/yaml" : mode === "csv" ? "text/csv" : mode === "query" ? "text/plain" : "application/json";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `toolbox-${mode}-${Date.now()}.${ext}`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(value) => { setMode(value as typeof mode); clearResult(); }}>
        <TabsList aria-label="JSON operation" className="grid h-auto w-full grid-cols-3 gap-1 group-data-horizontal/tabs:h-auto sm:grid-cols-6">
          <TabsTrigger value="format" className="min-h-11">Format</TabsTrigger>
          <TabsTrigger value="minify" className="min-h-11">Minify</TabsTrigger>
          <TabsTrigger value="repair" className="min-h-11">Repair</TabsTrigger>
          <TabsTrigger value="yaml" className="min-h-11">YAML</TabsTrigger>
          <TabsTrigger value="csv" className="min-h-11">CSV</TabsTrigger>
          <TabsTrigger value="query" className="min-h-11">Query</TabsTrigger>
        </TabsList>
        <TabsContent value={mode} className="space-y-4">
      {mode === "format" && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Label htmlFor="json-indent">Indentation</Label>
            <select id="json-indent" value={String(indent)} className="h-11 rounded-md border bg-background px-3 text-sm"
              onChange={(event) => { setIndent(event.target.value === "\t" ? "\t" : Number(event.target.value) as 2 | 4); clearResult(); }}>
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value={"\t"}>Tabs</option>
            </select>
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-2">
            <input type="checkbox" checked={sortKeys} className="h-4 w-4 accent-primary"
              onChange={(event) => { setSortKeys(event.target.checked); clearResult(); }} />
            Sort keys (A-Z)
          </label>
        </div>
      )}

      {mode === "query" && (
        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor="json-path" className="shrink-0">JSONPath</Label>
          <Input
            id="json-path"
            value={queryPath}
            onChange={(event) => { setQueryPath(event.target.value); clearResult(); }}
            placeholder="e.g. $.stats.totalUsers or modules[0]"
            className="h-11 min-w-0 flex-1 basis-48 font-mono text-sm"
            onKeyDown={e => e.key === "Enter" && handleProcess("query")}
          />
        </div>
      )}

      {/* Input / Output Workspace */}
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Input Column */}
        <div className="min-w-0 space-y-2">
          <div className="flex min-h-11 items-center justify-between gap-2">
            <Label htmlFor="json-input" className="font-medium">JSON input</Label>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-muted-foreground"
                onClick={() => changeInput(SAMPLE_JSON)}
                aria-label="Load sample JSON" title="Load sample JSON"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-muted-foreground hover:text-destructive"
                onClick={() => changeInput("")}
                aria-label="Clear JSON input and output" title="Clear JSON input and output"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Textarea
            id="json-input"
            placeholder="Paste your JSON string here..."
            className="min-h-60 resize-y bg-background font-mono text-sm leading-relaxed lg:min-h-96"
            value={input}
            onChange={(event) => changeInput(event.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "json-error" : undefined}
            spellCheck={false}
          />
          <Button onClick={() => handleProcess()} disabled={!input.trim()} className="min-h-11 w-full gap-2">
            {mode === "query" ? <Search className="h-4 w-4" /> : <Braces className="h-4 w-4" />} Process JSON
          </Button>
        </div>

        {/* Output Column */}
        <div className="min-w-0 space-y-2">
          <div className="flex min-h-11 items-center justify-between gap-2">
            <Label htmlFor={error ? undefined : "json-output"} className="font-medium">
              {mode === "yaml" ? "YAML output" : mode === "csv" ? "CSV output" : mode === "query" ? "Query result" : "JSON output"}
            </Label>
              <div className="flex gap-1.5">
                <Button variant="outline" size="icon" onClick={handleCopy} disabled={!outputReady} className="h-11 w-11"
                  aria-label={copied ? "Result copied" : "Copy result"} title={copied ? "Result copied" : "Copy result"}>
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={handleDownload} disabled={!outputReady} className="h-11 w-11"
                  aria-label="Download result" title="Download result">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
          </div>

          {error ? (
            <div id="json-error" role="alert" className="flex min-h-60 items-center justify-center rounded-lg border border-destructive/40 bg-destructive/5 p-4 lg:min-h-96">
              <div className="text-center space-y-2 max-w-md">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                <h4 className="font-semibold text-destructive text-sm">JSON Parsing Error</h4>
                <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap break-all">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1 mt-2"
                  onClick={() => { setMode("repair"); handleProcess("repair"); }}
                >
                  <Wrench className="h-3 w-3" /> Try Auto-Repair
                </Button>
              </div>
            </div>
          ) : (
            <Textarea
              id="json-output"
              readOnly
              value={output}
              placeholder="No result yet"
              spellCheck={false}
              className="min-h-60 resize-y bg-muted/30 font-mono text-sm leading-relaxed lg:min-h-96"
            />
          )}

          <p role="status" className="text-xs text-muted-foreground">{copied ? "Result copied." : outputReady ? "Processing complete." : ""}</p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}