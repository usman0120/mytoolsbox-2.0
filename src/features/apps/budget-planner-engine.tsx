"use client";

import { useState, useCallback, useEffect } from "react";
import { Wallet, Plus, Trash2, Edit3, Save, BarChart3, TrendingUp, TrendingDown, PieChart, DollarSign, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

const EXPENSE_CATEGORIES = ["Housing", "Food", "Transport", "Utilities", "Entertainment", "Healthcare", "Shopping", "Education", "Other"];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Business", "Other"];

const STORAGE_KEY = "mytoolsbox-budget";

function loadItems(): BudgetItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems(items: BudgetItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function BudgetPlannerEngine() {
  const [items, setItems] = useState<BudgetItem[]>(() => loadItems());
  const [activeTab, setActiveTab] = useState("overview");
  const [editingId, setEditingId] = useState<string | null>(null);

  // New item form
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newCategory, setNewCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const addItem = () => {
    if (!newName.trim() || !newAmount || parseFloat(newAmount) <= 0) return;
    setItems((prev) => [
      {
        id: Date.now().toString(),
        name: newName.trim(),
        amount: parseFloat(newAmount),
        type: newType,
        category: newCategory,
        date: newDate,
      },
      ...prev,
    ]);
    setNewName("");
    setNewAmount("");
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const totalIncome = items.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0);
  const totalExpenses = items.filter((i) => i.type === "expense").reduce((s, i) => s + i.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  // Category breakdown
  const expensesByCategory = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    amount: items.filter((i) => i.type === "expense" && i.category === cat).reduce((s, i) => s + i.amount, 0),
  })).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);

  const maxCategoryAmount = Math.max(...expensesByCategory.map((c) => c.amount), 1);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="overview" className="gap-1"><BarChart3 className="h-3.5 w-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="add" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add</TabsTrigger>
          <TabsTrigger value="history" className="gap-1"><Calendar className="h-3.5 w-3.5" /> History</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-500" />
                <p className="text-[10px] text-muted-foreground">Income</p>
                <p className="text-lg font-bold text-green-600">${totalIncome.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-3 text-center">
                <TrendingDown className="h-4 w-4 mx-auto mb-1 text-red-500" />
                <p className="text-[10px] text-muted-foreground">Expenses</p>
                <p className="text-lg font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className={`${balance >= 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
              <CardContent className="p-3 text-center">
                <Wallet className="h-4 w-4 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Balance</p>
                <p className={`text-lg font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${balance.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-3 text-center">
                <Target className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                <p className="text-[10px] text-muted-foreground">Savings Rate</p>
                <p className="text-lg font-bold text-blue-600">{savingsRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown */}
          {expensesByCategory.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-3 block">Expense Breakdown</Label>
                <div className="space-y-2">
                  {expensesByCategory.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{cat.category}</span>
                        <span className="font-mono">${cat.amount.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(cat.amount / maxCategoryAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Add */}
        <TabsContent value="add" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setNewType("income"); setNewCategory(INCOME_CATEGORIES[0]); }}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    newType === "income" ? "border-green-500 bg-green-500/10 ring-2 ring-green-500/20" : "border-border/50"
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-500" />
                  <span className="text-xs font-medium">Income</span>
                </button>
                <button
                  onClick={() => { setNewType("expense"); setNewCategory(EXPENSE_CATEGORIES[0]); }}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    newType === "expense" ? "border-red-500 bg-red-500/10 ring-2 ring-red-500/20" : "border-border/50"
                  }`}
                >
                  <TrendingDown className="h-4 w-4 mx-auto mb-1 text-red-500" />
                  <span className="text-xs font-medium">Expense</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input placeholder="e.g., Rent, Salary..." value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Amount ($)</Label>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {(newType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <Button onClick={addItem} className="gap-2 w-full" disabled={!newName.trim() || !newAmount}>
                <Plus className="h-4 w-4" /> Add {newType === "income" ? "Income" : "Expense"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-2 mt-4">
          {items.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">No entries yet</p>
                <p className="text-sm text-muted-foreground">Add income and expenses to start tracking.</p>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.type === "income" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    {item.type === "income" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                      <span className="text-[10px] text-muted-foreground">{item.date}</span>
                    </div>
                  </div>
                  <p className={`text-sm font-bold font-mono ${item.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {item.type === "income" ? "+" : "-"}${item.amount.toFixed(2)}
                  </p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}