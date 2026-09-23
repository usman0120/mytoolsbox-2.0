"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Calculator, GraduationCap, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  calculateCoursesGPA, calculateCumulativeCGPA, forecastTargetGPA,
  GRADE_SCALES_DATA, WEIGHT_BONUS,
  type CourseEntry, type GPAScaleType, type CourseWeight,
} from "@/features/tools/gpa-calculator";

function genId() { return `c_${Math.random().toString(36).slice(2, 9)}`; }

const SCALES: { value: GPAScaleType; label: string }[] = [
  { value: "4.0",  label: "4.0 Scale (US Standard)" },
  { value: "4.3",  label: "4.3 Scale" },
  { value: "5.0",  label: "5.0 Scale" },
  { value: "100",  label: "100-Point Scale" },
  { value: "uk",   label: "UK Degree Classification" },
];

const WEIGHTS: { value: CourseWeight; label: string }[] = [
  { value: "regular",  label: "Regular" },
  { value: "honors",   label: "Honors (+0.5)" },
  { value: "ap_ib",    label: "AP / IB (+1.0)" },
  { value: "college",  label: "College (+1.0)" },
];

function GpaGauge({ gpa, max }: { gpa: number; max: number }) {
  const pct = Math.min(100, (gpa / max) * 100);
  const color = pct >= 87.5 ? "text-green-400" : pct >= 75 ? "text-cyan-400" : pct >= 50 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3" className="stroke-muted" />
          <circle
            cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeLinecap="round"
            className={pct >= 87.5 ? "stroke-green-400" : pct >= 75 ? "stroke-cyan-400" : pct >= 50 ? "stroke-yellow-400" : "stroke-red-400"}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{gpa.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export function GPACalculatorEngine() {
  const [scale, setScale] = useState<GPAScaleType>("4.0");
  const [courses, setCourses] = useState<CourseEntry[]>([
    { id: genId(), name: "", grade: "A", credits: 3, weight: "regular" },
  ]);
  const [mode, setMode] = useState("semester");
  // CGPA fields
  const [priorCredits, setPriorCredits] = useState("");
  const [priorGPA, setPriorGPA]       = useState("");
  // Target GPA
  const [targetGpa, setTargetGpa]     = useState("");
  const [remainingCred, setRemainingCred] = useState("");

  const gradeOptions = Object.keys(GRADE_SCALES_DATA[scale] || GRADE_SCALES_DATA["4.0"]);
  const maxScale = scale === "5.0" ? 5.0 : scale === "4.3" ? 4.3 : scale === "100" ? 100 : 4.0;

  const result = useMemo(() => {
    if (mode === "cgpa") {
      return calculateCumulativeCGPA(
        parseFloat(priorCredits) || 0,
        parseFloat(priorGPA) || 0,
        courses, scale
      );
    }
    return calculateCoursesGPA(courses, scale);
  }, [courses, scale, mode, priorCredits, priorGPA]);

  const forecast = useMemo(() => {
    if (!targetGpa || mode === "semester") return null;
    return forecastTargetGPA(
      result.gpa,
      result.totalCredits,
      parseFloat(targetGpa) || 0,
      parseFloat(remainingCred) || 0,
      scale
    );
  }, [targetGpa, remainingCred, result, scale, mode]);

  const updateCourse = (id: string, field: keyof CourseEntry, value: string | number) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addCourse = () => setCourses(prev => [
    ...prev, { id: genId(), name: "", grade: gradeOptions[0] || "A", credits: 3, weight: "regular" },
  ]);

  const removeCourse = (id: string) => {
    if (courses.length <= 1) return;
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Scale + Mode */}
      <div className="flex flex-wrap gap-3 items-center">
        <div>
          <Label className="text-xs mb-1 block">GPA Scale</Label>
          <Select value={scale} onValueChange={v => setScale(v as GPAScaleType)}>
            <SelectTrigger className="h-8 w-52 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCALES.map(s => <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Tabs value={mode} onValueChange={setMode} className="pt-4">
          <TabsList className="h-8">
            <TabsTrigger value="semester" className="text-xs h-7">Semester GPA</TabsTrigger>
            <TabsTrigger value="cgpa" className="text-xs h-7">Cumulative CGPA</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === "cgpa" && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Prior Credits Completed</Label>
                <Input value={priorCredits} onChange={e => setPriorCredits(e.target.value)} placeholder="e.g. 60" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Prior GPA</Label>
                <Input value={priorGPA} onChange={e => setPriorGPA(e.target.value)} placeholder={`e.g. ${maxScale >= 10 ? "75" : "3.2"}`} className="h-8 text-sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Courses This Semester</Label>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addCourse}>
            <Plus className="h-3 w-3" /> Add Course
          </Button>
        </div>

        {courses.map((c, i) => (
          <Card key={c.id} className="p-0">
            <CardContent className="pt-3 pb-2">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  {i === 0 && <Label className="text-[10px] mb-1 block text-muted-foreground">Course Name</Label>}
                  <Input
                    value={c.name}
                    onChange={e => updateCourse(c.id, "name", e.target.value)}
                    placeholder={`Course ${i + 1}`}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <Label className="text-[10px] mb-1 block text-muted-foreground">Grade</Label>}
                  <Select value={c.grade} onValueChange={v => updateCourse(c.id, "grade", v ?? "")}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map(g => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  {i === 0 && <Label className="text-[10px] mb-1 block text-muted-foreground">Credits</Label>}
                  <Input
                    type="number" min={0.5} max={6} step={0.5}
                    value={c.credits}
                    onChange={e => updateCourse(c.id, "credits", parseFloat(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
                {(scale === "4.0" || scale === "4.3" || scale === "5.0") && (
                  <div className="col-span-3">
                    {i === 0 && <Label className="text-[10px] mb-1 block text-muted-foreground">Weight</Label>}
                    <Select value={c.weight || "regular"} onValueChange={v => updateCourse(c.id, "weight", v ?? "regular")}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WEIGHTS.map(w => <SelectItem key={w.value} value={w.value} className="text-xs">{w.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="col-span-1 flex justify-end">
                  {i === 0 && <div className="h-[18px]" />}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeCourse(c.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Result card */}
      {result.totalCredits > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <GpaGauge gpa={result.gpa} max={maxScale} />
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Weighted GPA</p>
                    <p className="text-2xl font-bold">{result.gpa.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Unweighted GPA</p>
                    <p className="text-lg font-semibold text-muted-foreground">{result.unweightedGpa.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Total Credits</p>
                    <p className="text-sm font-medium">{result.totalCredits}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Quality Points</p>
                    <p className="text-sm font-medium">{result.totalQualityPoints.toFixed(2)}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">{result.academicStanding}</Badge>
                {result.latinHonors && (
                  <Badge className="text-xs ml-2 bg-yellow-500/20 text-yellow-600 border-yellow-400/30">{result.latinHonors}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Target GPA planner — only in CGPA mode */}
      {mode === "cgpa" && result.totalCredits > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" /> Target GPA Planner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Target GPA</Label>
                <Input value={targetGpa} onChange={e => setTargetGpa(e.target.value)} placeholder={`e.g. ${maxScale >= 10 ? "80" : "3.5"}`} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Remaining Credits</Label>
                <Input value={remainingCred} onChange={e => setRemainingCred(e.target.value)} placeholder="e.g. 30" className="h-8 text-sm" />
              </div>
            </div>
            {forecast && (
              <div className={`rounded-lg p-3 text-sm ${
                forecast.isAttainable ? "bg-green-500/10 text-green-600 border border-green-400/20" : "bg-red-500/10 text-red-600 border border-red-400/20"
              }`}>
                <p className="font-semibold text-base">Required GPA: {forecast.requiredGpa > 0 ? forecast.requiredGpa.toFixed(2) : "Already achieved!"}</p>
                <p className="text-xs mt-1">{forecast.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}