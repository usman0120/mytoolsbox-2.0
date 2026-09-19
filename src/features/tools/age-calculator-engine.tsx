"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { calculateAge, dateDifference } from "@/features/tools/age-calculator";

export function AgeCalculatorEngine() {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateAge> | null>(null);

  const handleCalculate = () => {
    if (!birthDate) return;
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return;
    setResult(calculateAge(date));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm mb-1.5 block">Date of Birth</Label>
        <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
      </div>

      <Button onClick={handleCalculate} className="w-full gap-2" disabled={!birthDate}>
        <Calendar className="h-4 w-4" /> Calculate Age
      </Button>

      {result && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{result.years}</p>
              <p className="text-xs text-muted-foreground">Years</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{result.months}</p>
              <p className="text-xs text-muted-foreground">Months</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{result.days}</p>
              <p className="text-xs text-muted-foreground">Days</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}