"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Flame, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  PomodoroState,
  PomodoroSettings,
  DEFAULT_POMODORO_SETTINGS,
  PomodoroSessionRecord,
  formatTime,
  getNextState,
  getTodayFocusMinutes,
} from "@/features/tools/pomodoro-timer";

const STORAGE_KEY = "mytoolsbox-pomodoro-sessions";

export function PomodoroTimerEngine() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
  const [state, setState] = useState<PomodoroState>("working");
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessions, setSessions] = useState<PomodoroSessionRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const totalDuration =
    state === "working"
      ? settings.workMinutes * 60
      : state === "short-break"
      ? settings.shortBreakMinutes * 60
      : settings.longBreakMinutes * 60;

  const progress = Math.min(100, Math.max(0, Math.round(((totalDuration - timeLeft) / totalDuration) * 100)));

  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // AudioContext not allowed without gesture
    }
  }, [soundEnabled]);

  const advanceSession = useCallback(() => {
    playChime();

    if (state === "working") {
      const newSession: PomodoroSessionRecord = {
        id: `pomo_${Date.now()}`,
        type: "work",
        durationMinutes: settings.workMinutes,
        completedAt: new Date().toISOString(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setCompletedSessions((prev) => prev + 1);

      const { nextState, nextDurationSeconds } = getNextState("working", completedSessions, settings);
      setState(nextState);
      setTimeLeft(nextDurationSeconds);
      toast.success(nextState === "long-break" ? "Great job! Time for a Long Break! ☕" : "Focus completed! Short Break time 🧘");
    } else {
      const { nextState, nextDurationSeconds } = getNextState(state, completedSessions, settings);
      setState(nextState);
      setTimeLeft(nextDurationSeconds);
      toast.info("Break ended! Ready to focus? 🚀");
    }
    setIsRunning(false);
  }, [state, completedSessions, settings, playChime]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            advanceSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, advanceSession]);

  const togglePlay = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalDuration);
  };

  const skipTimer = () => {
    setIsRunning(false);
    advanceSession();
  };

  const applyPreset = (work: number, shortB: number, longB: number) => {
    setIsRunning(false);
    setSettings((prev) => ({ ...prev, workMinutes: work, shortBreakMinutes: shortB, longBreakMinutes: longB }));
    setTimeLeft(work * 60);
    setState("working");
    toast.success(`Preset applied: ${work}m focus / ${shortB}m break`);
  };

  const todayMinutes = getTodayFocusMinutes(sessions);

  const stateColor =
    state === "working" ? "text-primary stroke-primary" : state === "short-break" ? "text-green-500 stroke-green-500" : "text-blue-500 stroke-blue-500";

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Pomodoro Focus Timer
          </h2>
          <p className="text-sm text-muted-foreground">Boost focus with timed intervals and restorative breaks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 px-2 text-xs"
            title={soundEnabled ? "Mute chimes" : "Enable chimes"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Badge variant="outline" className="gap-1 font-mono text-xs">
            <Flame className="h-3.5 w-3.5 text-orange-400" /> {completedSessions} Finished
          </Badge>
        </div>
      </div>

      {/* Mode Badges */}
      <div className="flex justify-center gap-2">
        <Button
          variant={state === "working" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setState("working");
            setTimeLeft(settings.workMinutes * 60);
            setIsRunning(false);
          }}
          className="text-xs h-7"
        >
          Focus ({settings.workMinutes}m)
        </Button>
        <Button
          variant={state === "short-break" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setState("short-break");
            setTimeLeft(settings.shortBreakMinutes * 60);
            setIsRunning(false);
          }}
          className="text-xs h-7"
        >
          Short Break ({settings.shortBreakMinutes}m)
        </Button>
        <Button
          variant={state === "long-break" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setState("long-break");
            setTimeLeft(settings.longBreakMinutes * 60);
            setIsRunning(false);
          }}
          className="text-xs h-7"
        >
          Long Break ({settings.longBreakMinutes}m)
        </Button>
      </div>

      {/* Main Circular Gauge */}
      <div className="flex justify-center py-2">
        <div className="relative w-56 h-56">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/20" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
              className={`transition-all duration-1000 ${stateColor}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold tracking-tight">{formatTime(timeLeft)}</span>
            <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-wider">
              {state.replace("-", " ")}
            </Badge>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-3">
        <Button onClick={togglePlay} size="lg" className="h-11 px-8 gap-2 font-medium">
          {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button onClick={resetTimer} variant="outline" size="icon" className="h-11 w-11" title="Reset Current Interval">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button onClick={skipTimer} variant="outline" size="icon" className="h-11 w-11" title="Skip to Next">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={() => applyPreset(25, 5, 15)} className="text-xs h-7">
          Classic 25/5
        </Button>
        <Button variant="ghost" size="sm" onClick={() => applyPreset(50, 10, 20)} className="text-xs h-7">
          Deep Work 50/10
        </Button>
        <Button variant="ghost" size="sm" onClick={() => applyPreset(15, 3, 10)} className="text-xs h-7">
          Quick Sprint 15/3
        </Button>
      </div>

      {/* Daily Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xl font-bold">{todayMinutes} min</p>
            <p className="text-[10px] text-muted-foreground">Focus Time Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Sparkles className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{Math.round(todayMinutes / 25)}</p>
            <p className="text-[10px] text-muted-foreground">Pomos Completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}