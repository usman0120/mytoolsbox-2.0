"use client";

import { useState } from "react";
import { Code2, Copy, Download, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function XMLFormatterEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState(2);

  const formatXML = (xml: string, indent: number): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const err = doc.querySelector("parsererror");
    if (err) throw new Error(err.textContent || "Invalid XML");
    
    const serializer = new XMLSerializer();
    const formatNode = (node: Node, level: number): string => {
      const pad = " ".repeat(indent * level);
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        return text ? text : "";
      }
      if (node.nodeType === Node.COMMENT_NODE) return `${pad}<!--${node.textContent}-->`;
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const attrs = Array.from(el.attributes).map(a => ` ${a.name}="${a.value}"`).join("");
        const children = Array.from(el.childNodes);
        if (children.length === 0) return `${pad}<${el.tagName}${attrs} />`;
        if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
          return `${pad}<${el.tagName}${attrs}>${children[0].textContent?.trim() || ""}</${el.tagName}>`;
        }
        const childStr = children.map(c => formatNode(c, level + 1)).filter(Boolean).join("\n");
        return `${pad}<${el.tagName}${attrs}>\n${childStr}\n${pad}</${el.tagName}>`;
      }
      return "";
    };
    return formatNode(doc.documentElement, 0);
  };

  const handleFormat = () => {
    setError(null);
    try {
      setOutput(formatXML(input, indentSize));
      toast.success("XML formatted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Format failed.");
    }
  };

  const handleMinify = () => {
    setError(null);
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "text/xml");
      const err = doc.querySelector("parsererror");
      if (err) { setError("Invalid XML."); return; }
      const serializer = new XMLSerializer();
      setOutput(serializer.serializeToString(doc));
      toast.success("XML minified.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Minify failed.");
    }
  };

  const handleCopy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied."); };
  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "formatted.xml"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">XML Formatter</Badge>
        <span className="text-xs text-muted-foreground">Format, minify, and beautify XML</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Indent:</span>
        {[2, 4].map(n => (
          <Button key={n} variant={indentSize === n ? "default" : "outline"} size="sm" onClick={() => setIndentSize(n)} className="rounded-xl text-xs">{n} spaces</Button>
        ))}
      </div>

      <textarea
        value={input} onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your XML here..."
        className="w-full h-32 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
      />

      {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

      <div className="flex gap-2">
        <Button onClick={handleFormat} disabled={!input.trim()} className="gap-2 rounded-xl"><Code2 className="h-4 w-4" />Format</Button>
        <Button onClick={handleMinify} disabled={!input.trim()} variant="outline" className="gap-2 rounded-xl">Minify</Button>
        <Button onClick={() => { setInput(""); setOutput(""); setError(null); }} variant="ghost" size="icon" className="rounded-xl"><Trash2 className="h-4 w-4" /></Button>
      </div>

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