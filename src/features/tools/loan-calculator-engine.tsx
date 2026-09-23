"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  Download,
  Calendar,
  Percent,
  TrendingDown,
  Table as TableIcon,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

  const loanResult: DetailedLoanResult | null = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const y = parseFloat(years);
    const extra = parseFloat(extraPayment) || 0;

    if (isNaN(p) || isNaN(r) || isNaN(y) || p <= 0 || r < 0 || y <= 0) return null;
    return calculateDetailedLoan(p, r, y, extra);
  }, [principal, rate, years, extraPayment]);

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
    <div className="space-y-6">
      {/* Input Parameters Card */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="pb-2 border-b">
          <h3 className="font-semibold text-sm">Loan Terms &amp; Borrowing Details</h3>
          <p className="text-xs text-muted-foreground">
            Calculate your monthly mortgage or loan payments and complete amortization
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Loan Amount ($)</Label>
            <Input
              type="number"
              placeholder="250000"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="h-10 text-sm font-mono"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Annual Interest Rate (%)</Label>
            <Input
              type="number"
              step="0.05"
              placeholder="6.5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="h-10 text-sm font-mono"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Loan Term (Years)</Label>
            <Input
              type="number"
              placeholder="30"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="h-10 text-sm font-mono"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              Extra Monthly Payment ($)
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
              className="h-10 text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {loanResult && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-xs border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Monthly Payment (P&amp;I)
                </span>
                <p className="text-3xl font-extrabold font-mono text-primary mt-1">
                  ${loanResult.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                {parseFloat(extraPayment) > 0 && (
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    +${parseFloat(extraPayment).toLocaleString()} extra = $
                    {(loanResult.monthlyPayment + parseFloat(extraPayment)).toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo
                  </span>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Total Interest Paid
                </span>
                <p className="text-2xl font-bold font-mono text-foreground mt-1">
                  ${loanResult.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  {loanResult.interestRatio}% of total cost
                </span>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Total Loan Cost
                </span>
                <p className="text-2xl font-bold font-mono text-foreground mt-1">
                  ${loanResult.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Paid off in {loanResult.totalPeriods} months (~{(loanResult.totalPeriods / 12).toFixed(1)} yrs)
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Principal vs Interest Breakdown Bar */}
          <div className="rounded-xl border bg-card p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
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
          <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b gap-2">
              <div className="flex items-center gap-2">
                <TableIcon className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">Amortization Schedule</h4>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant={scheduleView === "annual" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setScheduleView("annual")}
                    className="h-7 text-xs"
                  >
                    Annual Summary
                  </Button>
                  <Button
                    variant={scheduleView === "monthly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setScheduleView("monthly")}
                    className="h-7 text-xs"
                  >
                    Monthly Detail
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-1 h-7 text-xs"
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