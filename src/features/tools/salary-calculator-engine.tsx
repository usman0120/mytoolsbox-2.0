"use client";

import { useState } from "react";
import { Wallet, DollarSign, Clock, Shield, Table, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { calculateSalary, type PayPeriod, type SalaryResult } from "@/features/tools/salary-calculator";

export function SalaryCalculatorEngine() {
  const [amount, setAmount] = useState("85000");
  const [period, setPeriod] = useState<PayPeriod>("annual");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [overtimeHours, setOvertimeHours] = useState("0");
  const [federalTaxRate, setFederalTaxRate] = useState("18");
  const [stateTaxRate, setStateTaxRate] = useState("4.5");
  const [k401Percent, setK401Percent] = useState("5");
  const [healthInsuranceMonthly, setHealthInsuranceMonthly] = useState("200");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [result, setResult] = useState<SalaryResult | null>(() =>
    calculateSalary({
      amount: 85000,
      period: "annual",
      hoursPerWeek: 40,
      federalTaxRate: 18,
      stateTaxRate: 4.5,
      retirement401kPercent: 5,
      healthInsuranceMonthly: 200,
    })
  );

  const handleCalculate = () => {
    const amt = parseFloat(amount) || 0;
    const res = calculateSalary({
      amount: amt,
      period,
      hoursPerWeek: parseFloat(hoursPerWeek) || 40,
      overtimeHoursPerWeek: parseFloat(overtimeHours) || 0,
      federalTaxRate: parseFloat(federalTaxRate) || 0,
      stateTaxRate: parseFloat(stateTaxRate) || 0,
      retirement401kPercent: parseFloat(k401Percent) || 0,
      healthInsuranceMonthly: parseFloat(healthInsuranceMonthly) || 0,
    });
    setResult(res);
  };

  return (
    <div className="space-y-4">
      {/* Primary Configuration */}
      <div className="p-4 rounded-xl border bg-card/60 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Pay Amount ($)</Label>
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="85000"
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label className="text-xs mb-1.5 block font-medium">Pay Frequency / Basis</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as PayPeriod)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual Salary</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
                <SelectItem value="monthly">Monthly Salary</SelectItem>
                <SelectItem value="biweekly">Bi-Weekly (every 2 weeks)</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="daily">Daily Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Working Hours (especially helpful for hourly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Standard Hours / Week</Label>
            <Input
              type="number"
              value={hoursPerWeek}
              onChange={e => setHoursPerWeek(e.target.value)}
              placeholder="40"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Overtime Hours / Week (1.5×)</Label>
            <Input
              type="number"
              value={overtimeHours}
              onChange={e => setOvertimeHours(e.target.value)}
              placeholder="0"
              className="font-mono text-sm"
            />
          </div>
        </div>

        {/* Advanced Deductions Toggle */}
        <div className="pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2 gap-1"
            onClick={() => setShowAdvanced(prev => !prev)}
          >
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showAdvanced ? "Hide" : "Show"} Taxes & Benefit Deductions (401k, Healthcare, State Tax)
          </Button>
        </div>

        {showAdvanced && (
          <div className="p-3 rounded-lg border bg-muted/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <Label className="text-[11px] mb-1 block">Federal Tax Rate (%)</Label>
              <Input
                type="number"
                value={federalTaxRate}
                onChange={e => setFederalTaxRate(e.target.value)}
                placeholder="18"
                className="h-8 font-mono"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">State Tax Rate (%)</Label>
              <Input
                type="number"
                value={stateTaxRate}
                onChange={e => setStateTaxRate(e.target.value)}
                placeholder="4.5"
                className="h-8 font-mono"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">401(k) Retirement (%)</Label>
              <Input
                type="number"
                value={k401Percent}
                onChange={e => setK401Percent(e.target.value)}
                placeholder="5"
                className="h-8 font-mono"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">Health Insurance ($/mo)</Label>
              <Input
                type="number"
                value={healthInsuranceMonthly}
                onChange={e => setHealthInsuranceMonthly(e.target.value)}
                placeholder="200"
                className="h-8 font-mono"
              />
            </div>
          </div>
        )}

        <Button onClick={handleCalculate} className="w-full gap-2">
          <Wallet className="h-4 w-4" /> Calculate Take-Home Salary Breakdown
        </Button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {/* Take-Home Retention Bar */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Take-Home Pay Ratio: <strong className="text-emerald-500 font-mono text-sm">{result.takeHomePercentage}%</strong> of Gross Income
                </span>
                <span className="text-muted-foreground font-mono">
                  ${result.netAnnual.toLocaleString()} / ${result.grossAnnual.toLocaleString()}
                </span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${result.takeHomePercentage}%` }}
                  title="Net Take-Home"
                />
                <div
                  className="bg-destructive/70 h-full transition-all"
                  style={{ width: `${100 - result.takeHomePercentage}%` }}
                  title="Taxes & Deductions"
                />
              </div>
            </CardContent>
          </Card>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Net Annual Salary</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-500">
                  ${result.netAnnual.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Gross: ${result.grossAnnual.toLocaleString()}</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Net Monthly Pay</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                  ${result.netMonthly.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Gross: ${result.grossMonthly.toLocaleString()}</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Net Bi-Weekly Pay</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                  ${result.netBiweekly.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">26 paychecks/yr</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Net Hourly Wage</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                  ${result.netHourly.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Gross: ${result.grossHourly.toLocaleString()}</span>
              </CardContent>
            </Card>
          </div>

          {/* Full Schedule Table */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Table className="h-4 w-4 text-primary" />
                <span>Pay Frequency Comparison Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="py-2.5 px-4 text-left font-semibold">Pay Frequency</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Gross Pay</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Taxes (Fed+State+FICA)</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Benefits / 401k</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Net Take-Home</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.schedule.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="py-2.5 px-4 font-semibold text-foreground">{item.period}</td>
                      <td className="py-2.5 px-4 text-right">${item.gross.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right text-destructive">-${item.taxes.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right text-muted-foreground">-${item.deductions.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-500">${item.net.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}