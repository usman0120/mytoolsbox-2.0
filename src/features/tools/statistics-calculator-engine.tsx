"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  parseData, calculateStatistics, generateHistogram,
  EXAMPLE_DATASETS, type StatisticsResult,
} from "@/features/tools/statistics-calculator";
import { Calculator, Copy, Check } from "lucide-react";

function StatRow({ label, value, copied, onCopy }: { label: string; value: string | number; copied: string; onCopy: (text: string, key: string) => void }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono font-medium">{value}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onCopy(String(value), label)}
        >
          {copied === label ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );
}

export function StatisticsCalculatorEngine() {
  const [dataInput, setDataInput] = useState("");
  const [bins, setBins] = useState("10");
  const [stats, setStats] = useState<StatisticsResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const handleCalculate = () => {
    setError("");
    const data = parseData(dataInput);
    if (data.length < 2) {
      setError("Please enter at least 2 numbers");
      setStats(null);
      return;
    }
    const result = calculateStatistics(data);
    if (!result) {
      setError("Could not calculate statistics");
      return;
    }
    setStats(result);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const histogram = stats ? generateHistogram(stats.sortedData, Number(bins) || 10) : [];
  const maxHistCount = Math.max(...histogram.map(h => h.count), 1);

  return (
    <div className="space-y-4">
      {/* Dataset examples */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(EXAMPLE_DATASETS).map(([name, data]) => (
          <Button
            key={name}
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => setDataInput(data.join(", "))}
          >
            {name}
          </Button>
        ))}
      </div>

      {/* Input */}
      <div>
        <Label className="text-xs mb-1 block">Data (comma, space, or newline separated)</Label>
        <Textarea
          value={dataInput}
          onChange={e => setDataInput(e.target.value)}
          className="font-mono text-xs min-h-20"
          placeholder="78, 82, 91, 65, 88, 72, 95, 84, 79, 87"
        />
      </div>

      <Button onClick={handleCalculate} className="w-full gap-2">
        <Calculator className="h-4 w-4" /> Calculate Statistics
      </Button>

      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-3 text-sm text-red-400">{error}</CardContent>
        </Card>
      )}

      {stats && (
        <Tabs defaultValue="summary">
          <TabsList className="w-full">
            <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
            <TabsTrigger value="histogram" className="flex-1">Histogram</TabsTrigger>
            <TabsTrigger value="data" className="flex-1">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-3">
            <Card>
              <CardContent className="p-3 divide-y divide-border/50">
                <StatRow label="Count" value={stats.count} copied={copied} onCopy={handleCopy} />
                <StatRow label="Sum" value={stats.sum} copied={copied} onCopy={handleCopy} />
                <StatRow label="Mean" value={stats.mean.toFixed(4)} copied={copied} onCopy={handleCopy} />
                <StatRow label="Median" value={stats.median} copied={copied} onCopy={handleCopy} />
                <StatRow label="Mode" value={stats.mode.length > 0 ? stats.mode.join(", ") : "None"} copied={copied} onCopy={handleCopy} />
                <StatRow label="Min" value={stats.min} copied={copied} onCopy={handleCopy} />
                <StatRow label="Max" value={stats.max} copied={copied} onCopy={handleCopy} />
                <StatRow label="Range" value={stats.range} copied={copied} onCopy={handleCopy} />
                <StatRow label="Q1 (25th)" value={stats.q1.toFixed(4)} copied={copied} onCopy={handleCopy} />
                <StatRow label="Q3 (75th)" value={stats.q3.toFixed(4)} copied={copied} onCopy={handleCopy} />
                <StatRow label="IQR" value={stats.iqr.toFixed(4)} copied={copied} onCopy={handleCopy} />
                <StatRow label="Variance" value={stats.variance.toFixed(4)} copied={copied} onCopy={handleCopy} />
                <StatRow label="Std Dev" value={stats.stdDev.toFixed(4)} copied={copied} onCopy={handleCopy} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="histogram" className="mt-3">
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-xs">Bins:</Label>
              <Input
                type="number"
                value={bins}
                onChange={e => setBins(e.target.value)}
                className="w-20 h-7 text-xs"
                min={2}
                max={50}
              />
            </div>
            <Card>
              <CardContent className="p-3">
                <div className="space-y-1">
                  {histogram.map((bin, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-20 text-right font-mono text-muted-foreground">{bin.label}</span>
                      <div className="flex-1 bg-muted rounded-full h-5 relative overflow-hidden">
                        <div
                          className="bg-cyan-500/60 h-full rounded-full transition-all"
                          style={{ width: `${(bin.count / maxHistCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 font-mono">{bin.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="mt-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-1">
                  {stats.sortedData.map((v, i) => (
                    <span key={i} className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                      {v}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}