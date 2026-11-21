"use client";

import { useState } from "react";
import { Calendar, Target, ListChecks, BookOpen, CheckCircle2, Sparkles, Download, Copy, RefreshCw, ChevronDown, ChevronUp, Clock, Users, DollarSign, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { complete } from "@/lib/ai";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Milestone {
  title: string;
  deadline: string;
  tasks: string[];
}

interface WeeklyPlan {
  week: number;
  focus: string;
  tasks: string[];
  resources: string[];
}

interface PlanResult {
  goal: string;
  timeframe: string;
  milestones: Milestone[];
  weeklyPlan: WeeklyPlan[];
  resources: string[];
  tips: string[];
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLAN_TYPES = [
  { value: "learning", label: "Learning / Skill", icon: BookOpen },
  { value: "project", label: "Project", icon: Target },
  { value: "event", label: "Event", icon: Calendar },
  { value: "business", label: "Business", icon: DollarSign },
  { value: "personal", label: "Personal Goal", icon: ClipboardList },
  { value: "team", label: "Team Project", icon: Users },
];

const TIMEFRAMES = [
  { value: "1-week", label: "1 Week" },
  { value: "2-weeks", label: "2 Weeks" },
  { value: "1-month", label: "1 Month" },
  { value: "3-months", label: "3 Months" },
  { value: "6-months", label: "6 Months" },
  { value: "1-year", label: "1 Year" },
];

// ---------------------------------------------------------------------------
// AI helpers
// ---------------------------------------------------------------------------

function buildAIPrompt(goal: string, planType: string, timeframe: string): string {
  return `Create a detailed ${planType} plan for the following goal: "${goal}". Timeframe: ${timeframe}.

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "goal": "string",
  "timeframe": "string",
  "milestones": [
    { "title": "string", "deadline": "string (relative, e.g. 'Week 1' or 'Month 1')", "tasks": ["string"] }
  ],
  "weeklyPlan": [
    { "week": number, "focus": "string", "tasks": ["string"], "resources": ["string (specific books, courses, tools)"] }
  ],
  "resources": ["string (overall recommended resources)"],
  "tips": ["string (practical advice for success)"]
}

Rules:
- Create 3-5 milestones spread across the timeframe
- Create weekly plans covering the entire timeframe (1 week = 1 entry, 2 weeks = 2 entries, 1 month = 4 entries, 3 months = 12 entries, 6 months = 24 entries, 1 year = 12 monthly entries)
- Each weekly plan should have 3-5 tasks and 1-3 specific resources
- Resources should be real, actionable (book titles, course names, tool names, websites)
- Tips should be practical and motivational
- Make it detailed and actionable, not generic`;
}

function parseAIResponse(text: string): PlanResult | null {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }
    const parsed = JSON.parse(cleaned);
    if (parsed.goal && parsed.milestones && parsed.weeklyPlan) {
      return parsed as PlanResult;
    }
    return null;
  } catch {
    return null;
  }
}

function getFallbackPlan(goal: string, planType: string, timeframe: string): PlanResult {
  const weekCount = timeframe === "1-week" ? 1 : timeframe === "2-weeks" ? 2 : timeframe === "1-month" ? 4 : timeframe === "3-months" ? 12 : timeframe === "6-months" ? 24 : 12;
  const isMonthly = timeframe === "1-year";

  const milestones: Milestone[] = [
    { title: "Foundation & Setup", deadline: isMonthly ? "Month 1-3" : "Week 1-2", tasks: ["Research and gather resources", "Set up tools and environment", "Define success criteria"] },
    { title: "Core Progress", deadline: isMonthly ? "Month 4-6" : `Week ${Math.floor(weekCount / 3)}-${Math.floor(weekCount * 2 / 3)}`, tasks: ["Execute main tasks", "Track progress weekly", "Adjust plan as needed"] },
    { title: "Review & Refine", deadline: isMonthly ? "Month 7-9" : `Week ${Math.floor(weekCount * 2 / 3) + 1}-${weekCount - 1}`, tasks: ["Review what worked", "Fill knowledge gaps", "Polish deliverables"] },
    { title: "Completion & Showcase", deadline: isMonthly ? "Month 10-12" : `Week ${weekCount}`, tasks: ["Final review", "Document learnings", "Share or present results"] },
  ];

  const weeklyPlan: WeeklyPlan[] = Array.from({ length: weekCount }, (_, i) => ({
    week: i + 1,
    focus: i === 0 ? "Getting Started" : i === weekCount - 1 ? "Final Push" : `Progress Week ${i + 1}`,
    tasks: [`Task ${i * 3 + 1} for ${goal}`, `Task ${i * 3 + 2} for ${goal}`, `Task ${i * 3 + 3} for ${goal}`],
    resources: ["Online tutorials", "Practice exercises", "Community forums"],
  }));

  return {
    goal,
    timeframe,
    milestones,
    weeklyPlan,
    resources: ["Online courses (Coursera, Udemy)", "Books and documentation", "Practice projects", "Community forums (Reddit, Discord)"],
    tips: ["Break large tasks into smaller chunks", "Set aside dedicated time each day", "Track your progress regularly", "Don't hesitate to ask for help"],
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AIPlanningEngine() {
  const [goal, setGoal] = useState("");
  const [planType, setPlanType] = useState("learning");
  const [timeframe, setTimeframe] = useState("3-months");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedAI, setUsedAI] = useState(false);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const response = await complete({
        prompt: goal,
        systemPrompt: buildAIPrompt(goal, planType, timeframe),
        temperature: 0.5,
        maxTokens: 4000,
      });
      const parsed = parseAIResponse(response.text);
      if (parsed) {
        setPlan(parsed);
        setUsedAI(true);
        setChecklist(parsed.milestones.flatMap(m => m.tasks).map((t, i) => ({ id: `task-${i}`, text: t, completed: false })));
      } else {
        const fallback = getFallbackPlan(goal, planType, timeframe);
        setPlan(fallback);
        setUsedAI(false);
        setChecklist(fallback.milestones.flatMap(m => m.tasks).map((t, i) => ({ id: `task-${i}`, text: t, completed: false })));
        setError("AI response couldn't be parsed. Using a smart template instead.");
      }
    } catch {
      const fallback = getFallbackPlan(goal, planType, timeframe);
      setPlan(fallback);
      setUsedAI(false);
      setChecklist(fallback.milestones.flatMap(m => m.tasks).map((t, i) => ({ id: `task-${i}`, text: t, completed: false })));
      setError("AI is unavailable (offline or API error). Using a smart template.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleWeek = (week: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week); else next.add(week);
      return next;
    });
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const copyPlan = () => {
    if (!plan) return;
    let text = `📋 Plan: ${plan.goal}\n⏱ Timeframe: ${plan.timeframe}\n\n`;
    text += "🎯 MILESTONES:\n";
    plan.milestones.forEach(m => {
      text += `  • ${m.title} (${m.deadline})\n`;
      m.tasks.forEach(t => text += `    - ${t}\n`);
    });
    text += "\n📅 WEEKLY PLAN:\n";
    plan.weeklyPlan.forEach(w => {
      text += `  Week ${w.week}: ${w.focus}\n`;
      w.tasks.forEach(t => text += `    - ${t}\n`);
      if (w.resources.length > 0) {
        text += `    Resources: ${w.resources.join(", ")}\n`;
      }
    });
    text += `\n📚 RESOURCES:\n${plan.resources.map(r => `  • ${r}`).join("\n")}`;
    text += `\n💡 TIPS:\n${plan.tips.map(t => `  • ${t}`).join("\n")}`;
    navigator.clipboard.writeText(text);
  };

  const completedCount = checklist.filter(i => i.completed).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI Planning Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal">What do you want to plan?</Label>
            <Textarea
              id="goal"
              placeholder="e.g., I have 3 months to learn Python and build two projects... or Plan my wedding with a $10,000 budget..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plan Type</Label>
              <Select value={planType} onValueChange={(v) => setPlanType(v || "learning")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_TYPES.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select value={timeframe} onValueChange={(v) => setTimeframe(v || "3-months")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((tf) => (
                    <SelectItem key={tf.value} value={tf.value}>{tf.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={!goal.trim() || isGenerating} className="w-full" size="lg">
            {isGenerating ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Generating Plan...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate AI Plan</>
            )}
          </Button>
          {error && <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {plan && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold">{plan.goal}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> {plan.timeframe}
                {usedAI && <Badge variant="secondary" className="text-xs">AI Generated</Badge>}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyPlan}><Copy className="h-4 w-4 mr-1" /> Copy</Button>
              <Button variant="outline" size="sm" onClick={() => {}}><Download className="h-4 w-4 mr-1" /> Export</Button>
            </div>
          </div>

          {/* Progress Bar */}
          {checklist.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">{completedCount}/{checklist.length} tasks ({progressPercent}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="milestones">
            <TabsList className="w-full">
              <TabsTrigger value="milestones" className="flex-1"><Target className="h-4 w-4 mr-1" /> Milestones</TabsTrigger>
              <TabsTrigger value="weekly" className="flex-1"><Calendar className="h-4 w-4 mr-1" /> Weekly Plan</TabsTrigger>
              <TabsTrigger value="checklist" className="flex-1"><CheckCircle2 className="h-4 w-4 mr-1" /> Checklist ({completedCount}/{checklist.length})</TabsTrigger>
              <TabsTrigger value="resources" className="flex-1"><BookOpen className="h-4 w-4 mr-1" /> Resources</TabsTrigger>
            </TabsList>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="space-y-3 mt-4">
              {plan.milestones.map((milestone, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{i + 1}</Badge>
                        {milestone.title}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">{milestone.deadline}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {milestone.tasks.map((task, j) => (
                        <li key={j} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Weekly Plan Tab */}
            <TabsContent value="weekly" className="space-y-2 mt-4">
              {plan.weeklyPlan.map((week) => (
                <Card key={week.week} className="cursor-pointer" onClick={() => toggleWeek(week.week)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Week {week.week}</Badge>
                        <span className="font-medium text-sm">{week.focus}</span>
                      </div>
                      {expandedWeeks.has(week.week) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CardHeader>
                  {expandedWeeks.has(week.week) && (
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Tasks</p>
                        <ul className="space-y-1">
                          {week.tasks.map((task, j) => (
                            <li key={j} className="text-sm flex items-start gap-2">
                              <ListChecks className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {week.resources.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Resources</p>
                          <div className="flex flex-wrap gap-1">
                            {week.resources.map((r, j) => (
                              <Badge key={j} variant="outline" className="text-xs">{r}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </TabsContent>

            {/* Checklist Tab */}
            <TabsContent value="checklist" className="space-y-1 mt-4">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => toggleChecklistItem(item.id)}
                >
                  <div className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${item.completed ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30"}`}>
                    {item.completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <span className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
                </div>
              ))}
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-4 mt-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Recommended Resources</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.resources.map((r, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <BookOpen className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Tips for Success</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.tips.map((tip, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <Sparkles className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}