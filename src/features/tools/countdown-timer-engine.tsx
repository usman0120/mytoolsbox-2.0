"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Timer, Play, Pause, RotateCcw, Download, Copy, Check,
  Clock, Calendar, Volume2, VolumeX, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CountdownTimerEngine() {
  const [targetDate, setTargetDate] = useState("");
  const [targetTime, setTargetTime] = useState("23:59");
  const [title, setTitle] = useState("");
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);
  const [running, setRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playAlarm = useCallback(() => {
    try {
      const ctx = new AudioContext();
      // Play a pleasant alarm sequence
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.value = 0.15;
        osc.start(ctx.currentTime + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.3);
        osc.stop(ctx.currentTime + i * 0.2 + 0.3);
      });
    } catch {
      // Audio not supported
    }
  }, []);

  const calculateTimeLeft = useCallback(() => {
    if (!targetDate) return null;
    const target = new Date(`${targetDate}T${targetTime}:00`);
    const now = new Date();
    const diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));

    if (diff === 0) {
      setFinished(true);
      setRunning(false);
      if (soundEnabled) playAlarm();
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
      days: Math.floor(diff / 86400),
      hours: Math.floor((diff % 86400) / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
      total: diff,
    };
  }, [targetDate, targetTime, soundEnabled, playAlarm]);

  const startTimer = useCallback(() => {
    const left = calculateTimeLeft();
    if (!left || left.total === 0) {
      toast.error("Please set a future date and time.");
      return;
    }
    setTimeLeft(left);
    setRunning(true);
    setFinished(false);
  }, [calculateTimeLeft]);

  const pauseTimer = useCallback(() => {
    setRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setRunning(false);
    setFinished(false);
    setTimeLeft(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const left = calculateTimeLeft();
      if (!left || left.total === 0) {
        setRunning(false);
        setFinished(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      setTimeLeft(left);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, calculateTimeLeft]);

  const handleCopy = useCallback(async () => {
    if (!timeLeft) return;
    const text = `Countdown: ${title || "Event"} - ${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s remaining`;
    await navigator.clipboard.writeText(text);
    toast.success("Copied!");
  }, [timeLeft, title]);

  const progress = timeLeft
    ? 1 - timeLeft.total / (timeLeft.total + (running ? 0 : 0) || 1)
    : 0;

  const circumference = 2 * Math.PI * 110;

  return (
    <div className="space-y-6">
      {/* Setup */}
      {!running && !finished && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block">Event Title (optional)</Label>
              <Input
                placeholder="e.g. New Year, Project Deadline..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1.5 block">Target Date</Label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Target Time</Label>
                <Input
                  type="time"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={startTimer} className="w-full gap-2" disabled={!targetDate}>
              <Play className="h-4 w-4" /> Start Countdown
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Timer display */}
      {(running || finished) && timeLeft && (
        <div className="space-y-6">
          {/* Circle */}
          <div className="flex flex-col items-center">
            <div className="relative w-56 h-56">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 232 232">
                <circle
                  cx="116" cy="116" r="110"
                  fill="none" stroke="currentColor" strokeWidth="8"
                  className="stroke-muted/30"
                />
                <circle
                  cx="116" cy="116" r="110"
                  fill="none" strokeWidth="8" strokeLinecap="round"
                  className={finished ? "stroke-green-500" : "stroke-primary"}
                  strokeDasharray={circumference}
                  strokeDashoffset={finished ? 0 : circumference * (1 - Math.min(progress, 1))}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {finished ? (
                  <>
                    <Bell className="h-10 w-10 text-green-500 mb-2" />
                    <span className="text-lg font-bold text-green-500">Time&apos;s Up!</span>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-4xl font-bold tracking-tighter tabular-nums">
                      {formatTime(timeLeft.total)}
                    </span>
                    {title && (
                      <span className="text-xs text-muted-foreground mt-1 max-w-[140px] text-center truncate">
                        {title}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-4">
              {running ? (
                <Button onClick={pauseTimer} variant="secondary" size="lg" className="gap-2 rounded-full px-8">
                  <Pause className="h-5 w-5" /> Pause
                </Button>
              ) : !finished ? (
                <Button onClick={startTimer} size="lg" className="gap-2 rounded-full px-8">
                  <Play className="h-5 w-5" /> Resume
                </Button>
              ) : null}
              <Button onClick={resetTimer} variant="outline" size="lg" className="gap-2 rounded-full px-6">
                <RotateCcw className="h-5 w-5" /> Reset
              </Button>
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                size="icon"
                variant="ghost"
                className="rounded-full"
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Breakdown */}
          {!finished && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold font-mono tabular-nums">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Target: {formatDate(new Date(`${targetDate}T${targetTime}:00`))}
            </span>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1 h-7">
              <Copy className="h-3 w-3" /> Copy
            </Button>
          </div>
        </div>
      )}

      {/* Idle state */}
      {!running && !finished && !timeLeft && (
        <div className="text-center py-12 text-muted-foreground">
          <Timer className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Set a date and time to start the countdown</p>
        </div>
      )}
    </div>
  );
}