"use client";

import { useState } from "react";
import { Wallet, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { calculateSalary, SalaryResult } from "@/features/tools/salary-calculator";

export function SalaryCalculatorEngine() {
  const [grossAnnual, setGrossAnnual] = useState("");
  const [federalTaxRate, setFederalTaxRate] = useState("22");
  const [stateTaxRate, setStateTaxRate] = useState("5");
  const [otherDeductions, setOtherDeductions] = useState("0");
  const [result, setResult] = useState<SalaryResult | null>(null);

  const handleCalculate = () => {
    const ga = parseFloat(grossAnnual);
    const ft = parseFloat(federalTaxRate);
    const st = parseFloat(stateTaxRate);
    const od = parseFloat(otherDeductions);
    if (isNaN(ga) || isNaN(ft) || isNaN(st) || isNaN(od) || ga <= 0) return;
    setResult(calculateSalary(ga, st, ft, od));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-sm mb-1.5 block">Gross Annual Salary ($)</Label>
          <Input type="number" placeholder="85000" value={grossAnnual} onChange={e => setGrossAnnual(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Federal Tax Rate (%)</Label>
          <Input type="number" placeholder="22" step="0.1" value={federalTaxRate} onChange={e => setFederalTaxRate(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">State Tax Rate (%)</Label>
          <Input type="number" placeholder="5" step="0.1" value={stateTaxRate} onChange={e => setStateTaxRate(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Other Deductions ($)</Label>
          <Input type="number" placeholder="0" value={otherDeductions} onChange={e => setOtherDeductions(e.target.value)} />
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full gap-2" disabled={!grossAnnual}>
        <Wallet className="h-4 w-4" /> Calculate Take-Home Pay
      </Button>

      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-green-600">${result.netAnnual.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Net Annual</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.netMonthly.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Net Monthly</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.netBiweekly.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Net Biweekly</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.netWeekly.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Net Weekly</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-red-600">${result.totalDeductions.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Deductions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.grossAnnual.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Gross Annual</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}