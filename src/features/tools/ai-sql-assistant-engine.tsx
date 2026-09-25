"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Copy,
  Check,
  Loader2,
  Sparkles,
  Database,
  Lightbulb,
  Zap,
  AlignLeft,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { sqlAssist, type SQLAssistantOutput } from "@/lib/ai/services/sql-assistant";
import { formatSQLOffline, SQLDialect } from "@/features/tools/sql-formatter";
import { useCredits } from "@/lib/credits/use-credits";
import { toast } from "sonner";

function ruleBasedSQLAssist(query: string, action: string, dialect: string = "standard"): SQLAssistantOutput {
  const qLower = query.toLowerCase();

  if (action === "format") {
    const formatted = formatSQLOffline(query, { dialect: dialect as SQLDialect });
    return {
      result: formatted.data?.formatted || query,
      explanation: `Formatted query with standard ${dialect.toUpperCase()} clause alignment.`,
    };
  }

  if (action === "generate") {
    let generatedSQL = "";
    let explanation = "";

    if (qLower.includes("user") && (qLower.includes("30 day") || qLower.includes("recent") || qLower.includes("month"))) {
      generatedSQL = `SELECT id, name, email, created_at\nFROM users\nWHERE created_at >= NOW() - INTERVAL '30 days'\nORDER BY created_at DESC;`;
      explanation = "Filters users whose account creation timestamp is within the last 30 days.";
    } else if (qLower.includes("order") && (qLower.includes("top") || qLower.includes("customer") || qLower.includes("revenue") || qLower.includes("spend"))) {
      generatedSQL = `SELECT u.id, u.name, COUNT(o.id) AS total_orders, SUM(o.total_amount) AS total_spent\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.status = 'completed'\nGROUP BY u.id, u.name\nORDER BY total_spent DESC\nLIMIT 10;`;
      explanation = "Aggregates completed orders by user to rank the top 10 customers by total spend.";
    } else if (qLower.includes("delete") || qLower.includes("inactive") || qLower.includes("remove")) {
      generatedSQL = `DELETE FROM sessions\nWHERE last_active < NOW() - INTERVAL '90 days';`;
      explanation = "Safely deletes inactive session records older than 90 days.";
    } else if (qLower.includes("average") || qLower.includes("avg") || qLower.includes("category")) {
      generatedSQL = `SELECT category, COUNT(*) AS product_count, ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY category\nHAVING COUNT(*) > 0\nORDER BY avg_price DESC;`;
      explanation = "Computes average product price and item count categorized by product category.";
    } else {
      generatedSQL = `SELECT id, created_at, status\nFROM ${qLower.split(" ")[0] || "records"}\nWHERE status = 'active'\nORDER BY id DESC\nLIMIT 50;`;
      explanation = `Synthesized baseline query for "${query}".`;
    }

    return {
      result: generatedSQL,
      explanation,
      suggestions: [
        "Ensure indexes exist on referenced WHERE and JOIN foreign key columns.",
        "Add pagination parameters (LIMIT and OFFSET) if handling large tables.",
      ],
    };
  }

  if (action === "explain") {
    const steps: string[] = [];
    const upper = query.toUpperCase();

    if (upper.includes("SELECT")) steps.push("1. Projection: Selects and calculates specified columns.");
    if (upper.includes("FROM")) steps.push("2. Source: Identifies target primary table records.");
    if (upper.includes("JOIN")) steps.push("3. Relations: Merges relational tables based on matching foreign keys.");
    if (upper.includes("WHERE")) steps.push("4. Predicate Filter: Discards rows that do not meet condition criteria.");
    if (upper.includes("GROUP BY")) steps.push("5. Aggregation: Consolidates rows into grouped subsets.");
    if (upper.includes("HAVING")) steps.push("6. Group Filter: Discards aggregate groups failing conditions.");
    if (upper.includes("ORDER BY")) steps.push("7. Sorting: Sorts matching rows according to specified columns.");
    if (upper.includes("LIMIT")) steps.push("8. Windowing: Limits final result set to maximum specified rows.");

    return {
      result: query,
      explanation: steps.join("\n"),
      suggestions: [
        "Run EXPLAIN ANALYZE on your database server to view physical plan costs.",
      ],
    };
  }

  if (action === "optimize") {
    const upper = query.toUpperCase();
    const suggestions: string[] = [];
    let optimized = query;

    if (upper.includes("SELECT *")) {
      suggestions.push("Avoid `SELECT *`: Explicitly list only the columns required by your application to save I/O and network bandwidth.");
      optimized = optimized.replace(/SELECT\s+\*/i, "SELECT id, name, created_at /* explicitly name required columns */");
    }

    if (upper.includes("LIKE '%")) {
      suggestions.push("Leading wildcard in `LIKE '%...%'`: Prevents B-Tree index lookups. Consider full-text search (tsvector / FTS) or trigram indexes (pg_trgm).");
    }

    if (!upper.includes("LIMIT") && upper.includes("SELECT")) {
      suggestions.push("Add a `LIMIT` clause to protect against memory overflow when tables grow in production.");
      optimized += "\nLIMIT 100;";
    }

    if (suggestions.length === 0) {
      suggestions.push("Query structure looks clean. Ensure indexes exist on all WHERE and JOIN columns.");
    }

    return {
      result: query,
      optimizedQuery: optimized,
      explanation: "Analyzed query against standard database indexing and query execution heuristics.",
      suggestions,
    };
  }

  return {
    result: query,
    explanation: "Standard query evaluation complete.",
  };
}

const ACTIONS = [
  { id: "explain", label: "Explain Query", icon: Lightbulb },
  { id: "optimize", label: "Optimize Query", icon: Zap },
  { id: "generate", label: "Generate from Text", icon: Sparkles },
  { id: "format", label: "Format SQL", icon: AlignLeft },
] as const;

export function AISQLAssistantEngine() {
  const [input, setInput] = useState(
    "SELECT u.id, u.name, sum(o.amount) as spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' GROUP BY u.id, u.name ORDER BY spent DESC LIMIT 20;"
  );
  const [action, setAction] = useState<"explain" | "optimize" | "generate" | "format">("explain");
  const [dialect, setDialect] = useState<string>("postgresql");
  const [result, setResult] = useState<SQLAssistantOutput>(() =>
    ruleBasedSQLAssist(
      "SELECT u.id, u.name, sum(o.amount) as spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' GROUP BY u.id, u.name ORDER BY spent DESC LIMIT 20;",
      "explain",
      "postgresql"
    )
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { refresh } = useCredits();

  const handleAssist = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const r = await sqlAssist({
        query: input.trim(),
        action,
        dialect: dialect || undefined,
      });
      setResult(r);
      toast.success("SQL analysis generated!");
      await refresh();
    } catch {
      setResult(ruleBasedSQLAssist(input.trim(), action, dialect));
      setError("AI service unavailable. Using local rule-based database analyzer.");
    }
    setIsLoading(false);
  }, [input, action, dialect, refresh]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-5">
      {/* Action Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex gap-1.5 flex-wrap items-center">
          {ACTIONS.map((a) => (
            <Button
              key={a.id}
              variant={action === a.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAction(a.id);
                if (a.id === "generate" && !input.startsWith("Find")) {
                  setInput("Find top 10 customers by revenue with their order count");
                }
              }}
              className="gap-1.5 h-8 text-xs"
            >
              <a.icon className="h-3.5 w-3.5" /> {a.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Dialect:</span>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            className="text-xs border rounded-md px-2 py-1.5 bg-background font-medium"
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="sqlite">SQLite</option>
            <option value="mssql">SQL Server</option>
          </select>
        </div>
      </div>

      {/* Input area */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          {action === "generate" ? "Describe What Data You Want to Retrieve" : "SQL Query"}
        </Label>
        <Textarea
          placeholder={
            action === "generate"
              ? "e.g. Find all users registered in the last 30 days with total spend..."
              : "SELECT * FROM users WHERE..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-32 font-mono text-xs leading-relaxed"
        />

        {action === "generate" && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground mr-1">Examples:</span>
            {[
              "Find top 10 customers by revenue",
              "Users registered in last 30 days",
              "Average product price by category",
              "Delete inactive sessions older than 90 days",
            ].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setInput(p);
                  setResult(ruleBasedSQLAssist(p, "generate", dialect));
                }}
                className="px-2 py-0.5 rounded-full bg-muted hover:bg-primary/10 border text-[11px] font-medium transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button onClick={handleAssist} disabled={isLoading} className="w-full gap-2 h-9 text-xs">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Database className="h-4 w-4" />
        )}
        Run {action === "generate" ? "SQL Generation" : action.charAt(0).toUpperCase() + action.slice(1)}
      </Button>

      {error && <p className="text-xs text-amber-500">{error}</p>}

      {/* Result Display */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Main SQL Result */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">
                  {action === "generate" ? "Generated SQL Query" : action === "format" ? "Formatted SQL" : "SQL Query"}
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleCopy(result.result, "result")}
                >
                  {copiedKey === "result" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy SQL
                </Button>
              </div>
              <pre className="p-3.5 rounded-xl bg-muted/40 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
                {result.result}
              </pre>
            </CardContent>
          </Card>

          {/* Optimized Query (if available) */}
          {result.optimizedQuery && (
            <Card className="border-2 border-green-500/20 bg-green-500/5">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-green-700 dark:text-green-300 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" /> Optimized Query Rewrite
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-green-500/30"
                    onClick={() => handleCopy(result.optimizedQuery!, "optimized")}
                  >
                    {copiedKey === "optimized" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy Optimized
                  </Button>
                </div>
                <pre className="p-3.5 rounded-xl bg-background border font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                  {result.optimizedQuery}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Explanation */}
          {result.explanation && (
            <Card>
              <CardContent className="p-4 space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Analysis & Breakdown
                </span>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {result.explanation}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5" /> Performance & Indexing Suggestions
              </span>
              <div className="space-y-1.5 pl-1">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ArrowRight className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}