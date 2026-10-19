"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Timer, Play, Pause, RotateCcw, Copy, Check, Clock,
  Calendar, Volume2, VolumeX, Sparkles, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  calculateTimeLeft,
  getUpcomingPresetEvents,
  TimeLeft,
} from "@/features/tools/countdown-timer";

export function CountdownTimerEngine() {
  const [title, setTitle] = useState("Product Launch 🚀");
  const [targetDateStr, setTargetDateStr] = useState("");
  const [targetTimeStr, setTargetTimeStr] = useState("09:00");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [upcomingPresets, setUpcomingPresets] = useState<ReturnType<typeof getUpcomingPresetEvents>>([]);

  useEffect(() => {
    const initialTick = setTimeout(() => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      setTargetDateStr(date.toISOString().split("T")[0]);
      setUpcomingPresets(getUpcomingPresetEvents());
    }, 0);
    return () => clearTimeout(initialTick);
  }, []);

  const getTargetDateTime = useCallback(() => {
    return new Date(`${targetDateStr}T${targetTimeStr}:00`);
  }, [targetDateStr, targetTimeStr]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isExpired: false,
  });

  const hasAlarmPlayedRef = useRef(false);

  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.4);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.4);
      });
    } catch {
      // AudioContext not permitted without user gesture
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!targetDateStr) return;
    const initialTick = setTimeout(() => setTimeLeft(calculateTimeLeft(getTargetDateTime())), 0);

    const timer = setInterval(() => {
      const current = calculateTimeLeft(getTargetDateTime());
      setTimeLeft(current);

      if (current.isExpired && !hasAlarmPlayedRef.current) {
        hasAlarmPlayedRef.current = true;
        playChime();
        toast.success(`🎉 The countdown for "${title || "Event"}" has reached zero!`);
      } else if (!current.isExpired) {
        hasAlarmPlayedRef.current = false;
      }
    }, 1000);

    return () => {
      clearTimeout(initialTick);
      clearInterval(timer);
    };
  }, [getTargetDateTime, playChime, title, targetDateStr]);

  const handleApplyPreset = (presetTitle: string, dateStr: string) => {
    const d = new Date(dateStr);
    setTitle(presetTitle);
    setTargetDateStr(d.toISOString().split("T")[0]);
    setTargetTimeStr("00:00");
    toast.success(`Target set to ${presetTitle}!`);
  };

  const handleCopySummary = async () => {
    const summary = `${title || "Countdown"}: ${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s remaining until ${targetDateStr} ${targetTimeStr}`;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Countdown summary copied!");
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" /> Countdown Timer
          </h2>
          <p className="text-sm text-muted-foreground">Live countdown to special milestones, deadlines, and global events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 px-2 text-xs"
            title={soundEnabled ? "Mute alert" : "Enable alert"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopySummary} className="text-xs gap-1.5 h-8">
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Share
          </Button>
        </div>
      </div>

      {/* Target configuration */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Event Title</Label>
          <Input
            placeholder="e.g. Vacation, Birthday, Exam..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 text-xs font-medium"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Target Date</Label>
          <Input
            type="date"
            value={targetDateStr}
            onChange={(e) => setTargetDateStr(e.target.value)}
            className="h-9 text-xs font-mono"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Target Time</Label>
          <Input
            type="time"
            value={targetTimeStr}
            onChange={(e) => setTargetTimeStr(e.target.value)}
            className="h-9 text-xs font-mono"
          />
        </div>
      </div>

      {/* Countdown Digits Display Card */}
      <Card className="p-8 text-center bg-card border-border shadow-sm">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-wider">
            {title || "Countdown"}
          </h3>

          {timeLeft.isExpired ? (
            <div className="py-6 space-y-2">
              <span className="text-4xl sm:text-5xl font-black text-green-500">🎉 Time&apos;s Up!</span>
              <p className="text-xs text-muted-foreground">The countdown target date and time has passed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <span className="text-4xl sm:text-5xl font-black font-mono text-primary">
                  {timeLeft.days}
                </span>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Days</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <span className="text-4xl sm:text-5xl font-black font-mono text-primary">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Hours</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <span className="text-4xl sm:text-5xl font-black font-mono text-primary">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Minutes</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <span className="text-4xl sm:text-5xl font-black font-mono text-primary">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Seconds</p>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground font-mono">
            Target: {targetDateStr ? getTargetDateTime().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" }) : "..."}
          </p>
        </div>
      </Card>

      {/* Preset Milestones & Holidays */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase">Upcoming Holiday Presets</Label>
        <div className="flex flex-wrap gap-2">
          {upcomingPresets.map((preset) => (
            <Button
              key={preset.title}
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset(preset.title, preset.date)}
              className="text-xs h-7 gap-1"
            >
              <Sparkles className="h-3 w-3 text-primary" /> {preset.title}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}