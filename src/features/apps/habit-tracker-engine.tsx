"use client";

import { useState, useCallback, useEffect } from "react";
import { CheckCircle2, Plus, Trash2, Flame, Calendar, TrendingUp, Target, BarChart3, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: "daily" | "weekly" | "monthly";
  targetCount: number;
  createdAt: string;
  completions: Record<string, boolean>; // date -> completed
  streak: number;
  bestStreak: number;
}

const CATEGORIES = ["Health", "Productivity", "Learning", "Mindfulness", "Fitness", "Finance", "Social", "Other"];
const FREQUENCIES = [
  { id: "daily" as const, label: "Daily", icon: Calendar },
  { id: "weekly" as const, label: "Weekly", icon: Clock },
  { id: "monthly" as const, label: "Monthly", icon: Target },
];

const STORAGE_KEY = "mytoolsbox-habits";

function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHabits(habits: Habit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getWeekKey(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
}

function getPeriodKey(frequency: "daily" | "weekly" | "monthly"): string {
  switch (frequency) {
    case "daily": return getToday();
    case "weekly": return getWeekKey();
    case "monthly": return getMonthKey();
  }
}

export function HabitTrackerEngine() {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [activeTab, setActiveTab] = useState("today");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newFrequency, setNewFrequency] = useState<"daily" | "weekly" | "monthly">("daily");

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits((prev) => [
      {
        id: Date.now().toString(),
        name: newName.trim(),
        description: newDescription.trim(),
        category: newCategory,
        frequency: newFrequency,
        targetCount: 1,
        createdAt: getToday(),
        completions: {},
        streak: 0,
        bestStreak: 0,
      },
      ...prev,
    ]);
    setNewName("");
    setNewDescription("");
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const toggleCompletion = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const periodKey = getPeriodKey(h.frequency);
        const isCompleted = h.completions[periodKey];
        const newCompletions = { ...h.completions, [periodKey]: !isCompleted };

        // Calculate streak
        let streak = 0;
        if (!isCompleted) {
          // Check consecutive periods
          const today = new Date();
          for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = h.frequency === "daily"
              ? d.toISOString().split("T")[0]
              : h.frequency === "weekly"
                ? (() => {
                    const start = new Date(d.getFullYear(), 0, 1);
                    const w = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
                    return `${d.getFullYear()}-W${w}`;
                  })()
                : `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;

            if (key === periodKey) { streak++; continue; }
            if (newCompletions[key]) { streak++; continue; }
            break;
          }
        }

        return {
          ...h,
          completions: newCompletions,
          streak,
          bestStreak: Math.max(h.bestStreak, streak),
        };
      })
    );
  };

  const today = getToday();
  const todayKey = getPeriodKey("daily");
  const weekKey = getPeriodKey("weekly");
  const monthKey = getPeriodKey("monthly");

  const getCompletionRate = (habit: Habit) => {
    const totalDays = Math.max(1, Math.ceil((Date.now() - new Date(habit.createdAt).getTime()) / 86400000));
    const completed = Object.values(habit.completions).filter(Boolean).length;
    return Math.round((completed / totalDays) * 100);
  };

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.completions[todayKey]).length;
  const totalStreaks = habits.reduce((s, h) => s + h.streak, 0);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="today" className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Today</TabsTrigger>
          <TabsTrigger value="habits" className="gap-1"><Target className="h-3.5 w-3.5" /> Habits</TabsTrigger>
          <TabsTrigger value="add" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add</TabsTrigger>
        </TabsList>

        {/* Today */}
        <TabsContent value="today" className="space-y-4 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="p-3 text-center">
                <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-[10px] text-muted-foreground">Habits</p>
                <p className="text-lg font-bold">{totalHabits}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3 text-center">
                <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-green-500" />
                <p className="text-[10px] text-muted-foreground">Done Today</p>
                <p className="text-lg font-bold">{completedToday}/{totalHabits}</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-3 text-center">
                <Flame className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                <p className="text-[10px] text-muted-foreground">Streaks</p>
                <p className="text-lg font-bold">{totalStreaks}</p>
              </CardContent>
            </Card>
          </div>

          {/* Today's habits */}
          {habits.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">No habits yet</p>
                <p className="text-sm text-muted-foreground">Create habits to start tracking.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => {
                const periodKey = getPeriodKey(habit.frequency);
                const isCompleted = habit.completions[periodKey];
                return (
                  <Card
                    key={habit.id}
                    className={`cursor-pointer transition-all ${
                      isCompleted ? "border-green-500/30 bg-green-500/5" : "hover:border-border"
                    }`}
                    onClick={() => toggleCompletion(habit.id)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`p-2 rounded-lg shrink-0 transition-all ${
                        isCompleted ? "bg-green-500 text-white" : "bg-muted"
                      }`}>
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                          {habit.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{habit.category}</Badge>
                          <Badge variant="outline" className="text-[10px]">{habit.frequency}</Badge>
                          {habit.streak > 0 && (
                            <Badge className="text-[10px] bg-amber-500 gap-1">
                              <Flame className="h-3 w-3" /> {habit.streak}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* All Habits */}
        <TabsContent value="habits" className="space-y-2 mt-4">
          {habits.map((habit) => (
            <Card key={habit.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{habit.name}</p>
                    {habit.description && (
                      <p className="text-xs text-muted-foreground">{habit.description}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteHabit(habit.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{habit.category}</Badge>
                  <Badge variant="outline" className="text-[10px]">{habit.frequency}</Badge>
                  <Badge className="text-[10px] bg-amber-500 gap-1">
                    <Flame className="h-3 w-3" /> {habit.streak} day streak
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Trophy className="h-3 w-3" /> Best: {habit.bestStreak}
                  </Badge>
                </div>
                {/* Mini calendar heatmap */}
                <div className="flex gap-0.5 mt-2 flex-wrap">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (27 - i));
                    const key = d.toISOString().split("T")[0];
                    const completed = habit.completions[key];
                    return (
                      <div
                        key={i}
                        className={`h-3 w-3 rounded-sm ${
                          completed ? "bg-green-500" : "bg-muted"
                        }`}
                        title={`${key}: ${completed ? "Done" : "Missed"}`}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Add */}
        <TabsContent value="add" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Habit Name</Label>
                <Input placeholder="e.g., Read for 30 minutes" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description (optional)</Label>
                <Input placeholder="Why this habit matters..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <Badge
                      key={cat}
                      variant={newCategory === cat ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setNewCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Frequency</Label>
                <div className="grid grid-cols-3 gap-2">
                  {FREQUENCIES.map((f) => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setNewFrequency(f.id)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          newFrequency === f.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border/50 hover:border-border"
                        }`}
                      >
                        <Icon className="h-4 w-4 mx-auto mb-1" />
                        <span className="text-xs font-medium">{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button onClick={addHabit} className="gap-2 w-full" disabled={!newName.trim()}>
                <Plus className="h-4 w-4" /> Create Habit
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}