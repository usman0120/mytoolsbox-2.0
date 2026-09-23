"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  formatTime, formatDuration, getProgressPercent,
  getTodayTotal, getWeekTotal, getStreak, getSubjectTotals,
  SUBJECT_COLORS, PRESET_TIMES, type StudySession,
} from "@/features/tools/study-timer";
import { Play, Pause, RotateCcw, Trash2, Clock, Flame, BarChart3, CheckCircle2 } from "lucide-react";

export function StudyTimerEngine() {
  const [subject, setSubject] = useState("Math");
  const [targetMinutes, setTargetMinutes] = useState("25");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem("study-timer-sessions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const targetSeconds = (parseInt(targetMinutes, 10) || 25) * 60;
  const progress = getProgressPercent(elapsed, targetSeconds);

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
      setElapsed((prev) => {
        if (prev >= targetSeconds) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRunning(false);
          // Auto-save session
          setSessions((prev2) => [
            {
              id: `s_${Date.now()}`,
              subject,
              duration: Math.round(targetSeconds / 60),
              date: new Date().toISOString(),
              completed: true,
            },
            ...prev2,
          ]);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [isRunning, isPaused, targetSeconds, subject]);

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
    const duration = Math.max(1, Math.round(elapsed / 60));
    setSessions((prev) => [
      {
        id: `s_${Date.now()}`,
        subject,
        duration,
        date: new Date().toISOString(),
        completed: true,
      },
      ...prev,
    ]);
    setElapsed(0);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const todayTotal = getTodayTotal(sessions);
  const weekTotal = getWeekTotal(sessions);
  const streak = getStreak(sessions);
  const subjectTotals = getSubjectTotals(sessions);

  const subjectColor = SUBJECT_COLORS[subject] || SUBJECT_COLORS["Other"];

  return (
    <div className="space-y-4">
      {/* Timer Circle */}
      <div className="flex justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
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
            <Badge variant="outline" className="mt-1 text-[10px]" style={{ borderColor: subjectColor, color: subjectColor }}>
              {subject}
            </Badge>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-2">
        {!isRunning || isPaused ? (
          <Button onClick={startTimer} className="gap-2" style={{ backgroundColor: subjectColor }}>
            <Play className="h-4 w-4" /> {isPaused ? "Resume" : "Start Focus"}
          </Button>
        ) : (
          <Button onClick={pauseTimer} variant="outline" className="gap-2">
            <Pause className="h-4 w-4" /> Pause
          </Button>
        )}
        <Button onClick={resetTimer} variant="ghost" size="icon">
          <RotateCcw className="h-4 w-4" />
        </Button>
        {elapsed > 30 && (
          <Button onClick={completeSession} variant="outline" className="gap-1.5 text-xs text-green-500 border-green-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" /> Log Session
          </Button>
        )}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Subject</Label>
          <Select value={subject} onValueChange={(v) => setSubject(v || "Math")}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(SUBJECT_COLORS).map((s) => (
                <SelectItem key={s} value={s}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[s] }} />
                    <span>{s}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Target Duration</Label>
          <Select value={targetMinutes} onValueChange={(v) => setTargetMinutes(v || "25")}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRESET_TIMES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
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

      {/* Subject Distribution */}
      {Object.keys(subjectTotals).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Time by Subject</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(subjectTotals).map(([subj, mins]) => {
              const pct = weekTotal > 0 ? Math.round((mins / weekTotal) * 100) : 0;
              const color = SUBJECT_COLORS[subj] || SUBJECT_COLORS["Other"];
              return (
                <div key={subj} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      {subj}
                    </span>
                    <span className="font-mono text-muted-foreground">{formatDuration(mins)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-muted-foreground uppercase">Recent Study Sessions</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSessions([])} className="text-[10px] h-6 text-muted-foreground hover:text-destructive">
              Clear All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50 max-h-48 overflow-y-auto">
              {sessions.slice(0, 15).map((session) => (
                <div key={session.id} className="flex items-center justify-between px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: SUBJECT_COLORS[session.subject] || SUBJECT_COLORS["Other"] }}
                    />
                    <span className="font-medium">{session.subject}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground">{formatDuration(session.duration)}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteSession(session.id)}>
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
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