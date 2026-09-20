"use client";

import { useState } from "react";
import { Calculator, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function DateDifferenceEngine() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<{ days: number; weeks: number; months: number; years: number } | null>(null);

  const calculate = () => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const days = Math.abs(Math.round(diffMs / (1000 * 60 * 60 * 24)));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);
    const years = Math.floor(days / 365.25);
    setResult({ days, weeks, months, years });
  };

  const addDays = (days: number) => {
    if (!startDate) return;
    const d = new Date(startDate);
    d.setDate(d.getDate() + days);
    setEndDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Date Difference</Badge>
        <span className="text-xs text-muted-foreground">Calculate days between two dates</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs text-muted-foreground self-center mr-1">Quick:</span>
        {[7, 30, 90, 365].map(d => (
          <Button key={d} variant="outline" size="sm" onClick={() => addDays(d)} className="rounded-xl text-xs">+{d}d</Button>
        ))}
      </div>

      <Button onClick={calculate} disabled={!startDate || !endDate} className="gap-2 rounded-xl w-full"><Calculator className="h-4 w-4" />Calculate Difference</Button>

      {result && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Days", value: result.days.toLocaleString() },
            { label: "Weeks", value: result.weeks.toLocaleString() },
            { label: "Months", value: result.months.toLocaleString() },
            { label: "Years", value: result.years.toFixed(1) },
          ].map(item => (
            <div key={item.label} className="p-3 bg-muted/30 rounded-xl text-center">
              <div className="text-lg font-bold">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}