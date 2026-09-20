"use client";

import { useState, useCallback } from "react";
import { Braces, Copy, Check, Trash2, TreePine, Download, Upload, Search, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface JSONNode {
  key: string;
  value: unknown;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  path: string;
  children?: JSONNode[];
}

function parseToTree(obj: unknown, key: string, path: string): JSONNode {
  if (obj === null) return { key, value: "null", type: "null", path };
  if (Array.isArray(obj)) {
    return {
      key,
      value: `[${obj.length} items]`,
      type: "array",
      path,
      children: obj.map((item, i) => parseToTree(item, `[${i}]`, `${path}[${i}]`)),
    };
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    return {
      key,
      value: `{${entries.length} keys}`,
      type: "object",
      path,
      children: entries.map(([k, v]) => parseToTree(v, k, `${path}.${k}`)),
    };
  }
  return { key, value: String(obj), type: typeof obj as JSONNode["type"], path };
}

function TreeNode({ node, depth = 0 }: { node: JSONNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  const typeColors: Record<string, string> = {
    object: "text-purple-600 dark:text-purple-400",
    array: "text-blue-600 dark:text-blue-400",
    string: "text-green-600 dark:text-green-400",
    number: "text-amber-600 dark:text-amber-400",
    boolean: "text-cyan-600 dark:text-cyan-400",
    null: "text-gray-400",
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 py-0.5 hover:bg-muted/50 rounded px-1 cursor-pointer font-mono text-sm"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        {node.key && <span className="text-foreground font-medium">{node.key}</span>}
        {node.key && <span className="text-muted-foreground">: </span>}
        <span className={typeColors[node.type]}>
          {node.type === "string" ? `"${node.value}"` : String(node.value)}
        </span>
        <span className="text-[10px] text-muted-foreground ml-1">{node.type}</span>
      </div>
      {expanded && hasChildren && node.children!.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function JSONValidatorEngine() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<unknown>(null);
  const [tree, setTree] = useState<JSONNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ keys: number; depth: number; size: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const handleValidate = useCallback(() => {
    setError(null);
    setParsed(null);
    setTree(null);
    setStats(null);
    setSearchResults([]);

    if (!input.trim()) {
      setError("Please enter JSON to validate.");
      return;
    }

    try {
      const obj = JSON.parse(input);
      setParsed(obj);
      const root = parseToTree(obj, "root", "$");
      setTree(root);

      // Calculate stats
      const countKeys = (o: unknown): number => {
        if (Array.isArray(o)) return o.reduce((acc, item) => acc + countKeys(item), 0);
        if (o && typeof o === "object") return Object.keys(o as object).length + Object.values(o as object).reduce((acc, v) => acc + countKeys(v), 0);
        return 0;
      };
      const getDepth = (o: unknown): number => {
        if (Array.isArray(o)) return 1 + Math.max(0, ...o.map(getDepth));
        if (o && typeof o === "object") return 1 + Math.max(0, ...Object.values(o as object).map(getDepth));
        return 0;
      };
      setStats({
        keys: countKeys(obj),
        depth: getDepth(obj),
        size: new Blob([input]).size < 1024 ? `${new Blob([input]).size} B` : `${(new Blob([input]).size / 1024).toFixed(1)} KB`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid JSON";
      const match = msg.match(/at position (\d+)/);
      if (match) {
        const pos = parseInt(match[1]);
        const lines = input.substring(0, pos).split("\n");
        setError(`Syntax error at line ${lines.length}, column ${lines[lines.length - 1].length + 1}: ${msg}`);
      } else {
        setError(msg);
      }
    }
  }, [input]);

  const handleSearch = () => {
    if (!searchTerm.trim() || !parsed) return;
    const results: string[] = [];
    const search = (obj: unknown, path: string) => {
      if (typeof obj === "string" && obj.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push(`${path}: "${obj}"`);
      } else if (typeof obj === "number" && String(obj).includes(searchTerm)) {
        results.push(`${path}: ${obj}`);
      } else if (obj && typeof obj === "object") {
        if (Array.isArray(obj)) {
          obj.forEach((item, i) => search(item, `${path}[${i}]`));
        } else {
          Object.entries(obj as Record<string, unknown>).forEach(([k, v]) => {
            if (k.toLowerCase().includes(searchTerm.toLowerCase())) {
              results.push(`${path}.${k} (key match)`);
            }
            search(v, `${path}.${k}`);
          });
        }
      }
    };
    search(parsed, "$");
    setSearchResults(results);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    if (!parsed) return;
    const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "validated.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setInput(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Input section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">JSON Input</Label>
          <div className="flex gap-1">
            <label>
              <input type="file" accept=".json,.txt" className="hidden" onChange={handleFileUpload} />
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => {}}>
                <Upload className="h-3 w-3" /> Import
              </Button>
            </label>
          </div>
        </div>
        <Textarea
          placeholder='{"name": "John", "age": 30, "items": [1, 2, 3]}'
          className="font-mono text-sm min-h-40"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleValidate} className="gap-2" disabled={!input.trim()}>
          <Braces className="h-4 w-4" /> Validate & Analyze
        </Button>
        <Button variant="outline" size="icon" onClick={() => { setInput(""); setError(null); setParsed(null); setTree(null); setStats(null); }}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Error display */}
      {error ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-destructive mb-1">Validation Error</p>
            <p className="text-sm text-destructive/80 font-mono">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Stats display */}
      {stats ? (
        <div className="flex gap-3 flex-wrap">
          <Badge variant="secondary" className="gap-1"><TreePine className="h-3 w-3" /> {stats.keys} keys</Badge>
          <Badge variant="secondary" className="gap-1">↕ {stats.depth} levels deep</Badge>
          <Badge variant="secondary" className="gap-1">{stats.size}</Badge>
          <Badge variant="default" className="gap-1">✓ Valid JSON</Badge>
        </div>
      ) : null}

      {/* Tree view */}
      {tree ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Structure</Label>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => handleCopy(JSON.stringify(parsed as object, null, 2))}>
                <Copy className="h-3 w-3" /> Copy
              </Button>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleDownload}>
                <Download className="h-3 w-3" /> Download
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-3 max-h-100 overflow-auto">
              <TreeNode node={tree} />
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Search */}
      {parsed ? (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search in JSON</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Search keys or values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={handleSearch} className="gap-1">
              <Search className="h-3.5 w-3.5" /> Find
            </Button>
          </div>
          {searchResults.length > 0 && (
            <Card>
              <CardContent className="p-3 max-h-50 overflow-auto">
                <p className="text-xs text-muted-foreground mb-2">{searchResults.length} result(s)</p>
                {searchResults.map((r, i) => (
                  <p key={i} className="text-sm font-mono py-0.5">{r}</p>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}