"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dumbbell, Flame, Timer, Sparkles, Trophy, Calendar, Check, Copy,
  RefreshCw, Play, Pause, RotateCcw, Plus, Trash2, Activity,
  Info, ShieldCheck, ArrowRight, Scale, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCredits } from "@/lib/credits/use-credits";
import {
  calculateOneRepMax, calculateTDEE, generateWorkoutProgram, generateOfflineFitnessAdvice,
  type WorkoutSplitType, type ExperienceLevel, type FitnessGoal, type EquipmentType,
  type ActivityLevel, type CalorieGoal, type WorkoutProgram, type OneRepMaxResult, type TdeeResult
} from "./fitness/fitness-engine-logic";

export function FitnessAIEngine() {
  const { remaining, refresh } = useCredits();
  const isLow = remaining < 100;

  // Tab State
  const [activeTab, setActiveTab] = useState<"program" | "tracker" | "onerm" | "tdee" | "coach">("program");

  // Program Generator State
  const [splitType, setSplitType] = useState<WorkoutSplitType>("ppl");
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [experience, setExperience] = useState<ExperienceLevel>("intermediate");
  const [goal, setGoal] = useState<FitnessGoal>("hypertrophy");
  const [equipment, setEquipment] = useState<EquipmentType>("full_gym");
  const [program, setProgram] = useState<WorkoutProgram>(() =>
    generateWorkoutProgram({
      splitType: "ppl",
      daysPerWeek: 4,
      experience: "intermediate",
      goal: "hypertrophy",
      equipment: "full_gym",
    })
  );

  const handleGenerateProgram = () => {
    const p = generateWorkoutProgram({
      splitType,
      daysPerWeek,
      experience,
      goal,
      equipment,
    });
    setProgram(p);
    toast.success(`Generated ${p.name}!`);
  };

  // 1RM State
  const [rmWeight, setRmWeight] = useState<number>(100);
  const [rmReps, setRmReps] = useState<number>(5);
  const [rmResult, setRmResult] = useState<OneRepMaxResult>(() => calculateOneRepMax(100, 5));

  const handleCalculate1RM = () => {
    if (rmWeight <= 0 || rmReps <= 0) {
      toast.error("Please enter positive weight and rep values");
      return;
    }
    setRmResult(calculateOneRepMax(rmWeight, rmReps));
  };

  // TDEE State
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState<number>(26);
  const [weightKg, setWeightKg] = useState<number>(78);
  const [heightCm, setHeightCm] = useState<number>(178);
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [calorieGoal, setCalorieGoal] = useState<CalorieGoal>("clean_bulk");
  const [tdeeResult, setTdeeResult] = useState<TdeeResult>(() =>
    calculateTDEE({
      gender: "male",
      age: 26,
      weightKg: 78,
      heightCm: 178,
      activity: "moderate",
      goal: "clean_bulk",
    })
  );

  const handleCalculateTDEE = () => {
    setTdeeResult(
      calculateTDEE({
        gender,
        age,
        weightKg,
        heightCm,
        activity,
        goal: calorieGoal,
      })
    );
    toast.success("Macronutrient targets calculated!");
  };

  // Rest Timer & Live Tracker State
  const [timerSeconds, setTimerSeconds] = useState<number>(90);
  const [timerInitial, setTimerInitial] = useState<number>(90);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [loggedSets, setLoggedSets] = useState<{ id: string; exercise: string; weight: number; reps: number; completed: boolean }[]>([
    { id: "1", exercise: "Barbell Bench Press", weight: 80, reps: 8, completed: true },
    { id: "2", exercise: "Barbell Bench Press", weight: 80, reps: 8, completed: true },
    { id: "3", exercise: "Barbell Bench Press", weight: 80, reps: 7, completed: false },
    { id: "4", exercise: "Incline Dumbbell Press", weight: 30, reps: 10, completed: false },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      toast.success("Rest period finished! Time for your next set.", { icon: "🔔" });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const startTimer = (seconds: number) => {
    setTimerInitial(seconds);
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const toggleSet = (id: string) => {
    setLoggedSets((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextState = !s.completed;
          if (nextState) {
            // Auto start rest timer on set complete
            startTimer(timerInitial);
          }
          return { ...s, completed: nextState };
        }
        return s;
      })
    );
  };

  // AI Fitness Coach State
  const [coachPrompt, setCoachPrompt] = useState<string>("");
  const [coachResponse, setCoachResponse] = useState<string>("");
  const [isCoachLoading, setIsCoachLoading] = useState<boolean>(false);

  const handleAskCoach = async (queryText?: string) => {
    const textToAsk = queryText || coachPrompt;
    if (!textToAsk.trim()) {
      toast.error("Please enter a question for the coach.");
      return;
    }

    const cost = 20;
    if (remaining < cost) {
      toast.error(`Requires ${cost} AI credits. Current balance: ${remaining}.`);
      return;
    }

    setIsCoachLoading(true);
    setCoachResponse("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToAsk,
          operation: "fitness_coach",
          tier: "reasoning",
          systemPrompt:
            "You are an elite Sports Scientist and Master Strength Coach. Provide precise, evidence-based biomechanical cues, programming sets/reps, fatigue management, and injury mitigation.",
        }),
      });

      if (!res.ok) {
        throw new Error("Live AI connection failed, switching to expert engine.");
      }

      const data = await res.json();
      setCoachResponse(data.text);
      refresh();
      toast.success("Coaching advice generated! 20 credits used.");
    } catch {
      // Graceful offline fallback
      const offlineAdvice = generateOfflineFitnessAdvice(textToAsk);
      setCoachResponse(offlineAdvice);
      toast.info("Generated via expert offline sports science knowledge base.");
    } finally {
      setIsCoachLoading(false);
    }
  };

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Platform Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI Fitness & Gym Coach Platform</h2>
            <p className="text-xs text-muted-foreground">Science-backed training splits, 1RM calculators, TDEE macros & AI coaching</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-xs">
            <Sparkles className="h-3 w-3 text-cyan-500" />
            <span>AI Credits: <strong className={isLow ? "text-amber-500" : "text-cyan-500"}>{remaining}</strong></span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto p-1 bg-muted/60">
          <TabsTrigger value="program" className="gap-2 py-2 text-xs md:text-sm">
            <Calendar className="h-4 w-4 text-cyan-500" />
            Workout Split
          </TabsTrigger>
          <TabsTrigger value="tracker" className="gap-2 py-2 text-xs md:text-sm">
            <Timer className="h-4 w-4 text-blue-500" />
            Live Session
          </TabsTrigger>
          <TabsTrigger value="onerm" className="gap-2 py-2 text-xs md:text-sm">
            <Trophy className="h-4 w-4 text-amber-500" />
            1RM Matrix
          </TabsTrigger>
          <TabsTrigger value="tdee" className="gap-2 py-2 text-xs md:text-sm">
            <Flame className="h-4 w-4 text-rose-500" />
            TDEE & Macros
          </TabsTrigger>
          <TabsTrigger value="coach" className="gap-2 py-2 text-xs md:text-sm">
            <Sparkles className="h-4 w-4 text-violet-500" />
            AI Coach
          </TabsTrigger>
        </TabsList>

        {/* ==================================================================== */}
        {/* 1. WORKOUT PROGRAM GENERATOR */}
        {/* ==================================================================== */}
        <TabsContent value="program" className="space-y-6 mt-6">
          <Card className="border-border/60 shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-cyan-500" />
                Scientific Workout Split Architect
              </CardTitle>
              <CardDescription>
                Configure your split type, weekly frequency, equipment, and primary stimulus.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Split Style</Label>
                  <Select value={splitType} onValueChange={(v) => setSplitType((v ?? "ppl") as WorkoutSplitType)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select split" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ppl">Push / Pull / Legs</SelectItem>
                      <SelectItem value="upper_lower">Upper / Lower</SelectItem>
                      <SelectItem value="full_body">Full Body Compound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Days / Week</Label>
                  <Select value={String(daysPerWeek)} onValueChange={(v) => setDaysPerWeek(Number(v ?? 4))}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Days (Full Recovery)</SelectItem>
                      <SelectItem value="4">4 Days (Upper / Lower)</SelectItem>
                      <SelectItem value="5">5 Days (High Frequency)</SelectItem>
                      <SelectItem value="6">6 Days (PPL Repeat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Target Goal</Label>
                  <Select value={goal} onValueChange={(v) => setGoal((v ?? "hypertrophy") as FitnessGoal)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hypertrophy">Muscle Hypertrophy (8-12 reps)</SelectItem>
                      <SelectItem value="strength">Raw Strength (3-5 reps)</SelectItem>
                      <SelectItem value="fat_loss">Fat Loss & Conditioning</SelectItem>
                      <SelectItem value="endurance">Muscular Endurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Equipment</Label>
                  <Select value={equipment} onValueChange={(v) => setEquipment((v ?? "full_gym") as EquipmentType)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_gym">Commercial Gym (Cables & Racks)</SelectItem>
                      <SelectItem value="barbell_dumbbells">Barbells & Dumbbells</SelectItem>
                      <SelectItem value="bodyweight">Bodyweight & Calisthenics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleGenerateProgram} className="w-full gap-2 text-xs bg-cyan-600 hover:bg-cyan-700 text-white">
                    <RefreshCw className="h-3.5 w-3.5" /> Rebuild Split
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Schedule Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">{program.name} ({program.days.length} Days)</h3>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => {
                  const summary = `${program.name}\n\n` + program.days.map((d) =>
                    `[${d.dayName}: ${d.focus}]\n` + d.exercises.map((e) => `• ${e.name} — ${e.defaultSets} sets x ${e.defaultReps} (Rest: ${e.restSeconds}s)`).join("\n")
                  ).join("\n\n");
                  copyText(summary);
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy Program
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {program.days.map((day) => (
                <Card key={day.dayNumber} className="border-border/60 hover:border-cyan-500/40 transition-colors">
                  <CardHeader className="pb-2 bg-muted/20 border-b border-border/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                        Day {day.dayNumber}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {day.exercises.length} Exercises
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{day.dayName}</CardTitle>
                    <p className="text-xs text-muted-foreground">{day.focus}</p>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-3">
                    {day.exercises.map((ex, idx) => (
                      <div key={ex.id || idx} className="p-2.5 rounded-lg bg-card border border-border/40 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{ex.name}</span>
                          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                            {ex.defaultSets} × {ex.defaultReps}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="capitalize">{ex.targetMuscle}</span>
                          <span>•</span>
                          <span>Rest: {ex.restSeconds}s</span>
                        </div>
                        {ex.cues.length > 0 && (
                          <p className="text-[10px] italic text-muted-foreground/80 line-clamp-1">
                            Cue: {ex.cues[0]}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ==================================================================== */}
        {/* 2. LIVE WORKOUT SESSION & REST TIMER */}
        {/* ==================================================================== */}
        <TabsContent value="tracker" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rest Timer Widget */}
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Timer className="h-5 w-5 text-blue-500" />
                  Smart Rest Countdown
                </CardTitle>
                <CardDescription>Keeps intra-set rest consistent for hypertrophy and strength.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="py-6">
                  <div className="text-6xl font-black font-mono tracking-tight text-foreground">
                    {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, "0")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {isTimerRunning ? "⏱️ Rest in progress..." : "Timer paused"}
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    variant={isTimerRunning ? "secondary" : "default"}
                    className="w-28 gap-1.5"
                  >
                    {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isTimerRunning ? "Pause" : "Start"}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(timerInitial);
                    }}
                    variant="outline"
                    size="icon"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {[30, 60, 90, 120, 180].map((sec) => (
                    <Button
                      key={sec}
                      variant={timerInitial === sec ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7 px-2.5"
                      onClick={() => startTimer(sec)}
                    >
                      {sec}s
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Set Tracker Table */}
            <Card className="lg:col-span-2 border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-5 w-5 text-cyan-500" />
                      Live Set Logger
                    </CardTitle>
                    <CardDescription>Check off sets to log volume and trigger rest timers.</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5"
                    onClick={() => {
                      const nextId = String(loggedSets.length + 1);
                      setLoggedSets((prev) => [
                        ...prev,
                        { id: nextId, exercise: "Target Exercise", weight: 75, reps: 10, completed: false },
                      ]);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Set
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="divide-y divide-border/40">
                  {loggedSets.map((s, index) => (
                    <div
                      key={s.id}
                      className={`py-2.5 flex items-center justify-between gap-3 transition-colors ${
                        s.completed ? "opacity-60 bg-muted/20 px-2 rounded-lg" : "px-2"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSet(s.id)}
                          className={`h-6 w-6 rounded-md flex items-center justify-center border transition-all ${
                            s.completed
                              ? "bg-cyan-600 border-cyan-600 text-white"
                              : "border-muted-foreground/30 hover:border-cyan-500"
                          }`}
                        >
                          {s.completed && <Check className="h-4 w-4" />}
                        </button>
                        <div>
                          <span className="text-xs font-semibold block">{s.exercise}</span>
                          <span className="text-[10px] text-muted-foreground">Set #{index + 1}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            value={s.weight}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setLoggedSets((prev) =>
                                prev.map((item) => (item.id === s.id ? { ...item, weight: val } : item))
                              );
                            }}
                            className="w-16 h-7 text-xs text-right"
                          />
                          <span className="text-xs text-muted-foreground">kg</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            value={s.reps}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setLoggedSets((prev) =>
                                prev.map((item) => (item.id === s.id ? { ...item, reps: val } : item))
                              );
                            }}
                            className="w-14 h-7 text-xs text-right"
                          />
                          <span className="text-xs text-muted-foreground">reps</span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setLoggedSets((prev) => prev.filter((item) => item.id !== s.id))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    Total Volume:{" "}
                    <strong>
                      {loggedSets.reduce((sum, s) => sum + (s.completed ? s.weight * s.reps : 0), 0)} kg
                    </strong>
                  </span>
                  <span>
                    Completed: {loggedSets.filter((s) => s.completed).length} / {loggedSets.length} sets
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================================================================== */}
        {/* 3. 1RM MATRIX CALCULATOR */}
        {/* ==================================================================== */}
        <TabsContent value="onerm" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  1RM Calculator
                </CardTitle>
                <CardDescription>Estimate maximal strength without testing true 1-rep limit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Weight Lifted (kg / lbs)</Label>
                  <Input
                    type="number"
                    value={rmWeight}
                    onChange={(e) => setRmWeight(Number(e.target.value))}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Repetitions Completed (1-30)</Label>
                  <Input
                    type="number"
                    value={rmReps}
                    onChange={(e) => setRmReps(Number(e.target.value))}
                    className="h-9 text-sm"
                  />
                </div>
                <Button onClick={handleCalculate1RM} className="w-full text-xs gap-1.5">
                  Calculate 1RM
                </Button>

                <div className="pt-4 border-t border-border/40 text-center">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Calculated 1RM</span>
                  <div className="text-4xl font-extrabold text-amber-500 font-mono mt-1">
                    {rmResult.average} <span className="text-sm font-normal text-muted-foreground">kg</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-2">
                  <div className="flex justify-between"><span>Brzycki Formula:</span> <strong>{rmResult.brzycki} kg</strong></div>
                  <div className="flex justify-between"><span>Epley Formula:</span> <strong>{rmResult.epley} kg</strong></div>
                  <div className="flex justify-between"><span>Lander Formula:</span> <strong>{rmResult.lander} kg</strong></div>
                  <div className="flex justify-between"><span>Lombardi Formula:</span> <strong>{rmResult.lombardi} kg</strong></div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="h-5 w-5 text-cyan-500" />
                  Percentage Training Load Table
                </CardTitle>
                <CardDescription>Target weights for prescribed rep ranges in your training blocks.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/40 uppercase text-[10px] text-muted-foreground font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 rounded-l-md">Rep Target</th>
                        <th className="py-2.5 px-3">Intensity (% 1RM)</th>
                        <th className="py-2.5 px-3">Working Weight</th>
                        <th className="py-2.5 px-3 rounded-r-md">Target Adaptation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono">
                      {rmResult.percentages.map((p) => (
                        <tr key={p.reps} className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-semibold">{p.reps} {p.reps === 1 ? "rep (1RM)" : "reps"}</td>
                          <td className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400 font-bold">{p.percent}%</td>
                          <td className="py-2.5 px-3 font-bold text-foreground">{p.weight} kg</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">
                            {p.reps <= 3 ? "Peak Strength & Neuromuscular" : p.reps <= 6 ? "Myofibrillar Hypertrophy" : p.reps <= 10 ? "Optimal Hypertrophy" : "Muscular Endurance & Volume"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================================================================== */}
        {/* 4. TDEE & MACRONUTRIENT TARGETS */}
        {/* ==================================================================== */}
        <TabsContent value="tdee" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-5 w-5 text-rose-500" />
                  Metabolic Parameters
                </CardTitle>
                <CardDescription>Mifflin-St Jeor equation with personalized activity factor.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Gender</Label>
                    <Select value={gender} onValueChange={(v) => setGender((v ?? "male") as "male" | "female")}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Age</Label>
                    <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="h-9 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Weight (kg)</Label>
                    <Input type="number" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} className="h-9 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Height (cm)</Label>
                    <Input type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} className="h-9 text-xs" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1 block">Activity Multiplier</Label>
                  <Select value={activity} onValueChange={(v) => setActivity((v ?? "moderate") as ActivityLevel)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (Desk job, no training)</SelectItem>
                      <SelectItem value="light">Lightly Active (1-3 days/wk)</SelectItem>
                      <SelectItem value="moderate">Moderately Active (3-5 days/wk)</SelectItem>
                      <SelectItem value="very_active">Very Active (6-7 days/wk)</SelectItem>
                      <SelectItem value="extra_active">Extremely Active (Athlete / physical labor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1 block">Caloric Goal</Label>
                  <Select value={calorieGoal} onValueChange={(v) => setCalorieGoal((v ?? "clean_bulk") as CalorieGoal)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aggressive_cut">Aggressive Cut (-500 kcal)</SelectItem>
                      <SelectItem value="cut">Moderate Cut (-300 kcal)</SelectItem>
                      <SelectItem value="maintain">Maintenance (Recomp)</SelectItem>
                      <SelectItem value="clean_bulk">Clean Bulk (+250 kcal)</SelectItem>
                      <SelectItem value="aggressive_bulk">Mass Bulk (+500 kcal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCalculateTDEE} className="w-full text-xs gap-1.5 mt-2">
                  Update Targets
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-500" />
                  Daily Nutrition Blueprint
                </CardTitle>
                <CardDescription>Scientific macronutrient distribution for optimal body composition.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">BMR</span>
                    <span className="text-xl font-bold font-mono text-foreground">{tdeeResult.bmr}</span>
                    <span className="text-[10px] text-muted-foreground block">kcal/day</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Maintenance (TDEE)</span>
                    <span className="text-xl font-bold font-mono text-foreground">{tdeeResult.tdee}</span>
                    <span className="text-[10px] text-muted-foreground block">kcal/day</span>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block">Target Daily</span>
                    <span className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400">{tdeeResult.targetCalories}</span>
                    <span className="text-[10px] text-muted-foreground block">kcal/day</span>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Hydration Goal</span>
                    <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">{tdeeResult.waterLiters}</span>
                    <span className="text-[10px] text-muted-foreground block">Liters/day</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Macronutrient Grams</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-border/50 bg-card space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-rose-500">Protein (4 kcal/g)</span>
                        <Badge variant="outline" className="text-[10px]">{tdeeResult.macrosRatio.proteinPct}%</Badge>
                      </div>
                      <div className="text-2xl font-bold font-mono">{tdeeResult.proteinGrams}g</div>
                      <p className="text-[10px] text-muted-foreground">Essential for muscle repair & satiety</p>
                    </div>

                    <div className="p-3 rounded-lg border border-border/50 bg-card space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-amber-500">Fats (9 kcal/g)</span>
                        <Badge variant="outline" className="text-[10px]">{tdeeResult.macrosRatio.fatPct}%</Badge>
                      </div>
                      <div className="text-2xl font-bold font-mono">{tdeeResult.fatGrams}g</div>
                      <p className="text-[10px] text-muted-foreground">Hormonal production & cellular health</p>
                    </div>

                    <div className="p-3 rounded-lg border border-border/50 bg-card space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-cyan-500">Carbohydrates (4 kcal/g)</span>
                        <Badge variant="outline" className="text-[10px]">{tdeeResult.macrosRatio.carbPct}%</Badge>
                      </div>
                      <div className="text-2xl font-bold font-mono">{tdeeResult.carbGrams}g</div>
                      <p className="text-[10px] text-muted-foreground">Glycogen replenishment & peak performance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================================================================== */}
        {/* 5. AI STRENGTH & FITNESS COACH */}
        {/* ==================================================================== */}
        <TabsContent value="coach" className="space-y-6 mt-6">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    AI Strength & Biomechanics Coach
                  </CardTitle>
                  <CardDescription>
                    Ask any question about programming, lifting mechanics, plateaus, or injury management.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Cost: 20 credits / query
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  "How do I fix elbow flare during the bench press?",
                  "Squat depth: How to improve ankle dorsiflexion mobility?",
                  "Deadlift cueing: How to engage lats before breaking the floor?",
                  "When should I implement a deload week in my training?",
                ].map((promptText) => (
                  <Button
                    key={promptText}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1 px-2.5 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setCoachPrompt(promptText);
                      handleAskCoach(promptText);
                    }}
                  >
                    {promptText}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Ask the AI Coach anything (e.g. 'Can you analyze my 4-day Upper/Lower split and tell me if shoulder volume is too high?')"
                  value={coachPrompt}
                  onChange={(e) => setCoachPrompt(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-muted-foreground">
                    Available balance: <strong>{remaining}</strong> credits
                  </span>
                  <Button
                    onClick={() => handleAskCoach()}
                    disabled={isCoachLoading}
                    className="gap-2 text-xs bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {isCoachLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Consulting Coach...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" /> Consult Coach (20 cr)
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {coachResponse && (
                <div className="mt-6 p-4 rounded-xl bg-card border border-border/60 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Coach Analysis & Prescription
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => copyText(coachResponse)}
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                  </div>
                  <div className="text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                    {coachResponse}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
