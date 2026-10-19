"use client";

import { useState, useMemo } from "react";
import { Download, Table as TableIcon, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalculatorLayout } from "@/components/common/workload-layouts";
import {
  calculateDetailedLoan,
  DetailedLoanResult,
} from "@/features/tools/loan-calculator";
import { toast } from "sonner";

export function LoanCalculatorEngine() {
  const [principal, setPrincipal] = useState("250000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const [extraPayment, setExtraPayment] = useState("0");
  const [scheduleView, setScheduleView] = useState<"annual" | "monthly">("annual");

  const loanCalculation = useMemo<{ result: DetailedLoanResult | null; error: string | null }>(() => {
    if (!principal.trim() || !rate.trim() || !years.trim()) return { result: null, error: null };
    const amount = Number(principal);
    const annualRate = Number(rate);
    const term = Number(years);
    const extra = Number(extraPayment);
    const months = term * 12;
    if (![amount, annualRate, term, extra].every(Number.isFinite) || amount < 0.01 || annualRate < 0 || extra < 0
      || !Number.isSafeInteger(months) || months <= 0) {
      return { result: null, error: "Enter a positive loan amount, nonnegative rate and extra payment, and a term in whole months." };
    }
    const growth = Math.pow(1 + annualRate / 1200, months);
    if (!Number.isFinite(growth) || (annualRate > 0 && growth === 1)) {
      return { result: null, error: "These terms exceed the schedule's numeric range. Adjust the rate or term." };
    }
    const result = calculateDetailedLoan(amount, annualRate, term, extra);
    if (![result.monthlyPayment, result.totalPayment, result.totalInterest, result.principalRatio, result.interestRatio].every(Number.isFinite)
      || result.monthlySchedule.at(-1)?.balance !== 0) {
      return { result: null, error: "These terms cannot produce a finite, fully repaid schedule. Adjust the values." };
    }
    return { result, error: null };
  }, [principal, rate, years, extraPayment]);
  const loanResult = loanCalculation.result;

  const handleExportCSV = () => {
    if (!loanResult) return;
    const header = "Period,Payment,Principal,Interest,Remaining Balance\n";
    const rows = loanResult.monthlySchedule
      .map(
        (r) =>
          `Month ${r.period},${r.payment},${r.principal},${r.interest},${r.balance}`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amortization-schedule-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded amortization CSV file!");
  };

  return (
    <div className="min-w-0 space-y-4">
      <CalculatorLayout
        inputSection={
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="loan-principal" className="text-sm mb-1.5 block">Loan Amount ($)</Label>
            <Input
              id="loan-principal"
              type="number"
              placeholder="250000"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="h-10 text-sm font-mono"
            />
          </div>
          <div>
            <Label htmlFor="loan-rate" className="text-sm mb-1.5 block">Annual Interest Rate (%)</Label>
            <Input
              id="loan-rate"
              type="number"
              step="0.05"
              placeholder="6.5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="h-10 text-sm font-mono"
            />
          </div>
          <div>
            <Label htmlFor="loan-years" className="text-sm mb-1.5 block">Loan Term (Years)</Label>
            <Input
              id="loan-years"
              type="number"
              placeholder="30"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="h-10 text-sm font-mono"
            />
          </div>
          <div>
            <Label htmlFor="loan-extra" className="text-sm mb-1.5 block">
              Extra Monthly Payment ($)
            </Label>
            <Input
              id="loan-extra"
              type="number"
              placeholder="0"
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
              className="h-10 text-sm font-mono"
            />
          </div>
        </div>
        }
        resultSection={loanResult ? (
          <div className="grid min-w-0 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="min-w-0">
                <span className="text-sm text-muted-foreground block">
                  Monthly Payment (P&amp;I)
                </span>
                <p className="text-2xl font-semibold tabular-nums text-primary mt-1 break-words">
                  ${loanResult.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                {parseFloat(extraPayment) > 0 && (
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    +${parseFloat(extraPayment).toLocaleString()} extra = $
                    {(loanResult.monthlyPayment + parseFloat(extraPayment)).toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo
                  </span>
                )}
            </div>
            <div className="min-w-0">
                <span className="text-sm text-muted-foreground block">
                  Total Interest Paid
                </span>
                <p className="text-xl font-semibold tabular-nums text-foreground mt-1 break-words">
                  ${loanResult.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  {loanResult.interestRatio}% of total cost
                </span>
            </div>
            <div className="min-w-0">
                <span className="text-sm text-muted-foreground block">
                  Total Loan Cost
                </span>
                <p className="text-xl font-semibold tabular-nums text-foreground mt-1 break-words">
                  ${loanResult.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Paid off in {loanResult.totalPeriods} months (~{(loanResult.totalPeriods / 12).toFixed(1)} yrs)
                </span>
            </div>
          </div>
        ) : loanCalculation.error ? <p role="alert" className="text-sm text-destructive">{loanCalculation.error}</p>
          : <p className="text-sm text-muted-foreground">Enter valid loan terms to calculate payments.</p>}
      />

      {loanResult && (
        <div className="min-w-0 space-y-4">
          {/* Principal vs Interest Breakdown Bar */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <PieChart className="h-3.5 w-3.5 text-primary" /> Cost Allocation
              </span>
              <span className="text-muted-foreground">
                Principal: {loanResult.principalRatio}% | Interest: {loanResult.interestRatio}%
              </span>
            </div>
            <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-muted">
              <div
                className="bg-primary transition-all duration-500"
                style={{ width: `${loanResult.principalRatio}%` }}
                title={`Principal: ${loanResult.principalRatio}%`}
              />
              <div
                className="bg-amber-500 transition-all duration-500"
                style={{ width: `${loanResult.interestRatio}%` }}
                title={`Interest: ${loanResult.interestRatio}%`}
              />
            </div>
          </div>

          {/* Amortization Table */}
          <div className="min-w-0 border-t pt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <TableIcon className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">Amortization Schedule</h4>
                <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Schedule period">
                  <Button
                    variant={scheduleView === "annual" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setScheduleView("annual")}
                    aria-pressed={scheduleView === "annual"}
                    className="min-h-11 text-sm"
                  >
                    Annual Summary
                  </Button>
                  <Button
                    variant={scheduleView === "monthly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setScheduleView("monthly")}
                    aria-pressed={scheduleView === "monthly"}
                    className="min-h-11 text-sm"
                  >
                    Monthly Detail
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-2 min-h-11 text-sm"
              >
                <Download className="h-3.5 w-3.5" /> Export Schedule (CSV)
              </Button>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              {scheduleView === "annual" ? (
                <table className="w-full text-xs font-mono">
                  <thead className="bg-muted/50 sticky top-0 border-b">
                    <tr className="text-muted-foreground text-left">
                      <th className="p-2">Year</th>
                      <th className="p-2">Principal Paid</th>
                      <th className="p-2">Interest Paid</th>
                      <th className="p-2 text-right">Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loanResult.annualSchedule.map((row) => (
                      <tr key={row.year} className="hover:bg-muted/30">
                        <td className="p-2 font-semibold">Year {row.year}</td>
                        <td className="p-2 text-emerald-600 font-medium">
                          ${row.principalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-amber-600 font-medium">
                          ${row.interestPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right font-semibold">
                          ${row.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-xs font-mono">
                  <thead className="bg-muted/50 sticky top-0 border-b">
                    <tr className="text-muted-foreground text-left">
                      <th className="p-2">Month</th>
                      <th className="p-2">Payment</th>
                      <th className="p-2">Principal</th>
                      <th className="p-2">Interest</th>
                      <th className="p-2 text-right">Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loanResult.monthlySchedule.slice(0, 120).map((row) => (
                      <tr key={row.period} className="hover:bg-muted/30">
                        <td className="p-2 font-medium">Month {row.period}</td>
                        <td className="p-2">${row.payment.toFixed(2)}</td>
                        <td className="p-2 text-emerald-600 font-medium">${row.principal.toFixed(2)}</td>
                        <td className="p-2 text-amber-600 font-medium">${row.interest.toFixed(2)}</td>
                        <td className="p-2 text-right font-semibold">${row.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}