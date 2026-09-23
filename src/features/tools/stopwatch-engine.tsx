"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Flag, Timer, Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  formatStopwatchTime,
  analyzeLaps,
  exportLapsCSV,
  type LapDetail,
} from "@/features/tools/stopwatch";

export function StopwatchEngine() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [rawLaps, setRawLaps] = useState<number[]>([]);

  const startRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const update = useCallback(() => {
    setElapsed(accumulatedRef.current + (Date.now() - startRef.current));
    rafRef.current = requestAnimationFrame(update);
  }, []);

  const handleStart = () => {
    startRef.current = Date.now();
    setRunning(true);
    rafRef.current = requestAnimationFrame(update);
  };

  const handlePause = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    accumulatedRef.current += Date.now() - startRef.current;
    setElapsed(accumulatedRef.current);
    setRunning(false);
  };

  const handleReset = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setRunning(false);
    accumulatedRef.current = 0;
    setElapsed(0);
    setRawLaps([]);
  };

  const handleLap = () => {
    if (!running && elapsed === 0) return;
    setRawLaps((prev) => [...prev, elapsed]);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const analyzedLaps = analyzeLaps(rawLaps);

  const handleExportCSV = () => {
    if (analyzedLaps.length === 0) {
      toast.error("No lap data to export.");
      return;
    }
    const csv = exportLapsCSV(analyzedLaps);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stopwatch-laps-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Laps exported as CSV!");
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" /> Precision Stopwatch
          </h2>
          <p className="text-sm text-muted-foreground">High-resolution timer with lap analysis and performance benchmarks</p>
        </div>
        {analyzedLaps.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export Laps CSV
          </Button>
        )}
      </div>

      {/* Main Display Card */}
      <Card className="p-8 text-center bg-card border-border/80 shadow-sm">
        <CardContent className="p-0 space-y-4">
          <div className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-primary select-none">
            {formatStopwatchTime(elapsed)}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center items-center gap-3 pt-2">
            {!running ? (
              <Button onClick={handleStart} size="lg" className="h-11 px-8 gap-2 font-semibold">
                <Play className="h-5 w-5 fill-current" /> Start
              </Button>
            ) : (
              <Button onClick={handlePause} variant="destructive" size="lg" className="h-11 px-8 gap-2 font-semibold">
                <Pause className="h-5 w-5 fill-current" /> Stop
              </Button>
            )}

            <Button
              onClick={handleLap}
              variant="outline"
              size="lg"
              disabled={elapsed === 0}
              className="h-11 px-6 gap-2"
            >
              <Flag className="h-4 w-4" /> Lap
            </Button>

            <Button
              onClick={handleReset}
              variant="ghost"
              size="icon"
              disabled={running || elapsed === 0}
              className="h-11 w-11"
              title="Reset Stopwatch"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lap Table */}
      {analyzedLaps.length > 0 && (
        <Card>
          <div className="p-3 border-b flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground uppercase">Lap Breakdown ({analyzedLaps.length})</span>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-green-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Fastest
              </span>
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Slowest
              </span>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground border-b sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Lap</th>
                    <th className="py-2 px-3 text-right">Lap Time</th>
                    <th className="py-2 px-3 text-right">Split Time</th>
                    <th className="py-2 px-3 text-right">vs Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...analyzedLaps].reverse().map((lap) => {
                    let rowColor = "";
                    if (lap.isFastest) rowColor = "bg-green-500/10 text-green-600 dark:text-green-400 font-medium";
                    if (lap.isSlowest) rowColor = "bg-red-500/10 text-red-600 dark:text-red-400 font-medium";

                    return (
                      <tr key={lap.lapNumber} className={rowColor}>
                        <td className="py-2 px-3 font-medium">
                          #{lap.lapNumber}
                          {lap.isFastest && <span className="ml-1 text-[10px]">⚡ Fastest</span>}
                          {lap.isSlowest && <span className="ml-1 text-[10px]">🐢 Slowest</span>}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold">
                          {formatStopwatchTime(lap.lapTimeMs)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                          {formatStopwatchTime(lap.splitTimeMs)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[11px]">
                          {(lap.deltaToAverageMs ?? 0) > 0 ? "+" : ""}
                          {((lap.deltaToAverageMs ?? 0) / 1000).toFixed(2)}s
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}