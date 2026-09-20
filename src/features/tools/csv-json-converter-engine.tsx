"use client";

import { useState, useRef } from "react";
import { Upload, Download, Loader2, AlertCircle, FileOutput, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type ConversionMode = "csv-to-json" | "json-to-csv";

export function CSVJSONConverterEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<ConversionMode>("csv-to-json");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (csv: string): Record<string, string>[] => {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ""; });
      return obj;
    });
  };

  const jsonToCSV = (json: Record<string, unknown>[]): string => {
    if (json.length === 0) return "";
    const headers = Object.keys(json[0]);
    const lines = [headers.join(",")];
    for (const row of json) {
      lines.push(headers.map(h => {
        const val = String(row[h] ?? "");
        return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(","));
    }
    return lines.join("\n");
  };

  const handleConvert = () => {
    setError(null);
    setIsProcessing(true);

    try {
      if (mode === "csv-to-json") {
        const parsed = parseCSV(input);
        if (parsed.length === 0) { setError("No data found in CSV."); setIsProcessing(false); return; }
        setOutput(JSON.stringify(parsed, null, 2));
        toast.success(`Converted ${parsed.length} row(s) to JSON.`);
      } else {
        const parsed = JSON.parse(input);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        setOutput(jsonToCSV(arr));
        toast.success(`Converted ${arr.length} row(s) to CSV.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setInput(reader.result as string); setOutput(""); setError(null); };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const ext = mode === "csv-to-json" ? "json" : "csv";
    const mime = mode === "csv-to-json" ? "application/json" : "text/csv";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `converted.${ext}`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">CSV ↔ JSON</Badge>
        <span className="text-xs text-muted-foreground">Convert between CSV and JSON formats</span>
      </div>

      <div className="flex gap-2">
        <Button variant={mode === "csv-to-json" ? "default" : "outline"} size="sm" onClick={() => { setMode("csv-to-json"); setOutput(""); }} className="rounded-xl text-xs">CSV → JSON</Button>
        <Button variant={mode === "json-to-csv" ? "default" : "outline"} size="sm" onClick={() => { setMode("json-to-csv"); setOutput(""); }} className="rounded-xl text-xs">JSON → CSV</Button>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">{mode === "csv-to-json" ? "CSV Input" : "JSON Input"}</span>
          <div className="flex gap-1">
            <input ref={fileInputRef} type="file" accept={mode === "csv-to-json" ? ".csv" : ".json"} onChange={handleFileLoad} className="hidden" />
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-xl text-xs"><Upload className="h-3 w-3 mr-1" />Load File</Button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "csv-to-json" ? "name,age,city\nJohn,30,NYC\nJane,25,LA" : '[{"name":"John","age":30}]'}
          className="w-full h-32 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      <Button onClick={handleConvert} disabled={!input.trim() || isProcessing} className="gap-2 rounded-xl w-full">
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
        Convert
      </Button>

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Output</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="rounded-xl text-xs">Copy</Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} className="rounded-xl text-xs"><Download className="h-3 w-3 mr-1" />Download</Button>
            </div>
          </div>
          <pre className="p-3 bg-muted/30 rounded-xl text-xs font-mono max-h-[300px] overflow-y-auto whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}