"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function GradeCalculatorEngine() {
  const [assignments, setAssignments] = useState([{ name: "", earned: "", total: "", weight: "" }]);
  const [result, setResult] = useState<{ percentage: number; letter: string } | null>(null);

  const addRow = () => setAssignments([...assignments, { name: "", earned: "", total: "", weight: "" }]);
  const removeRow = (i: number) => setAssignments(assignments.filter((_, idx) => idx !== i));

  const getLetter = (pct: number) => {
    if (pct >= 93) return "A";
    if (pct >= 90) return "A-";
    if (pct >= 87) return "B+";
    if (pct >= 83) return "B";
    if (pct >= 80) return "B-";
    if (pct >= 77) return "C+";
    if (pct >= 73) return "C";
    if (pct >= 70) return "C-";
    if (pct >= 67) return "D+";
    if (pct >= 60) return "D";
    return "F";
  };

  const calculate = () => {
    let totalWeighted = 0;
    let totalWeight = 0;
    for (const a of assignments) {
      const earned = Number(a.earned);
      const total = Number(a.total);
      const weight = Number(a.weight);
      if (total && weight) {
        totalWeighted += (earned / total) * weight;
        totalWeight += weight;
      }
    }
    if (totalWeight === 0) return;
    const pct = Math.round((totalWeighted / totalWeight) * 10000) / 100;
    setResult({ percentage: pct, letter: getLetter(pct) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Grade Calculator</Badge>
        <span className="text-xs text-muted-foreground">Calculate weighted course grade</span>
      </div>

      <div className="space-y-2">
        {assignments.map((a, i) => (
          <div key={i} className="flex gap-1.5 items-center flex-wrap">
            <input type="text" value={a.name} onChange={(e) => { const n = [...assignments]; n[i].name = e.target.value; setAssignments(n); }} placeholder="Name" className="w-20 px-2 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="number" value={a.earned} onChange={(e) => { const n = [...assignments]; n[i].earned = e.target.value; setAssignments(n); }} placeholder="Earned" className="w-16 px-2 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <span className="text-xs text-muted-foreground">/</span>
            <input type="number" value={a.total} onChange={(e) => { const n = [...assignments]; n[i].total = e.target.value; setAssignments(n); }} placeholder="Total" className="w-16 px-2 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="number" value={a.weight} onChange={(e) => { const n = [...assignments]; n[i].weight = e.target.value; setAssignments(n); }} placeholder="Wt%" className="w-14 px-2 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
            {assignments.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeRow(i)} className="text-red-500 rounded-xl">✕</Button>}
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addRow} className="rounded-xl text-xs w-full">+ Add Assignment</Button>
      <Button onClick={calculate} className="gap-2 rounded-xl w-full"><Calculator className="h-4 w-4" />Calculate Grade</Button>

      {result && (
        <div className="p-4 bg-muted/30 rounded-xl text-center">
          <div className="text-2xl font-bold">{result.percentage.toFixed(1)}%</div>
          <div className="text-lg font-semibold text-primary">{result.letter}</div>
        </div>
      )}
    </div>
  );
}