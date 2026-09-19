"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calculator, GraduationCap } from "lucide-react";

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: string;
}

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0,
};

const GRADE_SCALES: Record<string, Record<string, number>> = {
  "4.0": GRADE_POINTS,
  "4.3": {
    "A+": 4.3, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "D-": 0.7,
    "F": 0.0,
  },
  "5.0": {
    "A+": 5.0, "A": 4.5, "A-": 4.0,
    "B+": 3.5, "B": 3.0, "B-": 2.5,
    "C+": 2.0, "C": 1.5, "C-": 1.0,
    "D+": 0.5, "D": 0.0, "D-": 0.0,
    "F": 0.0,
  },
  "100": {
    "A+": 97, "A": 93, "A-": 90,
    "B+": 87, "B": 83, "B-": 80,
    "C+": 77, "C": 73, "C-": 70,
    "D+": 67, "D": 63, "D-": 60,
    "F": 0,
  },
};

function generateId(): string {
  return `c_${Math.random().toString(36).slice(2, 10)}`;
}

export function GPACalculatorEngine() {
  const [scale, setScale] = useState("4.0");
  const [courses, setCourses] = useState<Course[]>([
    { id: generateId(), name: "", grade: "A", credits: "3" },
  ]);
  const [result, setResult] = useState<{ gpa: number; totalCredits: number; totalPoints: number } | null>(null);

  const gradeScale = GRADE_SCALES[scale] || GRADE_POINTS;

  const updateCourse = (id: string, field: keyof Course, value: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addCourse = () => {
    setCourses(prev => [...prev, { id: generateId(), name: "", grade: "A", credits: "3" }]);
  };

  const removeCourse = (id: string) => {
    if (courses.length <= 1) return;
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    for (const course of courses) {
      const credits = parseFloat(course.credits);
      if (isNaN(credits) || credits <= 0) continue;
      const gradePoint = gradeScale[course.grade];
      if (gradePoint === undefined) continue;

      totalPoints += gradePoint * credits;
      totalCredits += credits;
    }

    if (totalCredits === 0) {
      setResult(null);
      return;
    }

    const gpa = totalPoints / totalCredits;
    setResult({
      gpa: Math.round(gpa * 100) / 100,
      totalCredits,
      totalPoints: Math.round(totalPoints * 100) / 100,
    });
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return "text-green-400";
    if (gpa >= 3.0) return "text-cyan-400";
    if (gpa >= 2.0) return "text-yellow-400";
    return "text-red-400";
  };

  const getGPALabel = (gpa: number) => {
    if (gpa >= 3.7) return "Excellent";
    if (gpa >= 3.0) return "Good";
    if (gpa >= 2.0) return "Average";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-4">
      {/* Scale selector */}
      <div className="w-[150px]">
        <Label className="text-xs mb-1 block">GPA Scale</Label>
        <Select value={scale} onValueChange={(v) => setScale(v || "4.0")}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4.0">4.0 Scale</SelectItem>
            <SelectItem value="4.3">4.3 Scale</SelectItem>
            <SelectItem value="5.0">5.0 Scale</SelectItem>
            <SelectItem value="100">100-Point</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses */}
      <div className="space-y-3">
        {courses.map((course, i) => (
          <Card key={course.id}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-6">#{i + 1}</span>
                <Input
                  value={course.name}
                  onChange={e => updateCourse(course.id, "name", e.target.value)}
                  placeholder="Course name"
                  className="h-8 text-sm flex-1"
                />
                <Select value={course.grade} onValueChange={v => updateCourse(course.id, "grade", v || "A")}>
                  <SelectTrigger className="h-8 w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(gradeScale).map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={course.credits}
                  onChange={e => updateCourse(course.id, "credits", e.target.value)}
                  type="number"
                  min="0.5"
                  step="0.5"
                  className="h-8 w-[70px] text-sm"
                  placeholder="Credits"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeCourse(course.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={addCourse} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Add Course
        </Button>
        <Button onClick={calculateGPA} className="gap-2">
          <Calculator className="h-4 w-4" /> Calculate GPA
        </Button>
      </div>

      {result && (
        <Card className="border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-4 text-center">
            <GraduationCap className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
            <p className={`text-4xl font-bold ${getGPAColor(result.gpa)}`}>
              {result.gpa.toFixed(2)}
            </p>
            <Badge className="mt-1">{getGPALabel(result.gpa)}</Badge>
            <div className="flex justify-center gap-6 mt-3 text-sm text-muted-foreground">
              <span>Credits: {result.totalCredits}</span>
              <span>Points: {result.totalPoints}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}