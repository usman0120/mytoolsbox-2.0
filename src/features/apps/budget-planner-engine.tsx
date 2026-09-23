"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Wallet,
  Plus,
  Trash2,
  Edit3,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  DollarSign,
  Calendar,
  Target,
  Download,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  isRecurring?: boolean;
}

const EXPENSE_CATEGORIES = [
  "Housing & Rent",
  "Groceries & Food",
  "Transportation & Gas",
  "Utilities & Bills",
  "Healthcare & Insurance",
  "Entertainment & Dining",
  "Shopping & Personal",
  "Education & Learning",
  "Debt Payments",
  "Savings & Investments",
  "Other Expenses",
];

const INCOME_CATEGORIES = [
  "Primary Salary",
  "Freelance & Contract",
  "Investments & Dividends",
  "Business & Side Hustle",
  "Gifts & Grants",
  "Other Income",
];

const CURRENCIES: Record<string, { symbol: string; label: string }> = {
  USD: { symbol: "$", label: "USD ($)" },
  EUR: { symbol: "€", label: "EUR (€)" },
  GBP: { symbol: "£", label: "GBP (£)" },
  INR: { symbol: "₹", label: "INR (₹)" },
  CAD: { symbol: "C$", label: "CAD (C$)" },
  AUD: { symbol: "A$", label: "AUD (A$)" },
  JPY: { symbol: "¥", label: "JPY (¥)" },
};

const SAMPLE_PROFILES: Record<string, { label: string; currency: string; items: BudgetItem[] }> = {
  tech_pro: {
    label: "Tech Professional ($7,500/mo)",
    currency: "USD",
    items: [
      { id: "p1", name: "Software Engineering Salary", amount: 7500, type: "income", category: "Primary Salary", date: "2026-09-01", isRecurring: true },
      { id: "p2", name: "High-Rise Apartment Rent", amount: 2400, type: "expense", category: "Housing & Rent", date: "2026-09-01", isRecurring: true },
      { id: "p3", name: "Groceries & Meal Prep", amount: 650, type: "expense", category: "Groceries & Food", date: "2026-09-03", isRecurring: true },
      { id: "p4", name: "Electric & High-Speed Fiber", amount: 180, type: "expense", category: "Utilities & Bills", date: "2026-09-04", isRecurring: true },
      { id: "p5", name: "Health & Dental Insurance", amount: 320, type: "expense", category: "Healthcare & Insurance", date: "2026-09-05", isRecurring: true },
      { id: "p6", name: "EV Lease & Charging", amount: 480, type: "expense", category: "Transportation & Gas", date: "2026-09-06", isRecurring: true },
      { id: "p7", name: "Dining Out & Social Events", amount: 550, type: "expense", category: "Entertainment & Dining", date: "2026-09-10", isRecurring: false },
      { id: "p8", name: "Index Fund Auto-Invest", amount: 1800, type: "expense", category: "Savings & Investments", date: "2026-09-02", isRecurring: true },
      { id: "p9", name: "Emergency High-Yield Savings", amount: 600, type: "expense", category: "Savings & Investments", date: "2026-09-02", isRecurring: true },
    ],
  },
  freelancer: {
    label: "Freelance Designer ($4,800/mo)",
    currency: "USD",
    items: [
      { id: "f1", name: "Client Retainer Contract", amount: 3200, type: "income", category: "Freelance & Contract", date: "2026-09-01", isRecurring: true },
      { id: "f2", name: "UI Design Project Milestone", amount: 1600, type: "income", category: "Freelance & Contract", date: "2026-09-15", isRecurring: false },
      { id: "f3", name: "Studio Apartment Rent", amount: 1500, type: "expense", category: "Housing & Rent", date: "2026-09-01", isRecurring: true },
      { id: "f4", name: "Groceries & Coffee", amount: 450, type: "expense", category: "Groceries & Food", date: "2026-09-02", isRecurring: true },
      { id: "f5", name: "Figma & Adobe Cloud Suite", amount: 95, type: "expense", category: "Utilities & Bills", date: "2026-09-05", isRecurring: true },
      { id: "f6", name: "Quarterly Tax Set-Aside", amount: 960, type: "expense", category: "Savings & Investments", date: "2026-09-01", isRecurring: true },
      { id: "f7", name: "Emergency Fund Deposit", amount: 700, type: "expense", category: "Savings & Investments", date: "2026-09-03", isRecurring: true },
    ],
  },
  student: {
    label: "University Student ($1,800/mo)",
    currency: "USD",
    items: [
      { id: "s1", name: "Campus Teaching Assistantship", amount: 1200, type: "income", category: "Primary Salary", date: "2026-09-01", isRecurring: true },
      { id: "s2", name: "Part-time Tutoring", amount: 600, type: "income", category: "Freelance & Contract", date: "2026-09-12", isRecurring: false },
      { id: "s3", name: "Shared Dorm / Housing Share", amount: 750, type: "expense", category: "Housing & Rent", date: "2026-09-01", isRecurring: true },
      { id: "s4", name: "Campus Dining & Groceries", amount: 350, type: "expense", category: "Groceries & Food", date: "2026-09-04", isRecurring: true },
      { id: "s5", name: "Textbooks & Lab Supplies", amount: 120, type: "expense", category: "Education & Learning", date: "2026-09-08", isRecurring: false },
      { id: "s6", name: "Transit Pass", amount: 65, type: "expense", category: "Transportation & Gas", date: "2026-09-01", isRecurring: true },
      { id: "s7", name: "Student Emergency Savings", amount: 200, type: "expense", category: "Savings & Investments", date: "2026-09-02", isRecurring: true },
    ],
  },
};

const STORAGE_KEY = "mytoolsbox-budget-planner-v2";

export function BudgetPlannerEngine() {
  const [items, setItems] = useState<BudgetItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {
        // Fall back
      }
    }
    return SAMPLE_PROFILES.tech_pro.items;
  });

  const [currency, setCurrency] = useState("USD");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingId, setEditingId] = useState<string | null>(null);

  // New item form state
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newCategory, setNewCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(true);

  // Persist items
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  // Currency Formatter
  const formatAmt = useCallback(
    (amt: number) => {
      const sym = CURRENCIES[currency]?.symbol || "$";
      return `${sym}${amt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    [currency]
  );

  // Financial Computations
  const stats = useMemo(() => {
    const totalIncome = items
      .filter((i) => i.type === "income")
      .reduce((sum, i) => sum + i.amount, 0);

    const totalExpense = items
      .filter((i) => i.type === "expense")
      .reduce((sum, i) => sum + i.amount, 0);

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // 50/30/20 Rule Classification
    // Needs: Housing, Groceries, Utilities, Healthcare, Transportation, Debt
    const needsCategories = [
      "Housing & Rent",
      "Groceries & Food",
      "Utilities & Bills",
      "Healthcare & Insurance",
      "Transportation & Gas",
      "Debt Payments",
    ];
    // Wants: Entertainment, Shopping, Other
    const wantsCategories = ["Entertainment & Dining", "Shopping & Personal", "Other Expenses"];
    // Savings: Savings & Investments
    const savingsCategories = ["Savings & Investments"];

    let actualNeeds = 0;
    let actualWants = 0;
    let actualSavings = 0;

    items
      .filter((i) => i.type === "expense")
      .forEach((item) => {
        if (needsCategories.includes(item.category)) {
          actualNeeds += item.amount;
        } else if (savingsCategories.includes(item.category)) {
          actualSavings += item.amount;
        } else {
          actualWants += item.amount;
        }
      });

    // Also count positive net cashflow towards savings
    const combinedSavings = actualSavings + Math.max(0, netSavings);

    const targetNeeds = totalIncome * 0.5;
    const targetWants = totalIncome * 0.3;
    const targetSavings = totalIncome * 0.2;

    const needsPct = totalIncome > 0 ? (actualNeeds / totalIncome) * 100 : 0;
    const wantsPct = totalIncome > 0 ? (actualWants / totalIncome) * 100 : 0;
    const savingsPct = totalIncome > 0 ? (combinedSavings / totalIncome) * 100 : 0;

    // Emergency Fund Runway (Months covered by current monthly expense)
    // Assume liquid savings accumulated from savings category items
    const estimatedLiquidBuffer = actualSavings * 4 + Math.max(0, netSavings) * 3;
    const monthlyBurn = totalExpense > 0 ? totalExpense : 1;
    const runwayMonths = estimatedLiquidBuffer > 0 ? (estimatedLiquidBuffer / monthlyBurn).toFixed(1) : "0.0";

    return {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      actualNeeds,
      actualWants,
      actualSavings: combinedSavings,
      targetNeeds,
      targetWants,
      targetSavings,
      needsPct,
      wantsPct,
      savingsPct,
      runwayMonths,
    };
  }, [items]);

  // Grouped expenses by category
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    items
      .filter((i) => i.type === "expense")
      .forEach((i) => {
        map[i.category] = (map[i.category] || 0) + i.amount;
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const addItem = useCallback(() => {
    const parsed = parseFloat(newAmount);
    if (!newName.trim() || isNaN(parsed) || parsed <= 0) {
      toast.error("Please enter a valid item name and amount.");
      return;
    }

    const newItem: BudgetItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newName.trim(),
      amount: parsed,
      type: newType,
      category: newCategory,
      date: newDate,
      isRecurring,
    };

    setItems((prev) => [newItem, ...prev]);
    setNewName("");
    setNewAmount("");
    toast.success(`Added ${newType === "income" ? "inflow" : "expense"}: ${newItem.name}`);
  }, [newName, newAmount, newType, newCategory, newDate, isRecurring]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.info("Item removed from budget");
  }, []);

  const loadProfile = useCallback((key: string) => {
    const profile = SAMPLE_PROFILES[key];
    if (!profile) return;
    setItems(profile.items);
    setCurrency(profile.currency);
    toast.success(`Loaded profile: ${profile.label}`);
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    toast.info("Cleared all budget entries");
  }, []);

  const exportCSV = useCallback(() => {
    if (items.length === 0) {
      toast.error("No budget items to export.");
      return;
    }
    const headers = ["ID", "Name", "Type", "Category", "Amount", "Currency", "Date", "Recurring"];
    const rows = items.map((i) => [
      i.id,
      `"${i.name.replace(/"/g, '""')}"`,
      i.type,
      `"${i.category}"`,
      i.amount.toFixed(2),
      currency,
      i.date,
      i.isRecurring ? "Yes" : "No",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mytoolsbox-budget-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV file downloaded successfully!");
  }, [items, currency]);

  return (
    <div className="space-y-6">
      {/* Top Platform Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">Personal Wealth & Budget Studio</h2>
              <Badge variant="outline" className="text-[10px] uppercase font-semibold text-emerald-600 border-emerald-500/30">
                50/30/20 Engine
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Intelligent financial runway, 50/30/20 rule diagnostics, cashflow analytics, and zero-leak local privacy.
            </p>
          </div>
        </div>

        {/* Currency & Preset Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">Currency:</span>
            <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
              <SelectTrigger className="h-8 w-28 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CURRENCIES).map(([k, c]) => (
                  <SelectItem key={k} value={k} className="text-xs">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select onValueChange={(v: any) => v && loadProfile(String(v))}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              <span>Load Sample Profile</span>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SAMPLE_PROFILES).map(([k, p]) => (
                <SelectItem key={k} value={k} className="text-xs">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={exportCSV} className="h-8 text-xs gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
            Export CSV
          </Button>

          <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8 text-xs gap-1.5">
            <Printer className="h-3.5 w-3.5 text-muted-foreground" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Primary Financial Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflow */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Monthly Inflow</span>
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatAmt(stats.totalIncome)}
            </p>
            <p className="text-[11px] text-muted-foreground">From {items.filter((i) => i.type === "income").length} active sources</p>
          </CardContent>
        </Card>

        {/* Total Outflow */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Monthly Outflow</span>
              <div className="p-1 rounded-md bg-rose-500/10 text-rose-600">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {formatAmt(stats.totalExpense)}
            </p>
            <p className="text-[11px] text-muted-foreground">Across {items.filter((i) => i.type === "expense").length} expense categories</p>
          </CardContent>
        </Card>

        {/* Net Monthly Savings */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Net Monthly Cashflow</span>
              <div className="p-1 rounded-md bg-blue-500/10 text-blue-600">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className={`text-2xl font-bold tracking-tight ${stats.netSavings >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600"}`}>
              {formatAmt(stats.netSavings)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Savings rate: <span className="font-semibold text-foreground">{stats.savingsRate.toFixed(1)}%</span>
            </p>
          </CardContent>
        </Card>

        {/* Emergency Fund Runway */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Runway Health</span>
              <div className="p-1 rounded-md bg-amber-500/10 text-amber-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {stats.runwayMonths} <span className="text-sm font-normal text-muted-foreground">Months</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {parseFloat(stats.runwayMonths) >= 6
                ? "✨ Solid 6+ month emergency safety net"
                : parseFloat(stats.runwayMonths) >= 3
                ? "👍 Healthy 3-month living cushion"
                : "⚠️ Building safety reserve buffer"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 50/30/20 Diagnostic Matrix */}
      <Card className="border-border/60 bg-gradient-to-br from-card via-card to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-emerald-600" />
              50/30/20 Scientific Budget Allocation
            </CardTitle>
            <Badge variant="outline" className="text-[11px]">
              Gold Standard Rule
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Compares your actual spending distribution with the Harvard bankruptcy-proof financial standard (50% Essential Needs, 30% Discretionary Wants, 20% Wealth & Savings).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Needs 50% */}
            <div className="p-3.5 rounded-xl border bg-card/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Needs (Target: 50%)</span>
                <span className={`font-bold ${stats.needsPct > 55 ? "text-rose-500" : "text-emerald-600"}`}>
                  {stats.needsPct.toFixed(1)}% ({formatAmt(stats.actualNeeds)})
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${stats.needsPct > 55 ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(100, stats.needsPct)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Target: {formatAmt(stats.targetNeeds)}.{" "}
                {stats.needsPct <= 50 ? "Within safe boundaries." : "Elevated fixed obligations."}
              </p>
            </div>

            {/* Wants 30% */}
            <div className="p-3.5 rounded-xl border bg-card/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Wants (Target: 30%)</span>
                <span className={`font-bold ${stats.wantsPct > 35 ? "text-amber-500" : "text-blue-600"}`}>
                  {stats.wantsPct.toFixed(1)}% ({formatAmt(stats.actualWants)})
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${stats.wantsPct > 35 ? "bg-amber-500" : "bg-blue-500"}`}
                  style={{ width: `${Math.min(100, stats.wantsPct)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Target: {formatAmt(stats.targetWants)}.{" "}
                {stats.wantsPct <= 30 ? "Disciplined discretionary spend." : "High lifestyle consumption."}
              </p>
            </div>

            {/* Savings 20% */}
            <div className="p-3.5 rounded-xl border bg-card/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Savings & Debt (Target: 20%)</span>
                <span className={`font-bold ${stats.savingsPct >= 20 ? "text-emerald-600" : "text-amber-500"}`}>
                  {stats.savingsPct.toFixed(1)}% ({formatAmt(stats.actualSavings)})
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${stats.savingsPct >= 20 ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${Math.min(100, stats.savingsPct)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Target: {formatAmt(stats.targetSavings)}.{" "}
                {stats.savingsPct >= 20 ? "Superb compounding velocity!" : "Increase margin towards savings."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Workspace: Add Item + Item Ledger & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Fast Ingestion Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-600" />
                Add Inflow or Outflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={newType === "expense" ? "default" : "outline"}
                  onClick={() => {
                    setNewType("expense");
                    setNewCategory(EXPENSE_CATEGORIES[0]);
                  }}
                  className={`text-xs ${newType === "expense" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
                >
                  <TrendingDown className="h-3.5 w-3.5 mr-1" />
                  Expense
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={newType === "income" ? "default" : "outline"}
                  onClick={() => {
                    setNewType("income");
                    setNewCategory(INCOME_CATEGORIES[0]);
                  }}
                  className={`text-xs ${newType === "income" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                >
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  Income
                </Button>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Description</Label>
                <Input
                  placeholder={newType === "income" ? "e.g. Consulting Project Milestone" : "e.g. Rent, Groceries, Electricity"}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Amount Input */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Amount ({CURRENCIES[currency]?.symbol})</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="h-8 text-xs font-semibold"
                />
              </div>

              {/* Category Selector */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Category</Label>
                <Select value={newCategory} onValueChange={(v) => v && setNewCategory(v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(newType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Date</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Recurring Toggle */}
              <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                <span className="text-xs text-muted-foreground">Monthly Recurring</span>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
              </div>

              <Button onClick={addItem} className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
                Add to Budget
              </Button>
            </CardContent>
          </Card>

          {/* Category Breakdown Progress */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Expense Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expensesByCategory.map(([cat, amt]) => {
                const pct = stats.totalExpense > 0 ? (amt / stats.totalExpense) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="truncate max-w-[180px]">{cat}</span>
                      <span>{formatAmt(amt)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {expensesByCategory.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No expenses recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Ledger Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Transaction Ledger</CardTitle>
                <CardDescription className="text-xs">
                  {items.length} total entries recorded locally
                </CardDescription>
              </div>
              {items.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-muted-foreground hover:text-destructive">
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl border-border/60">
                  <Wallet className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs font-medium text-muted-foreground mb-1">No transactions in your budget</p>
                  <p className="text-[11px] text-muted-foreground/60 mb-3">Load a sample profile above or add your first transaction</p>
                  <Button size="sm" variant="outline" onClick={() => loadProfile("tech_pro")} className="h-7 text-xs">
                    Load Sample Profile
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b text-muted-foreground font-semibold">
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/40 transition-colors group">
                          <td className="py-2.5 px-3 font-medium text-foreground flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full shrink-0 ${item.type === "income" ? "bg-emerald-500" : "bg-rose-500"}`}
                            />
                            <span className="truncate max-w-[200px]">{item.name}</span>
                            {item.isRecurring && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 text-muted-foreground">
                                Recur
                              </Badge>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">{item.category}</td>
                          <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{item.date}</td>
                          <td
                            className={`py-2.5 px-3 text-right font-semibold whitespace-nowrap ${
                              item.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {item.type === "income" ? "+" : "-"}
                            {formatAmt(item.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-40 group-hover:opacity-100 transition-opacity"
                              title="Delete entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}