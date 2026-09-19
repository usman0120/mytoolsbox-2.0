"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  formatTime, formatDuration, getProgressPercent,
  getTodayTotal, getWeekTotal, getStreak,
  SUBJECT_COLORS, PRESET_TIMES, type StudySession,
} from "@/features/tools/study-timer";
import { Play, Pause, RotateCcw, Plus, Trash2, Clock, Flame, BarChart3, Timer } from "lucide-react";

export function StudyTimerEngine() {
  const [subject, setSubject] = useState("Math");
  const [customSubject, setCustomSubject] = useState("");
  const [targetMinutes, setTargetMinutes] = useState("25");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const targetSeconds = (parseInt(targetMinutes) || 25) * 60;
  const progress = getProgressPercent(elapsed, targetSeconds);
  const activeSubject = customSubject || subject;

  useEffect(() => {
    // Load sessions from localStorage
    try {
      const saved = localStorage.getItem("study-timer-sessions");
      if (saved) setSessions(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("study-timer-sessions", JSON.stringify(sessions));
  }, [sessions]);

  const startTimer = useCallback(() => {
    if (isRunning && !isPaused) return;
    if (isPaused) {
      setIsPaused(false);
    } else {
      setIsRunning(true);
      setIsPaused(false);
    }
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev >= targetSeconds) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          // Auto-save session
          setSessions(prev2 => [{
            id: `s_${Date.now()}`,
            subject: activeSubject,
            duration: Math.round(targetSeconds / 60),
            date: new Date().toISOString(),
            completed: true,
          }, ...prev2]);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [isRunning, isPaused, targetSeconds, activeSubject]);

  const pauseTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPaused(true);
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setElapsed(0);
  };

  const completeSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    const duration = Math.round(elapsed / 60);
    if (duration > 0) {
      setSessions(prev => [{
        id: `s_${Date.now()}`,
        subject: activeSubject,
        duration,
        date: new Date().toISOString(),
        completed: true,
      }, ...prev]);
    }
    setElapsed(0);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const todayTotal = getTodayTotal(sessions);
  const weekTotal = getWeekTotal(sessions);
  const streak = getStreak(sessions);

  const subjectColor = SUBJECT_COLORS[activeSubject] || SUBJECT_COLORS["Other"];

  return (
    <div className="space-y-4">
      {/* Timer Circle */}
      <div className="flex justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={subjectColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-bold">{formatTime(elapsed)}</span>
            <span className="text-xs text-muted-foreground">/ {formatTime(targetSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        {!isRunning || isPaused ? (
          <Button onClick={startTimer} className="gap-2" style={{ backgroundColor: subjectColor }}>
            <Play className="h-4 w-4" /> {isPaused ? "Resume" : "Start"}
          </Button>
        ) : (
          <Button onClick={pauseTimer} variant="outline" className="gap-2">
            <Pause className="h-4 w-4" /> Pause
          </Button>
        )}
        <Button onClick={resetTimer} variant="ghost" size="icon">
          <RotateCcw className="h-4 w-4" />
        </Button>
        {elapsed > 0 && (
          <Button onClick={completeSession} variant="outline" className="gap-2 text-green-400">
            Complete
          </Button>
        )}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Subject</Label>
          <Select value={subject} onValueChange={(v) => setSubject(v || "Math")}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(SUBJECT_COLORS).map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Duration</Label>
          <Select value={targetMinutes} onValueChange={(v) => setTargetMinutes(v || "25")}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRESET_TIMES.map(t => (
                <SelectItem key={t.value} value={String(t.value / 60)}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{formatDuration(todayTotal)}</p>
            <p className="text-[10px] text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <BarChart3 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{formatDuration(weekTotal)}</p>
            <p className="text-[10px] text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Flame className="h-4 w-4 mx-auto mb-1 text-orange-400" />
            <p className="text-lg font-bold">{streak}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Session History */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50 max-h-[200px] overflow-y-auto">
              {sessions.slice(0, 20).map(session => (
                <div key={session.id} className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: SUBJECT_COLORS[session.subject] || SUBJECT_COLORS["Other"] }}
                    />
                    <span className="text-sm">{session.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatDuration(session.duration)}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteSession(session.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}