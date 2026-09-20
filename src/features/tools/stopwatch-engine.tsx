"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Flag, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
}

function formatCountdown(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function StopwatchEngine() {
  const [mode, setMode] = useState<"stopwatch" | "countdown">("stopwatch");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [countdownTarget, setCountdownTarget] = useState(60000); // 1 min default
  const [countdownRemaining, setCountdownRemaining] = useState(60000);
  const [countdownInput, setCountdownInput] = useState({ min: 1, sec: 0 });
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const tickRef = useRef<() => void>(() => {});

  // Keep tickRef.current updated without triggering re-renders
  useEffect(() => {
    tickRef.current = () => {
      if (mode === "stopwatch") {
        setElapsed(Date.now() - startRef.current);
      } else {
        const remaining = countdownTarget - (Date.now() - startRef.current);
        if (remaining <= 0) {
          setCountdownRemaining(0);
          setRunning(false);
          return;
        }
        setCountdownRemaining(remaining);
      }
      rafRef.current = requestAnimationFrame(tickRef.current);
    };
  });

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - (mode === "stopwatch" ? elapsed : countdownTarget - countdownRemaining);
      rafRef.current = requestAnimationFrame(tickRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  const handleStart = () => {
    if (mode === "countdown" && countdownRemaining <= 0) {
      const target = countdownInput.min * 60000 + countdownInput.sec * 1000;
      setCountdownTarget(target);
      setCountdownRemaining(target);
    }
    setRunning(true);
  };

  const handlePause = () => {
    setRunning(false);
    cancelAnimationFrame(rafRef.current);
  };

  const handleReset = () => {
    setRunning(false);
    cancelAnimationFrame(rafRef.current);
    setElapsed(0);
    setLaps([]);
    const target = countdownInput.min * 60000 + countdownInput.sec * 1000;
    setCountdownTarget(target);
    setCountdownRemaining(target);
  };

  const handleLap = () => {
    setLaps((prev) => [elapsed, ...prev]);
  };

  const display = mode === "stopwatch" ? formatTime(elapsed) : formatCountdown(countdownRemaining);

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => { handleReset(); setMode(v as "stopwatch" | "countdown"); }}>
        <TabsList className="w-full">
          <TabsTrigger value="stopwatch" className="flex-1 gap-2">
            <TimerReset className="h-4 w-4" /> Stopwatch
          </TabsTrigger>
          <TabsTrigger value="countdown" className="flex-1 gap-2">
            <TimerReset className="h-4 w-4" /> Countdown
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Timer Display */}
      <div className="text-center py-8">
        <div className="font-mono text-5xl md:text-7xl font-bold tracking-tighter tabular-nums select-none">
          {display}
        </div>
      </div>

      {/* Countdown Input */}
      {mode === "countdown" && !running && (
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={99}
              value={countdownInput.min}
              onChange={(e) => {
                const v = Math.max(0, Math.min(99, parseInt(e.target.value) || 0));
                setCountdownInput((prev) => ({ ...prev, min: v }));
                setCountdownTarget(v * 60000 + countdownInput.sec * 1000);
                setCountdownRemaining(v * 60000 + countdownInput.sec * 1000);
              }}
              className="w-16 text-center rounded-lg border border-border/50 bg-muted/30 p-2 font-mono text-lg"
            />
            <span className="text-sm text-muted-foreground">min</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={59}
              value={countdownInput.sec}
              onChange={(e) => {
                const v = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                setCountdownInput((prev) => ({ ...prev, sec: v }));
                setCountdownTarget(countdownInput.min * 60000 + v * 1000);
                setCountdownRemaining(countdownInput.min * 60000 + v * 1000);
              }}
              className="w-16 text-center rounded-lg border border-border/50 bg-muted/30 p-2 font-mono text-lg"
            />
            <span className="text-sm text-muted-foreground">sec</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!running ? (
          <Button onClick={handleStart} size="lg" className="gap-2 rounded-full px-8">
            <Play className="h-5 w-5" /> Start
          </Button>
        ) : (
          <Button onClick={handlePause} size="lg" variant="secondary" className="gap-2 rounded-full px-8">
            <Pause className="h-5 w-5" /> Pause
          </Button>
        )}
        <Button onClick={handleReset} size="lg" variant="outline" className="gap-2 rounded-full px-6">
          <RotateCcw className="h-5 w-5" /> Reset
        </Button>
        {mode === "stopwatch" && running && (
          <Button onClick={handleLap} size="lg" variant="outline" className="gap-2 rounded-full px-6">
            <Flag className="h-5 w-5" /> Lap
          </Button>
        )}
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3">Laps</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {laps.map((lap, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 font-mono text-sm"
                >
                  <span className="text-muted-foreground">Lap {laps.length - i}</span>
                  <span>{formatTime(lap)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}