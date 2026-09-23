"use client";

import { useState, useCallback, useId } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Database,
  Copy,
  Check,
  Trash2,
  Loader2,
  Sparkles,
  AlignLeft,
  Minimize2,
  MessageSquareText,
  Zap,
  Lightbulb,
  AlertCircle,
  FileCode,
} from "lucide-react";
import { formatSQLOffline, SQLDialect } from "@/features/tools/sql-formatter";
import { formatSQL } from "@/lib/ai/services/sql-formatter";
import { getAvailableProviders } from "@/lib/ai";
import { toast } from "sonner";

type Action = "format" | "minify" | "explain" | "optimize";

const SAMPLE_SQL = `select u.id, u.username, u.email, count(o.id) as total_orders, sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.status = 'active' and u.created_at >= '2025-01-01' group by u.id, u.username, u.email having count(o.id) > 5 order by total_spent desc limit 50;`;

export function SQLFormatterEngine() {
  const [input, setInput] = useState(SAMPLE_SQL);
  const [output, setOutput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lintNotes, setLintNotes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [action, setAction] = useState<Action>("format");
  const [dialect, setDialect] = useState<SQLDialect>("standard");
  const [uppercase, setUppercase] = useState(true);
  const [indent, setIndent] = useState<"2" | "4" | "tab">("2");
  const [error, setError] = useState<string | null>(null);

  const uppercaseId = useId();
  const hasAIProvider = getAvailableProviders().length > 0;

  const handleProcess = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);
    setLintNotes([]);

    try {
      if (action === "format" || action === "minify") {
        const offlineRes = formatSQLOffline(input, {
          dialect,
          uppercase,
          indent,
          minify: action === "minify",
        });

        if (offlineRes.status === "success" && offlineRes.data) {
          setOutput(offlineRes.data.formatted);
          setLintNotes(offlineRes.data.lintNotes ?? []);
          setSuggestions([
            `Dialect: ${dialect.toUpperCase()} • Lines: ${offlineRes.data.formattedLines} • Statement: ${offlineRes.data.statementType}`,
          ]);
        } else {
          setError(offlineRes.error || "Formatting error");
        }
      } else if (hasAIProvider) {
        // AI for Explain or Optimize
        const aiRes = await formatSQL({
          sql: input.trim(),
          dialect: dialect === "standard" ? "postgresql" : dialect,
          action: action === "explain" ? "explain" : "optimize",
        });
        setOutput(aiRes.result);
        setSuggestions(aiRes.suggestions ?? []);
      } else {
        // Rule-based explanation / optimization fallback
        if (action === "explain") {
          const offlineRes = formatSQLOffline(input, { dialect, uppercase, indent });
          const upper = input.toUpperCase();
          const parts: string[] = [];
          if (upper.includes("SELECT")) parts.push("1. Queries data from tables with column projection.");
          if (upper.includes("JOIN")) parts.push("2. Combines relational records across joined datasets.");
          if (upper.includes("WHERE")) parts.push("3. Filters rows meeting specified predicate conditions.");
          if (upper.includes("GROUP BY")) parts.push("4. Aggregates row values into summary buckets.");
          if (upper.includes("HAVING")) parts.push("5. Filters aggregated groups post-calculation.");
          if (upper.includes("ORDER BY")) parts.push("6. Sorts output result rows.");
          if (upper.includes("LIMIT")) parts.push("7. Restricts maximum row count returned.");

          setOutput(
            `-- High-Level Execution Flow:\n${parts.join("\n")}\n\n-- Formatted Query:\n${offlineRes.data?.formatted || input}`
          );
          setSuggestions(["Generated offline syntax breakdown. Connect an AI provider for deep schema analysis."]);
        } else {
          // Optimize fallback
          const offlineRes = formatSQLOffline(input, { dialect, uppercase, indent });
          setOutput(offlineRes.data?.formatted || input);
          setSuggestions([
            "Optimization Tips:",
            "• Ensure index exists on WHERE columns and JOIN foreign keys.",
            "• Avoid SELECT * in production queries; explicitly list needed columns.",
            "• Use EXPLAIN ANALYZE on your database server to inspect execution plans.",
          ]);
        }
      }
    } catch {
      const fallback = formatSQLOffline(input, { dialect, uppercase, indent });
      setOutput(fallback.data?.formatted || input);
      setError("AI service unavailable. Applied local offline formatting.");
    } finally {
      setIsLoading(false);
    }
  }, [input, action, dialect, uppercase, indent, hasAIProvider]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setSuggestions([]);
    setLintNotes([]);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Action Tabs & Dialect */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { id: "format", label: "Format", icon: AlignLeft },
              { id: "minify", label: "Minify", icon: Minimize2 },
              { id: "explain", label: "Explain", icon: MessageSquareText },
              { id: "optimize", label: "Optimize", icon: Zap },
            ] as const
          ).map((a) => (
            <Button
              key={a.id}
              variant={action === a.id ? "default" : "outline"}
              size="sm"
              onClick={() => setAction(a.id)}
              className="gap-1.5 h-8 text-xs"
            >
              <a.icon className="h-3.5 w-3.5" />
              {a.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Dialect:</span>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as SQLDialect)}
            className="text-xs border rounded-md px-2 py-1.5 bg-background font-medium"
          >
            <option value="standard">Standard ANSI SQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL / MariaDB</option>
            <option value="sqlite">SQLite</option>
            <option value="mssql">SQL Server (T-SQL)</option>
            <option value="oracle">Oracle PL/SQL</option>
          </select>
        </div>
      </div>

      {/* Formatting controls */}
      {(action === "format" || action === "minify") && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-2.5 bg-muted/40 rounded-lg text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id={uppercaseId}
                checked={uppercase}
                onCheckedChange={setUppercase}
              />
              <Label htmlFor={uppercaseId} className="cursor-pointer font-medium">
                Uppercase Keywords (SELECT, WHERE, JOIN)
              </Label>
            </div>

            {action === "format" && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Indentation:</span>
                {(["2", "4", "tab"] as const).map((opt) => (
                  <Button
                    key={opt}
                    variant={indent === opt ? "secondary" : "ghost"}
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => setIndent(opt)}
                  >
                    {opt === "tab" ? "Tab" : `${opt} spaces`}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs ml-auto"
            onClick={() => setInput(SAMPLE_SQL)}
          >
            Load Sample Query
          </Button>
        </div>
      )}

      {/* Editor textareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <Database className="h-4 w-4 text-primary" /> Input SQL
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground hover:text-destructive"
              onClick={handleClear}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          </div>
          <Textarea
            placeholder="Paste your raw SQL query here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-72 font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              {action === "format"
                ? "Formatted SQL"
                : action === "minify"
                ? "Minified SQL"
                : action === "explain"
                ? "Query Breakdown"
                : "Optimization Plan"}
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!output}
              className="h-7 text-xs gap-1"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea
            readOnly
            value={output}
            placeholder="Processed SQL will appear here..."
            className="min-h-72 font-mono text-xs leading-relaxed bg-muted/40 cursor-text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleProcess} disabled={!input.trim() || isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            <>
              <Database className="h-4 w-4" /> Run {action === "format" ? "Format" : action.charAt(0).toUpperCase() + action.slice(1)}
            </>
          )}
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Lint notifications */}
      {lintNotes.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-1">
          <div className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> Dialect Compatibility Warning
          </div>
          {lintNotes.map((note, i) => (
            <p key={i} className="text-muted-foreground">
              {note}
            </p>
          ))}
        </div>
      )}

      {/* Suggestions / Meta info */}
      {suggestions.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-3 space-y-1 text-xs text-muted-foreground">
            {suggestions.map((s, i) => (
              <p key={i} className="flex items-start gap-1.5">
                <span className="text-primary font-bold">•</span> {s}
              </p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}