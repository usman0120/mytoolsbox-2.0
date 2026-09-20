"use client";

import { useState } from "react";
import { ArrowLeftRight, Copy, Download, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Mode = "json-to-xml" | "xml-to-json" | "json-to-yaml" | "yaml-to-json";

function jsonToXml(obj: unknown, rootName = "root"): string {
  if (obj === null || obj === undefined) return `<${rootName} />`;
  if (typeof obj !== "object") return `<${rootName}>${obj}</${rootName}>`;
  if (Array.isArray(obj)) {
    return obj.map((item, i) => jsonToXml(item, "item")).join("\n");
  }
  const attrs = Object.entries(obj as Record<string, unknown>)
    .map(([k, v]) => {
      if (v === null || v === undefined) return `<${k} />`;
      if (typeof v === "object") return jsonToXml(v, k);
      return `<${k}>${v}</${k}>`;
    }).join("\n");
  return rootName === "root" ? `<${rootName}>\n${attrs}\n</${rootName}>` : `<${rootName}>\n${attrs}\n</${rootName}>`;
}

function jsonToYaml(obj: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (obj === null || obj === undefined) return "null";
  if (typeof obj !== "object") return String(obj);
  if (Array.isArray(obj)) {
    return obj.map(item => `${pad}- ${jsonToYaml(item, indent + 1).trimStart()}`).join("\n");
  }
  return Object.entries(obj as Record<string, unknown>)
    .map(([k, v]) => {
      if (v === null || v === undefined) return `${pad}${k}: null`;
      if (typeof v === "object") return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
      return `${pad}${k}: ${v}`;
    }).join("\n");
}

export function JSONXMLYAMLConverterEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("json-to-xml");
  const [error, setError] = useState<string | null>(null);

  const modeLabels: Record<Mode, string> = {
    "json-to-xml": "JSON → XML",
    "xml-to-json": "XML → JSON",
    "json-to-yaml": "JSON → YAML",
    "yaml-to-json": "YAML → JSON",
  };

  const handleConvert = () => {
    setError(null);
    try {
      if (mode === "json-to-xml") {
        const obj = JSON.parse(input);
        setOutput(jsonToXml(obj));
      } else if (mode === "json-to-yaml") {
        const obj = JSON.parse(input);
        setOutput(jsonToYaml(obj));
      } else if (mode === "xml-to-json") {
        const parser = new DOMParser();
        const doc = parser.parseFromString(input, "text/xml");
        const err = doc.querySelector("parsererror");
        if (err) { setError("Invalid XML."); return; }
        const xml2json = (el: Element): unknown => {
          const obj: Record<string, unknown> = {};
          for (const child of Array.from(el.children)) {
            const val = child.children.length > 0 ? xml2json(child) : child.textContent;
            if (obj[child.tagName] !== undefined) {
              if (!Array.isArray(obj[child.tagName])) obj[child.tagName] = [obj[child.tagName]];
              (obj[child.tagName] as unknown[]).push(val);
            } else {
              obj[child.tagName] = val;
            }
          }
          return Object.keys(obj).length === 0 ? el.textContent : obj;
        };
        setOutput(JSON.stringify(xml2json(doc.documentElement), null, 2));
      } else if (mode === "yaml-to-json") {
        const lines = input.split("\n");
        const result: Record<string, unknown> = {};
        let currentKey = "";
        const arrayItems: unknown[] = [];
        let inArray = false;
        for (const line of lines) {
          if (!line.trim() || line.trim().startsWith("#")) continue;
          if (line.trim().startsWith("- ")) {
            inArray = true;
            arrayItems.push(line.trim().slice(2));
          } else if (line.includes(":")) {
            if (inArray && currentKey) { result[currentKey] = [...arrayItems]; arrayItems.length = 0; inArray = false; }
            const [k, ...v] = line.split(":");
            currentKey = k.trim();
            const val = v.join(":").trim();
            result[currentKey] = val === "null" ? null : val === "true" ? true : val === "false" ? false : isNaN(Number(val)) || val === "" ? val : Number(val);
          }
        }
        if (inArray && currentKey) result[currentKey] = [...arrayItems];
        setOutput(JSON.stringify(result, null, 2));
      }
      toast.success("Conversion complete.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
    }
  };

  const handleCopy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied."); };
  const handleDownload = () => {
    const exts: Record<Mode, string> = { "json-to-xml": "xml", "xml-to-json": "json", "json-to-yaml": "yaml", "yaml-to-json": "json" };
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `converted.${exts[mode]}`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">{modeLabels[mode]}</Badge>
        <span className="text-xs text-muted-foreground">Convert between JSON, XML, and YAML formats</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(modeLabels) as Mode[]).map(m => (
          <Button key={m} variant={mode === m ? "default" : "outline"} size="sm" onClick={() => { setMode(m); setOutput(""); }} className="rounded-xl text-xs">{modeLabels[m]}</Button>
        ))}
      </div>

      <textarea
        value={input} onChange={(e) => setInput(e.target.value)}
        placeholder={`Paste ${mode.startsWith("json") ? "JSON" : mode.startsWith("xml") ? "XML" : "YAML"} here...`}
        className="w-full h-32 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
      />

      {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

      <Button onClick={handleConvert} disabled={!input.trim()} className="gap-2 rounded-xl w-full"><ArrowLeftRight className="h-4 w-4" />Convert</Button>

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Output</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="rounded-xl text-xs">Copy</Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} className="rounded-xl text-xs"><Download className="h-3 w-3 mr-1" />Download</Button>
            </div>
          </div>
          <pre className="p-3 bg-muted/30 rounded-xl text-xs font-mono max-h-75 overflow-y-auto whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}