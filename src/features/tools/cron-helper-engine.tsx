"use client";

import { useState, useMemo } from "react";
import {
  Timer,
  Copy,
  Check,
  Lightbulb,
  Clock,
  Calendar,
  Layers,
  Wand2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { validateCron } from "@/features/tools/cron-helper";
import { toast } from "sonner";

const PRESETS = [
  { expr: "*/5 * * * *", label: "Every 5 mins", desc: "Polling / Healthchecks" },
  { expr: "0 * * * *", label: "Hourly", desc: "Top of every hour" },
  { expr: "0 0 * * *", label: "Midnight", desc: "Daily at 00:00" },
  { expr: "0 9 * * 1-5", label: "Weekdays 9 AM", desc: "Workday morning" },
  { expr: "0 0 * * 0", label: "Weekly Sunday", desc: "Sunday midnight" },
  { expr: "0 0 1 * *", label: "1st of Month", desc: "Monthly report / billing" },
  { expr: "0 2 * * *", label: "Nightly 2 AM", desc: "Backups & Cleanup" },
];

export function CronHelperEngine() {
  const [activeTab, setActiveTab] = useState<"analyzer" | "builder">("analyzer");
  const [expression, setExpression] = useState("0 9 * * 1-5");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Visual builder state
  const [builderFreq, setBuilderFreq] = useState<"minutes" | "hourly" | "daily" | "weekly" | "monthly">("daily");
  const [builderMinuteStep, setBuilderMinuteStep] = useState(15);
  const [builderHour, setBuilderHour] = useState(9);
  const [builderMinute, setBuilderMinute] = useState(0);
  const [builderDow, setBuilderDow] = useState<number[]>([1, 2, 3, 4, 5]);
  const [builderDom, setBuilderDom] = useState(1);

  // Live validation
  const validation = useMemo(() => {
    return validateCron(expression);
  }, [expression]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  // Sync builder changes into expression
  const generateFromBuilder = (
    freq = builderFreq,
    minStep = builderMinuteStep,
    h = builderHour,
    m = builderMinute,
    dow = builderDow,
    dom = builderDom
  ) => {
    let expr = "* * * * *";
    if (freq === "minutes") {
      expr = `*/${minStep} * * * *`;
    } else if (freq === "hourly") {
      expr = `${m} * * * *`;
    } else if (freq === "daily") {
      expr = `${m} ${h} * * *`;
    } else if (freq === "weekly") {
      const dowStr = dow.length > 0 ? dow.sort().join(",") : "*";
      expr = `${m} ${h} * * ${dowStr}`;
    } else if (freq === "monthly") {
      expr = `${m} ${h} ${dom} * *`;
    }
    setExpression(expr);
  };

  const toggleDow = (dayIndex: number) => {
    const updated = builderDow.includes(dayIndex)
      ? builderDow.filter((d) => d !== dayIndex)
      : [...builderDow, dayIndex];
    setBuilderDow(updated);
    generateFromBuilder(builderFreq, builderMinuteStep, builderHour, builderMinute, updated, builderDom);
  };

  return (
    <div className="space-y-5">
      {/* Top Header / Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "analyzer" | "builder")}>
          <TabsList>
            <TabsTrigger value="analyzer" className="gap-1.5 text-xs">
              <Timer className="h-3.5 w-3.5" /> Expression Analyzer
            </TabsTrigger>
            <TabsTrigger value="builder" className="gap-1.5 text-xs">
              <Wand2 className="h-3.5 w-3.5" /> Visual Schedule Builder
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 font-mono"
            onClick={() => handleCopy(expression, "top-expr")}
          >
            {copiedKey === "top-expr" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            {expression}
          </Button>
        </div>
      </div>

      {activeTab === "builder" ? (
        /* Visual Schedule Builder */
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Frequency</Label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: "minutes", label: "Every X Minutes" },
                    { id: "hourly", label: "Hourly" },
                    { id: "daily", label: "Daily" },
                    { id: "weekly", label: "Weekly" },
                    { id: "monthly", label: "Monthly" },
                  ] as const
                ).map((f) => (
                  <Button
                    key={f.id}
                    variant={builderFreq === f.id ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setBuilderFreq(f.id);
                      generateFromBuilder(f.id);
                    }}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Interval controls */}
            {builderFreq === "minutes" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Run every</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="59"
                    value={builderMinuteStep}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 5;
                      setBuilderMinuteStep(v);
                      generateFromBuilder(builderFreq, v);
                    }}
                    className="w-24 font-mono text-xs"
                  />
                  <span className="text-xs text-muted-foreground">minute(s)</span>
                </div>
              </div>
            )}

            {(builderFreq === "daily" || builderFreq === "weekly" || builderFreq === "monthly") && (
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <div>
                  <Label className="text-xs font-medium">Hour (0-23)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={builderHour}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0;
                      setBuilderHour(v);
                      generateFromBuilder(builderFreq, builderMinuteStep, v, builderMinute);
                    }}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Minute (0-59)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={builderMinute}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0;
                      setBuilderMinute(v);
                      generateFromBuilder(builderFreq, builderMinuteStep, builderHour, v);
                    }}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {builderFreq === "weekly" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Days of the week</Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { day: 1, name: "Mon" },
                    { day: 2, name: "Tue" },
                    { day: 3, name: "Wed" },
                    { day: 4, name: "Thu" },
                    { day: 5, name: "Fri" },
                    { day: 6, name: "Sat" },
                    { day: 0, name: "Sun" },
                  ].map((d) => (
                    <Button
                      key={d.day}
                      type="button"
                      size="sm"
                      variant={builderDow.includes(d.day) ? "default" : "outline"}
                      className="h-8 text-xs px-3"
                      onClick={() => toggleDow(d.day)}
                    >
                      {d.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {builderFreq === "monthly" && (
              <div className="space-y-1.5 max-w-xs">
                <Label className="text-xs font-medium">Day of month (1-31)</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={builderDom}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 1;
                    setBuilderDom(v);
                    generateFromBuilder(builderFreq, builderMinuteStep, builderHour, builderMinute, builderDow, v);
                  }}
                  className="w-24 font-mono text-xs"
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t">
              <span className="text-xs text-muted-foreground">Generated Cron:</span>
              <span className="font-mono font-bold text-sm bg-muted px-2.5 py-1 rounded border">
                {expression}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Expression Input */
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Cron Expression (minute, hour, dom, month, dow)</Label>
            <Input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g. 0 9 * * 1-5 or */15 * * * *"
              className="font-mono text-sm h-11"
            />
          </div>

          {/* Quick Preset Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground mr-1">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.expr}
                type="button"
                onClick={() => setExpression(p.expr)}
                className="px-2 py-0.5 rounded-full bg-muted hover:bg-primary/10 border text-xs font-mono transition-colors"
                title={p.desc}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validation.status === "error" ? (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validation.error}</span>
        </div>
      ) : (
        validation.data && (
          <div className="space-y-4">
            {/* Human Readable Banner */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Human Translation</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    &ldquo;{validation.data.description}&rdquo;
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Field Breakdown Columns */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Field Breakdown</Label>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {[
                  { name: "Minute", range: "0-59" },
                  { name: "Hour", range: "0-23" },
                  { name: "Day of Month", range: "1-31" },
                  { name: "Month", range: "1-12" },
                  { name: "Day of Week", range: "0-7" },
                ].map((col, idx) => (
                  <div key={col.name} className="p-2.5 rounded-lg border bg-muted/20">
                    <span className="text-[10px] text-muted-foreground block">{col.name}</span>
                    <span className="font-mono font-bold text-sm text-primary my-0.5 block">
                      {validation.data!.fields[idx]}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">{col.range}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Scheduled Runs */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Next Scheduled Executions</Label>
              <div className="border rounded-xl divide-y text-xs overflow-hidden">
                {validation.data.nextRuns.map((run, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 hover:bg-muted/20">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground w-6">#{i + 1}</span>
                      <span className="font-mono font-medium">{run.formatted}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[11px] font-normal">
                        {run.relative}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(run.iso, `run-${i}`)}
                      >
                        {copiedKey === `run-${i}` ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}