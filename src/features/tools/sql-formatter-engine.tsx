"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Database, Copy, Check, Trash2, Loader2, Sparkles,
  AlignLeft, MessageSquareText, Zap, Lightbulb,
} from "lucide-react";
import { formatSQL } from "@/lib/ai/services/sql-formatter";
import { getAvailableProviders } from "@/lib/ai";

// ---------------------------------------------------------------------------
// Client-side fallback – basic SQL formatting
// ---------------------------------------------------------------------------

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "EXISTS", "BETWEEN", "LIKE",
  "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
  "CREATE", "ALTER", "DROP", "TABLE", "INDEX", "VIEW", "TRIGGER",
  "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "CROSS JOIN", "ON",
  "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET", "UNION", "UNION ALL",
  "AS", "DISTINCT", "CASE", "WHEN", "THEN", "ELSE", "END",
  "ASC", "DESC", "NULLS FIRST", "NULLS LAST",
  "COUNT", "SUM", "AVG", "MIN", "MAX", "COALESCE", "NULLIF", "CAST",
  "PRIMARY KEY", "FOREIGN KEY", "REFERENCES", "NOT NULL", "DEFAULT", "UNIQUE", "CHECK",
  "BEGIN", "COMMIT", "ROLLBACK", "TRANSACTION",
  "IF", "ELSE", "WHILE", "FOR", "RETURN", "DECLARE",
];

function basicSQLFormat(sql: string): string {
  let formatted = sql.trim();

  // Uppercase keywords
  for (const keyword of SQL_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword.replace(/ /g, "\\s+")}\\b`, "gi");
    formatted = formatted.replace(regex, keyword);
  }

  // Add newlines before major clauses
  const majorClauses = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "ORDER BY", "GROUP BY",
    "HAVING", "LIMIT", "OFFSET", "JOIN", "INNER JOIN", "LEFT JOIN",
    "RIGHT JOIN", "FULL JOIN", "CROSS JOIN", "ON", "UNION", "INSERT",
    "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "ALTER",
  ];

  for (const clause of majorClauses) {
    const regex = new RegExp(`\\b${clause.replace(/ /g, "\\s+")}\\b`, "gi");
    formatted = formatted.replace(regex, `\n${clause}`);
  }

  // Clean up extra whitespace
  formatted = formatted.replace(/\n{3,}/g, "\n\n").trim();

  // Indent after SELECT (for column lists)
  const lines = formatted.split("\n");
  const result: string[] = [];
  let indent = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(SELECT|INSERT|UPDATE|CREATE|ALTER)\b/i.test(trimmed)) {
      result.push(trimmed);
      indent = true;
    } else if (/^(FROM|WHERE|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|JOIN|ON|SET|VALUES)\b/i.test(trimmed)) {
      indent = false;
      result.push(trimmed);
    } else if (indent && trimmed) {
      result.push("  " + trimmed);
    } else {
      result.push(trimmed);
    }
  }

  return result.join("\n");
}

function basicSQLExplain(sql: string): string {
  const upper = sql.toUpperCase();
  const parts: string[] = [];

  if (upper.includes("SELECT")) parts.push("Retrieves data");
  if (upper.includes("INSERT")) parts.push("Inserts new records");
  if (upper.includes("UPDATE")) parts.push("Updates existing records");
  if (upper.includes("DELETE")) parts.push("Deletes records");
  if (upper.includes("JOIN")) parts.push("by joining multiple tables");
  if (upper.includes("WHERE")) parts.push("with filtering conditions");
  if (upper.includes("GROUP BY")) parts.push("and groups results");
  if (upper.includes("ORDER BY")) parts.push("sorted in a specific order");
  if (upper.includes("LIMIT")) parts.push("limited to a certain number of rows");

  return parts.length > 0 ? parts.join(" ") + "." : "SQL statement detected.";
}

// ---------------------------------------------------------------------------
// Engine Component
// ---------------------------------------------------------------------------

type Action = "format" | "explain" | "optimize";
type Dialect = "mysql" | "postgresql" | "sqlite" | "mssql" | "oracle";

const ACTIONS: { id: Action; label: string; icon: typeof Database }[] = [
  { id: "format", label: "Format", icon: AlignLeft },
  { id: "explain", label: "Explain", icon: MessageSquareText },
  { id: "optimize", label: "Optimize", icon: Zap },
];

const DIALECTS: Dialect[] = ["mysql", "postgresql", "sqlite", "mssql", "oracle"];

export function SQLFormatterEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [action, setAction] = useState<Action>("format");
  const [dialect, setDialect] = useState<Dialect>("mysql");
  const [error, setError] = useState<string | null>(null);

  const hasAIProvider = getAvailableProviders().length > 0;

  const handleProcess = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      if (hasAIProvider) {
        const result = await formatSQL({ sql: input.trim(), dialect, action });
        setOutput(result.result);
        setSuggestions(result.suggestions ?? []);
      } else {
        // Fallback to basic client-side processing
        if (action === "format") {
          setOutput(basicSQLFormat(input.trim()));
          setSuggestions(["Basic formatting applied. Use AI for advanced formatting."]);
        } else if (action === "explain") {
          setOutput(basicSQLExplain(input.trim()));
          setSuggestions(["Basic explanation. Use AI for detailed analysis."]);
        } else {
          setOutput(basicSQLFormat(input.trim()));
          setSuggestions(["Optimization requires AI. Basic formatting applied instead."]);
        }
      }
    } catch {
      // Fallback
      if (action === "format") {
        setOutput(basicSQLFormat(input.trim()));
      } else if (action === "explain") {
        setOutput(basicSQLExplain(input.trim()));
      } else {
        setOutput(basicSQLFormat(input.trim()));
      }
      setSuggestions(["AI service unavailable. Basic processing applied."]);
      setError("AI service unavailable. Showing basic results.");
    } finally {
      setIsLoading(false);
    }
  }, [input, action, dialect, hasAIProvider]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setSuggestions([]);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Action & Dialect selectors */}
      <div className="flex gap-2 flex-wrap items-center">
        {ACTIONS.map((a) => (
          <Button
            key={a.id}
            variant={action === a.id ? "default" : "outline"}
            size="sm"
            onClick={() => setAction(a.id)}
            className="gap-1.5"
          >
            <a.icon className="h-3.5 w-3.5" />
            {a.label}
          </Button>
        ))}
        <div className="w-px h-6 bg-border mx-1" />
        <span className="text-xs text-muted-foreground">Dialect:</span>
        <select
          value={dialect}
          onChange={(e) => setDialect(e.target.value as Dialect)}
          className="text-sm border rounded-md px-2 py-1.5 bg-background"
        >
          {DIALECTS.map((d) => (
            <option key={d} value={d}>{d === "mssql" ? "SQL Server" : d === "postgresql" ? "PostgreSQL" : d === "sqlite" ? "SQLite" : d === "oracle" ? "Oracle" : "MySQL"}</option>
          ))}
        </select>
        {hasAIProvider && (
          <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 gap-1 ml-auto">
            <Sparkles className="h-3 w-3" />AI Ready
          </Badge>
        )}
      </div>

      {/* Input */}
      <Textarea
        placeholder="Paste your SQL query here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={8}
        className="font-mono text-sm"
      />

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleProcess} disabled={!input.trim() || isLoading} className="gap-2">
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            <><Database className="h-4 w-4" /> {action === "format" ? "Format" : action === "explain" ? "Explain" : "Optimize"} {hasAIProvider ? "with AI" : ""}</>
          )}
        </Button>
        <Button variant="outline" onClick={handleClear} disabled={!input && !output} className="gap-1.5">
          <Trash2 className="h-4 w-4" /> Clear
        </Button>
      </div>

      {error && (
        <p className="text-sm text-amber-500">{error}</p>
      )}

      {/* Output */}
      {output && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4" />
                {action === "format" ? "Formatted SQL" : action === "explain" ? "Explanation" : "Optimized SQL"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1 h-7">
                {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="font-mono text-sm whitespace-pre-wrap bg-muted/30 rounded-lg p-4 overflow-x-auto">
              {output}
            </pre>
            {suggestions.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" /> Suggestions
                </p>
                {suggestions.map((s, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-amber-500 shrink-0 mt-0.5">•</span> {s}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}