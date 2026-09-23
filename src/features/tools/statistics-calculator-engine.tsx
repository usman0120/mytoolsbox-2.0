"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  parseData, calculateStatistics, generateHistogram,
  EXAMPLE_DATASETS, type StatisticsResult,
} from "@/features/tools/statistics-calculator";
import { Calculator, Copy, Check, Download, AlertTriangle, BarChart3, ListFilter } from "lucide-react";

export function StatisticsCalculatorEngine() {
  const [dataInput, setDataInput] = useState(EXAMPLE_DATASETS["Exam Scores"].join(", "));
  const [bins, setBins] = useState("8");
  const [stats, setStats] = useState<StatisticsResult | null>(() => calculateStatistics(EXAMPLE_DATASETS["Exam Scores"]));
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCalculate = () => {
    setError("");
    const data = parseData(dataInput);
    if (data.length < 2) {
      setError("Please enter at least 2 numeric values.");
      setStats(null);
      return;
    }
    const result = calculateStatistics(data);
    if (!result) {
      setError("Unable to calculate statistics for provided data.");
      return;
    }
    setStats(result);
  };

  const copyStat = (val: string | number, key: string) => {
    navigator.clipboard.writeText(String(val));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const exportSummary = () => {
    if (!stats) return;
    const lines = [
      `Statistics Summary (${new Date().toLocaleDateString()})`,
      `==================================`,
      `Sample Size (n): ${stats.count}`,
      `Sum: ${stats.sum}`,
      `Mean: ${stats.mean}`,
      `Median: ${stats.median}`,
      `Mode: ${stats.mode.length > 0 ? stats.mode.join(", ") : "None"}`,
      `Minimum: ${stats.min}`,
      `Maximum: ${stats.max}`,
      `Range: ${stats.range}`,
      `Q1 (25th): ${stats.q1}`,
      `Q3 (75th): ${stats.q3}`,
      `IQR: ${stats.iqr}`,
      `Sample Variance (s²): ${stats.sampleVariance}`,
      `Sample Std Dev (s): ${stats.sampleStdDev}`,
      `Population Variance (σ²): ${stats.populationVariance}`,
      `Population Std Dev (σ): ${stats.populationStdDev}`,
      `Skewness: ${stats.skewness}`,
      `MAD: ${stats.mad}`,
      `Outliers: ${stats.outliers.length > 0 ? stats.outliers.join(", ") : "None detected"}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "statistics-summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const histogram = stats ? generateHistogram(stats.sortedData, Math.max(2, Math.min(30, Number(bins) || 8))) : [];
  const maxHistCount = Math.max(...histogram.map(h => h.count), 1);

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground mr-1">Presets:</span>
        {Object.entries(EXAMPLE_DATASETS).map(([name, data]) => (
          <Button
            key={name}
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => {
              setDataInput(data.join(", "));
              setStats(calculateStatistics(data));
            }}
          >
            {name}
          </Button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 rounded-xl border bg-card/60 space-y-3">
        <div>
          <Label className="text-xs mb-1.5 block font-medium">Dataset (numbers separated by commas, spaces, or lines)</Label>
          <Textarea
            value={dataInput}
            onChange={e => setDataInput(e.target.value)}
            className="font-mono text-xs min-h-[90px]"
            placeholder="68, 72, 75, 78, 82, 85, 85, 88, 90..."
          />
        </div>
        <Button onClick={handleCalculate} className="w-full gap-2">
          <Calculator className="h-4 w-4" /> Calculate Comprehensive Statistics
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-3 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {stats && (
        <div className="space-y-4">
          {/* Outlier Alert if present */}
          {stats.outliers.length > 0 && (
            <Card className="border-amber-500/40 bg-amber-500/10">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-amber-500">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    <strong>Outliers detected ({stats.outliers.length}):</strong> {stats.outliers.join(", ")} (outside 1.5×IQR fence)
                  </span>
                </div>
                <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-xs">
                  1.5 × IQR Rule
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Sample Mean (x̄)</span>
                <span className="font-mono text-xl font-bold text-foreground">{stats.mean}</span>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Median</span>
                <span className="font-mono text-xl font-bold text-foreground">{stats.median}</span>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Sample Std Dev (s)</span>
                <span className="font-mono text-xl font-bold text-foreground">{stats.sampleStdDev}</span>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Count (n)</span>
                <span className="font-mono text-xl font-bold text-foreground">{stats.count}</span>
              </CardContent>
            </Card>
          </div>

          {/* Tabs: Metrics, Histogram, Frequency, Raw */}
          <Tabs defaultValue="summary">
            <div className="flex items-center justify-between mb-3">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="fivenum">5-Number Summary</TabsTrigger>
                <TabsTrigger value="histogram">Histogram</TabsTrigger>
                <TabsTrigger value="frequency">Frequency</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={exportSummary}>
                <Download className="h-3.5 w-3.5" /> Export Summary
              </Button>
            </div>

            {/* Comprehensive Summary Tab */}
            <TabsContent value="summary">
              <Card>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm divide-y md:divide-y-0">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs uppercase text-muted-foreground tracking-wider mb-2">Central Tendency</h4>
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Arithmetic Mean</span>
                      <span className="font-mono font-medium">{stats.mean}</span>
                    </div>
                    {stats.geometricMean !== null && (
                      <div className="flex justify-between items-center py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Geometric Mean</span>
                        <span className="font-mono font-medium">{stats.geometricMean}</span>
                      </div>
                    )}
                    {stats.harmonicMean !== null && (
                      <div className="flex justify-between items-center py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Harmonic Mean</span>
                        <span className="font-mono font-medium">{stats.harmonicMean}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Median</span>
                      <span className="font-mono font-medium">{stats.median}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Mode</span>
                      <span className="font-mono font-medium">{stats.mode.length > 0 ? stats.mode.join(", ") : "None"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Sum</span>
                      <span className="font-mono font-medium">{stats.sum}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 md:pt-0">
                    <h4 className="font-semibold text-xs uppercase text-muted-foreground tracking-wider mb-2">Dispersion & Shape</h4>
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Sample Variance (s²)</span>
                      <span className="font-mono font-medium">{stats.sampleVariance}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Sample Std Dev (s)</span>
                      <span className="font-mono font-medium">{stats.sampleStdDev}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Population Variance (σ²)</span>
                      <span className="font-mono font-medium">{stats.populationVariance}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Population Std Dev (σ)</span>
                      <span className="font-mono font-medium">{stats.populationStdDev}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Mean Absolute Dev (MAD)</span>
                      <span className="font-mono font-medium">{stats.mad}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Sample Skewness</span>
                      <span className="font-mono font-medium">{stats.skewness}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Five Number Summary Tab */}
            <TabsContent value="fivenum">
              <Card>
                <CardHeader className="py-3 px-4 border-b">
                  <CardTitle className="text-sm font-semibold">Tukey Five-Number Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <span className="text-xs text-muted-foreground block">Minimum</span>
                      <span className="font-mono text-lg font-bold">{stats.min}</span>
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <span className="text-xs text-muted-foreground block">Q1 (25th)</span>
                      <span className="font-mono text-lg font-bold">{stats.q1}</span>
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <span className="text-xs text-muted-foreground block">Median (50th)</span>
                      <span className="font-mono text-lg font-bold">{stats.median}</span>
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <span className="text-xs text-muted-foreground block">Q3 (75th)</span>
                      <span className="font-mono text-lg font-bold">{stats.q3}</span>
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <span className="text-xs text-muted-foreground block">Maximum</span>
                      <span className="font-mono text-lg font-bold">{stats.max}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg border flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Range (Max - Min)</span>
                      <span className="font-mono font-bold text-base">{stats.range}</span>
                    </div>
                    <div className="p-3 rounded-lg border flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Interquartile Range (IQR)</span>
                      <span className="font-mono font-bold text-base">{stats.iqr}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Histogram Tab */}
            <TabsContent value="histogram" className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium">Histogram Bins:</Label>
                <Input
                  type="number"
                  value={bins}
                  onChange={e => setBins(e.target.value)}
                  className="w-20 h-7 text-xs font-mono"
                  min={2}
                  max={30}
                />
              </div>

              <Card>
                <CardContent className="p-4 space-y-2">
                  {histogram.map((bin, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs">
                      <span className="w-24 text-right font-mono text-muted-foreground truncate">{bin.label}</span>
                      <div className="flex-1 bg-muted rounded-full h-5 relative overflow-hidden">
                        <div
                          className="bg-primary/70 h-full rounded-full transition-all"
                          style={{ width: `${(bin.count / maxHistCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-12 font-mono text-right font-medium">
                        {bin.count} <span className="text-muted-foreground text-[10px]">({bin.percent}%)</span>
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Frequency Table Tab */}
            <TabsContent value="frequency">
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="py-2.5 px-4 text-left font-semibold">Value</th>
                        <th className="py-2.5 px-4 text-right font-semibold">Frequency (f)</th>
                        <th className="py-2.5 px-4 text-right font-semibold">Cumulative Freq</th>
                        <th className="py-2.5 px-4 text-right font-semibold">Relative Freq (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {stats.frequencyTable.map((row, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="py-2 px-4 font-semibold">{row.value}</td>
                          <td className="py-2 px-4 text-right">{row.frequency}</td>
                          <td className="py-2 px-4 text-right text-muted-foreground">{row.cumulativeFrequency}</td>
                          <td className="py-2 px-4 text-right">{row.relativeFrequency}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}