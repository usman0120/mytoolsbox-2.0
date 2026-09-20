"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CGPACalculatorEngine() {
  const [grades, setGrades] = useState([{ credit: "", grade: "" }]);
  const [result, setResult] = useState<number | null>(null);

  const gradePoints: Record<string, number> = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0 };

  const addRow = () => setGrades([...grades, { credit: "", grade: "" }]);
  const removeRow = (i: number) => setGrades(grades.filter((_, idx) => idx !== i));

  const calculate = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    for (const g of grades) {
      const c = Number(g.credit);
      const gp = gradePoints[g.grade];
      if (c && gp !== undefined) { totalPoints += c * gp; totalCredits += c; }
    }
    if (totalCredits === 0) return;
    setResult(Math.round((totalPoints / totalCredits) * 100) / 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">CGPA Calculator</Badge>
        <span className="text-xs text-muted-foreground">Calculate your cumulative GPA</span>
      </div>

      <div className="space-y-2">
        {grades.map((g, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input type="number" value={g.credit} onChange={(e) => { const n = [...grades]; n[i].credit = e.target.value; setGrades(n); }} placeholder="Credits" className="w-24 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <select value={g.grade} onChange={(e) => { const n = [...grades]; n[i].grade = e.target.value; setGrades(n); }} className="flex-1 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Grade</option>
              {Object.keys(gradePoints).map(gp => <option key={gp} value={gp}>{gp} ({gradePoints[gp]})</option>)}
            </select>
            {grades.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeRow(i)} className="text-red-500 rounded-xl">✕</Button>}
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addRow} className="rounded-xl text-xs w-full">+ Add Course</Button>
      <Button onClick={calculate} disabled={grades.every(g => !g.credit || !g.grade)} className="gap-2 rounded-xl w-full"><Calculator className="h-4 w-4" />Calculate CGPA</Button>

      {result !== null && (
        <div className="p-4 bg-muted/30 rounded-xl text-center">
          <div className="text-2xl font-bold">{result.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Your CGPA</div>
        </div>
      )}
    </div>
  );
}