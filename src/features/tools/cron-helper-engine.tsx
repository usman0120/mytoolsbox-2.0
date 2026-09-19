"use client";

import { useState } from "react";
import { Timer, Copy, Check, Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { validateCron } from "@/features/tools/cron-helper";

const EXAMPLES = [
  { expr: "*/5 * * * *", desc: "Every 5 minutes" },
  { expr: "0 * * * *", desc: "Every hour" },
  { expr: "0 0 * * *", desc: "Daily at midnight" },
  { expr: "0 9 * * 1-5", desc: "Weekdays at 9 AM" },
  { expr: "0 0 1 * *", desc: "First day of month" },
  { expr: "0 0 * * 0", desc: "Weekly on Sunday" },
];

export function CronHelperEngine() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const handleValidate = () => {
    setError("");
    const r = validateCron(expression);
    if (r.status === "error") {
      setError(r.error || "Invalid expression");
      setResult(null);
    } else {
      setResult(r.data);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Cron Expression (5 fields)</Label>
          <Input
            placeholder="*/15 * * * *"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleValidate()}
            className="font-mono"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleValidate} size="sm" className="gap-1.5">
            <Timer className="h-3.5 w-3.5" /> Validate
          </Button>
        </div>
      </div>

      {/* Examples */}
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map((ex) => (
          <Badge
            key={ex.expr}
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80 font-mono text-xs"
            onClick={() => { setExpression(ex.expr); setError(""); setResult(null); }}
          >
            {ex.expr} — {ex.desc}
          </Badge>
        ))}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          {/* Description */}
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="p-3 flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 dark:text-green-400">{result.description}</p>
            </CardContent>
          </Card>

          {/* Field Breakdown */}
          <Card>
            <CardContent className="p-3 space-y-2">
              <p className="text-xs font-medium">Field Breakdown</p>
              <div className="grid grid-cols-5 gap-2 text-center">
                {["Minute", "Hour", "Day", "Month", "Weekday"].map((label, i) => (
                  <div key={i}>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-mono font-bold">{result.fields[i]}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Runs */}
          <Card>
            <CardContent className="p-3 space-y-2">
              <p className="text-xs font-medium">Next 5 Runs</p>
              <div className="space-y-1">
                {result.nextRuns.map((run: string, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">#{i + 1}</span>
                    <span>{new Date(run).toLocaleString()}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleCopy(run, `run-${i}`)}
                    >
                      {copied === `run-${i}` ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}