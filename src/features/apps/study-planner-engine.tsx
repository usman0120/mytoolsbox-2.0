"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen, Plus, Trash2, Calendar, Clock, Target, Flame,
  CheckCircle2, Circle, ChevronRight, Timer, BarChart3,
  Trophy, Star, TrendingUp, Download, RotateCcw, Zap
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  color: string;
  goalHours: number;
  completedHours: number;
}

interface StudySession {
  id: string;
  subjectId: string;
  date: string;
  duration: number;
  topic: string;
  completed: boolean;
}

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

const SUBJECT_COLORS = ["#0891b2", "#7c3aed", "#059669", "#dc2626", "#d97706", "#2563eb", "#db2777", "#9333ea"];

function getWeekDates(): Date[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function StudyPlannerEngine() {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("study-planner-subjects");
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: "1", name: "Mathematics", color: "#0891b2", goalHours: 10, completedHours: 3 },
      { id: "2", name: "Physics", color: "#7c3aed", goalHours: 8, completedHours: 2 },
      { id: "3", name: "Computer Science", color: "#059669", goalHours: 12, completedHours: 5 },
    ];
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("study-planner-sessions");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("study-planner-goals");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [newSubject, setNewSubject] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [streak, setStreak] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("study-planner-streak") || "0");
    }
    return 0;
  });
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroSubject, setPomodoroSubject] = useState("");
  const [activeTab, setActiveTab] = useState("schedule");

  useEffect(() => {
    localStorage.setItem("study-planner-subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("study-planner-sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("study-planner-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("study-planner-streak", streak.toString());
  }, [streak]);

  // Pomodoro timer
  useEffect(() => {
    if (!pomodoroActive) return;
    const interval = setInterval(() => {
      setPomodoroTime((prev) => {
        if (prev <= 1) {
          setPomodoroActive(false);
          // Auto-log session
          if (pomodoroSubject) {
            const subject = subjects.find((s) => s.name === pomodoroSubject);
            if (subject) {
              const newSession: StudySession = {
                id: Date.now().toString(),
                subjectId: subject.id,
                date: formatDate(new Date()),
                duration: pomodoroMinutes,
                topic: `${subject.name} - Pomodoro Session`,
                completed: true,
              };
              setSessions((prev) => [...prev, newSession]);
              setSubjects((prev) =>
                prev.map((s) =>
                  s.id === subject.id ? { ...s, completedHours: s.completedHours + pomodoroMinutes / 60 } : s
                )
              );
              // Update streak
              const today = formatDate(new Date());
              const hasStudiedToday = sessions.some((s) => s.date === today);
              if (!hasStudiedToday) {
                setStreak((prev) => prev + 1);
              }
            }
          }
          return pomodoroMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroSubject, pomodoroMinutes, subjects, sessions]);

  const addSubject = () => {
    if (!newSubject.trim()) return;
    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.trim(),
      color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
      goalHours: 10,
      completedHours: 0,
    };
    setSubjects((prev) => [...prev, subject]);
    setNewSubject("");
  };

  const removeSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setSessions((prev) => prev.filter((s) => s.subjectId !== id));
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals((prev) => [...prev, { id: Date.now().toString(), text: newGoal.trim(), completed: false }]);
    setNewGoal("");
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };

  const removeGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const logSession = (subjectId: string, duration: number, topic: string) => {
    const session: StudySession = {
      id: Date.now().toString(),
      subjectId,
      date: formatDate(new Date()),
      duration,
      topic,
      completed: true,
    };
    setSessions((prev) => [...prev, session]);
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, completedHours: s.completedHours + duration / 60 } : s))
    );
  };

  const totalCompleted = subjects.reduce((sum, s) => sum + s.completedHours, 0);
  const totalGoal = subjects.reduce((sum, s) => sum + s.goalHours, 0);
  const overallProgress = totalGoal > 0 ? Math.round((totalCompleted / totalGoal) * 100) : 0;

  const weekDates = getWeekDates();
  const today = formatDate(new Date());
  const todaySessions = sessions.filter((s) => s.date === today);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  const pomodoroProgress = ((pomodoroMinutes * 60 - pomodoroTime) / (pomodoroMinutes * 60)) * 100;
  const pomodoroDisplay = `${Math.floor(pomodoroTime / 60)}:${(pomodoroTime % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <p className="text-2xl font-bold">{streak} <span className="text-sm font-normal text-muted-foreground">days</span></p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <p className="text-2xl font-bold">{todayMinutes} <span className="text-sm font-normal text-muted-foreground">min</span></p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/5 to-violet-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Progress</span>
            </div>
            <p className="text-2xl font-bold">{overallProgress}<span className="text-sm font-normal text-muted-foreground">%</span></p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Subjects</span>
            </div>
            <p className="text-2xl font-bold">{subjects.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule" className="gap-1.5"><Calendar className="h-3.5 w-3.5" /> Schedule</TabsTrigger>
          <TabsTrigger value="subjects" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Subjects</TabsTrigger>
          <TabsTrigger value="goals" className="gap-1.5"><Target className="h-3.5 w-3.5" /> Goals</TabsTrigger>
          <TabsTrigger value="pomodoro" className="gap-1.5"><Timer className="h-3.5 w-3.5" /> Pomodoro</TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date) => {
                  const dateStr = formatDate(date);
                  const daySessions = sessions.filter((s) => s.date === dateStr);
                  const dayMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
                  const isToday = dateStr === today;
                  return (
                    <div
                      key={dateStr}
                      className={`text-center p-2 rounded-lg ${isToday ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/30"}`}
                    >
                      <p className="text-xs font-medium">{date.toLocaleDateString("en-US", { weekday: "short" })}</p>
                      <p className={`text-lg font-bold ${isToday ? "text-primary" : ""}`}>{date.getDate()}</p>
                      <p className="text-xs text-muted-foreground">{dayMinutes}m</p>
                      {dayMinutes > 0 && (
                        <div className="mt-1 h-1 rounded-full bg-green-500/30">
                          <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(100, (dayMinutes / 120) * 100)}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Today's Sessions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Today&apos;s Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {todaySessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No sessions logged today. Start a Pomodoro timer!</p>
              ) : (
                <div className="space-y-2">
                  {todaySessions.map((session) => {
                    const subject = subjects.find((s) => s.id === session.subjectId);
                    return (
                      <div key={session.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: subject?.color }} />
                        <span className="text-sm flex-1">{session.topic}</span>
                        <Badge variant="secondary">{session.duration} min</Badge>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a subject..."
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubject()}
            />
            <Button onClick={addSubject} size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>

          <div className="space-y-3">
            {subjects.map((subject) => {
              const progress = subject.goalHours > 0 ? Math.round((subject.completedHours / subject.goalHours) * 100) : 0;
              return (
                <Card key={subject.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                        <span className="font-medium">{subject.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeSubject(subject.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{subject.completedHours.toFixed(1)} / {subject.goalHours} hours</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => {
                          setPomodoroSubject(subject.name);
                          setActiveTab("pomodoro");
                        }}
                      >
                        <Timer className="h-3 w-3" /> Study Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => logSession(subject.id, 30, `${subject.name} - Quick Session`)}
                      >
                        <Zap className="h-3 w-3" /> Log 30min
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a study goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
            />
            <Button onClick={addGoal} size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>

          <div className="space-y-2">
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No goals yet. Set some study goals to stay motivated!</p>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => toggleGoal(goal.id)}
                >
                  {goal.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <span className={`text-sm flex-1 ${goal.completed ? "line-through text-muted-foreground" : ""}`}>
                    {goal.text}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={(e) => { e.stopPropagation(); removeGoal(goal.id); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {goals.filter((g) => g.completed).length > 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 inline mr-1 text-amber-500" />
                {goals.filter((g) => g.completed).length} of {goals.length} goals completed
              </p>
            </div>
          )}
        </TabsContent>

        {/* Pomodoro Tab */}
        <TabsContent value="pomodoro" className="mt-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center space-y-6">
              <div className="relative inline-flex">
                <svg className="w-48 h-48 -rotate-90">
                  <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                  <circle
                    cx="96" cy="96" r="88"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-cyan-500"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - pomodoroProgress / 100)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold font-mono tracking-wider">{pomodoroDisplay}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {pomodoroActive ? "Studying..." : "Ready"}
                  </span>
                </div>
              </div>

              {pomodoroSubject && (
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" /> {pomodoroSubject}
                </Badge>
              )}

              <div className="flex items-center justify-center gap-3">
                <span className="text-sm text-muted-foreground">Duration:</span>
                {[15, 25, 45, 60].map((min) => (
                  <Badge
                    key={min}
                    variant={pomodoroMinutes === min ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => { setPomodoroMinutes(min); setPomodoroTime(min * 60); setPomodoroActive(false); }}
                  >
                    {min}m
                  </Badge>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    if (!pomodoroSubject) {
                      const firstSubject = subjects[0];
                      if (firstSubject) setPomodoroSubject(firstSubject.name);
                    }
                    setPomodoroActive(!pomodoroActive);
                  }}
                  className="gap-2 min-w-[120px]"
                >
                  {pomodoroActive ? (
                    <><RotateCcw className="h-4 w-4" /> Pause</>
                  ) : (
                    <><Timer className="h-4 w-4" /> Start</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => { setPomodoroTime(pomodoroMinutes * 60); setPomodoroActive(false); }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="text-xs text-muted-foreground w-full">Subject:</span>
                  {subjects.map((s) => (
                    <Badge
                      key={s.id}
                      variant={pomodoroSubject === s.name ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setPomodoroSubject(s.name)}
                    >
                      {s.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}