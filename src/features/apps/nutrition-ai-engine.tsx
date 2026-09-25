"use client";

import { useState } from "react";
import {
  Utensils, ShoppingCart, Apple, Sparkles, Calendar, Check,
  Copy, RefreshCw, Plus, Trash2, Clock, Flame, ChevronRight,
  ShieldCheck, Info, CheckSquare, Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCredits } from "@/lib/credits/use-credits";
import {
  generateWeeklyMealPlan, aggregateGroceryList, analyzeRecipeIngredients,
  generateOfflineNutritionAdvice,
  type DietType, type MealFrequency, type WeeklyMealPlan, type GrocerySection,
  type RecipeAnalysisResult
} from "./nutrition/nutrition-engine-logic";

export function NutritionAIEngine() {
  const { refresh } = useCredits();

  // Tab State
  const [activeTab, setActiveTab] = useState<"planner" | "grocery" | "analyzer" | "consult">("planner");

  // Planner State
  const [dietType, setDietType] = useState<DietType>("high_protein");
  const [targetCalories, setTargetCalories] = useState<number>(2200);
  const [mealFreq, setMealFreq] = useState<MealFrequency>("3_meals_2_snacks");
  const [plan, setPlan] = useState<WeeklyMealPlan>(() =>
    generateWeeklyMealPlan({
      dietType: "high_protein",
      targetDailyCalories: 2200,
      mealFrequency: "3_meals_2_snacks",
    })
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Grocery State
  const [grocerySections, setGrocerySections] = useState<GrocerySection[]>(() =>
    aggregateGroceryList(plan)
  );
  const [newGroceryItem, setNewGroceryItem] = useState<string>("");
  const [newGroceryCat, setNewGroceryCat] = useState<string>("Produce");

  const handleGeneratePlan = () => {
    const newPlan = generateWeeklyMealPlan({
      dietType,
      targetDailyCalories: targetCalories,
      mealFrequency: mealFreq,
    });
    setPlan(newPlan);
    setGrocerySections(aggregateGroceryList(newPlan));
    toast.success(`Generated ${newPlan.name}!`);
  };

  const toggleGroceryItem = (catIndex: number, itemIndex: number) => {
    setGrocerySections((prev) => {
      const copy = [...prev];
      const targetSec = { ...copy[catIndex] };
      const items = [...targetSec.items];
      items[itemIndex] = { ...items[itemIndex], checked: !items[itemIndex].checked };
      targetSec.items = items;
      copy[catIndex] = targetSec;
      return copy;
    });
  };

  const addCustomGrocery = () => {
    if (!newGroceryItem.trim()) return;
    setGrocerySections((prev) => {
      const copy = [...prev];
      let sec = copy.find((s) => s.category === newGroceryCat);
      if (!sec) {
        sec = { category: newGroceryCat, items: [] };
        copy.push(sec);
      }
      sec.items.push({
        name: newGroceryItem.trim(),
        amount: "1x",
        category: newGroceryCat,
        checked: false,
      });
      return [...copy];
    });
    setNewGroceryItem("");
    toast.success("Added to grocery list");
  };

  // Recipe Analyzer State
  const [recipeName, setRecipeName] = useState<string>("High Protein Power Bowl");
  const [ingredientsText, setIngredientsText] = useState<string>(
    "200g chicken breast\n150g cooked quinoa\n1 tbsp olive oil\n100g broccoli florets\n50g avocado"
  );
  const [analysisResult, setAnalysisResult] = useState<RecipeAnalysisResult | null>(() =>
    analyzeRecipeIngredients("High Protein Power Bowl", "200g chicken breast\n150g cooked quinoa\n1 tbsp olive oil\n100g broccoli florets\n50g avocado")
  );

  const handleAnalyzeRecipe = () => {
    if (!ingredientsText.trim()) {
      toast.error("Please provide ingredients to analyze.");
      return;
    }
    const res = analyzeRecipeIngredients(recipeName, ingredientsText);
    setAnalysisResult(res);
    toast.success("Recipe nutrition analyzed!");
  };

  // AI Nutritionist Consultation State
  const [nutriPrompt, setNutriPrompt] = useState<string>("");
  const [nutriResponse, setNutriResponse] = useState<string>("");
  const [isNutriLoading, setIsNutriLoading] = useState<boolean>(false);

  const handleConsultNutritionist = async (queryText?: string) => {
    const textToAsk = queryText || nutriPrompt;
    if (!textToAsk.trim()) {
      toast.error("Please enter a question for the nutritionist.");
      return;
    }

    setIsNutriLoading(true);
    setNutriResponse("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToAsk,
          operation: "nutrition_planner",
          tier: "reasoning",
          systemPrompt:
            "You are a Registered Clinical Dietitian and Sports Nutrition Specialist. Provide precise, evidence-based nutrition science, macro adjustments, meal timing, and gut-health recommendations.",
        }),
      });

      if (!res.ok) {
        throw new Error("Live AI connection failed, using clinical knowledge base.");
      }

      const data = await res.json();
      setNutriResponse(data.text);
      refresh();
      toast.success("Nutrition advice generated!");
    } catch {
      // Graceful offline fallback
      const offline = generateOfflineNutritionAdvice(textToAsk);
      setNutriResponse(offline);
      toast.info("Generated via expert offline clinical nutrition knowledge base.");
    } finally {
      setIsNutriLoading(false);
    }
  };

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copied to clipboard!");
  };

  const currentDay = plan.days[selectedDayIndex] || plan.days[0];

  return (
    <div className="space-y-6">
      {/* Platform Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI Nutrition & Meal Planner Platform</h2>
            <p className="text-xs text-muted-foreground">7-day tailored meal blueprints, automated grocery checklists & clinical AI nutrition</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/60">
          <TabsTrigger value="planner" className="gap-2 py-2 text-xs md:text-sm">
            <Calendar className="h-4 w-4 text-emerald-500" />
            7-Day Meal Plan
          </TabsTrigger>
          <TabsTrigger value="grocery" className="gap-2 py-2 text-xs md:text-sm">
            <ShoppingCart className="h-4 w-4 text-blue-500" />
            Smart Grocery
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="gap-2 py-2 text-xs md:text-sm">
            <Apple className="h-4 w-4 text-amber-500" />
            Recipe Analyzer
          </TabsTrigger>
          <TabsTrigger value="consult" className="gap-2 py-2 text-xs md:text-sm">
            <Sparkles className="h-4 w-4 text-violet-500" />
            AI Nutritionist
          </TabsTrigger>
        </TabsList>

        {/* ==================================================================== */}
        {/* 1. 7-DAY MEAL PLAN ARCHITECT */}
        {/* ==================================================================== */}
        <TabsContent value="planner" className="space-y-6 mt-6">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Utensils className="h-5 w-5 text-emerald-500" />
                Personalized Dietary Blueprint
              </CardTitle>
              <CardDescription>
                Configure diet style, caloric targets, and daily meal distribution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Dietary Style</Label>
                  <Select value={dietType} onValueChange={(v) => setDietType((v ?? "high_protein") as DietType)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_protein">High-Protein Athlete</SelectItem>
                      <SelectItem value="balanced">Balanced Macro Ratio</SelectItem>
                      <SelectItem value="mediterranean">Mediterranean Longevity</SelectItem>
                      <SelectItem value="vegan">Plant-Based / Vegan</SelectItem>
                      <SelectItem value="low_carb">Low-Carb Ketogenic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Daily Calorie Target</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={targetCalories}
                      onChange={(e) => setTargetCalories(Number(e.target.value))}
                      className="h-9 text-xs"
                      step={50}
                    />
                    <span className="text-xs text-muted-foreground">kcal</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Meal Structure</Label>
                  <Select value={mealFreq} onValueChange={(v) => setMealFreq((v ?? "3_meals_2_snacks") as MealFrequency)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3_meals">3 Main Meals (Breakfast, Lunch, Dinner)</SelectItem>
                      <SelectItem value="3_meals_2_snacks">3 Meals + 2 Satiety Snacks</SelectItem>
                      <SelectItem value="intermittent_fasting">Intermittent Fasting (16/8 Window)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleGeneratePlan} className="w-full gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                    <RefreshCw className="h-3.5 w-3.5" /> Rebuild 7-Day Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Days Switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            {plan.days.map((d, index) => (
              <Button
                key={d.dayNumber}
                variant={selectedDayIndex === index ? "default" : "outline"}
                size="sm"
                className="text-xs h-8 px-3"
                onClick={() => setSelectedDayIndex(index)}
              >
                {d.dayName}
              </Button>
            ))}
          </div>

          {/* Day Detail Card */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {currentDay.dayName} Nutrition Overview
                </h3>
                <p className="text-xs text-muted-foreground">{currentDay.meals.length} Scheduled Meals</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  {currentDay.totalCalories} kcal
                </span>
                <span className="p-1.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                  P: {currentDay.totalProtein}g
                </span>
                <span className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold">
                  C: {currentDay.totalCarbs}g
                </span>
                <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                  F: {currentDay.totalFat}g
                </span>
              </div>
            </div>

            {/* Meals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentDay.meals.map((meal) => (
                <Card key={meal.id} className="border-border/60 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
                  <div>
                    <CardHeader className="pb-2 bg-muted/20 border-b border-border/40">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                          {meal.category}
                        </Badge>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                          <Clock className="h-3 w-3" /> {meal.prepTimeMins} min
                        </span>
                      </div>
                      <CardTitle className="text-sm font-semibold mt-1 leading-snug">{meal.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono bg-muted/40 p-1.5 rounded-md">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{meal.calories} kcal</span>
                        <span className="text-muted-foreground">P:{meal.protein}g · C:{meal.carbs}g · F:{meal.fat}g</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-muted-foreground block">Key Ingredients:</span>
                        <ul className="text-xs space-y-0.5 text-muted-foreground">
                          {meal.ingredients.map((ing, i) => (
                            <li key={i} className="flex justify-between">
                              <span>• {ing.name}</span>
                              <span className="font-mono text-[11px]">{ing.amount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-3 border-t border-border/40 bg-muted/10 text-[11px] text-muted-foreground italic">
                    {meal.instructions[0]}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ==================================================================== */}
        {/* 2. SMART GROCERY CHECKLIST */}
        {/* ==================================================================== */}
        <TabsContent value="grocery" className="space-y-6 mt-6">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                    Automated Supermarket Checklist
                  </CardTitle>
                  <CardDescription>
                    Aggregated directly from your active 7-day meal plan, sorted by store aisles.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => {
                    const txt = grocerySections
                      .map(
                        (sec) =>
                          `[${sec.category}]\n` +
                          sec.items.map((it) => `${it.checked ? "[x]" : "[ ]"} ${it.name} (${it.amount})`).join("\n")
                      )
                      .join("\n\n");
                    copyText(txt);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Grocery List
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Custom Item */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                <Input
                  placeholder="Add item (e.g. Grass-fed butter, lemons, dark chocolate)"
                  value={newGroceryItem}
                  onChange={(e) => setNewGroceryItem(e.target.value)}
                  className="h-8 text-xs flex-1 min-w-[200px]"
                  onKeyDown={(e) => e.key === "Enter" && addCustomGrocery()}
                />
                <Select value={newGroceryCat} onValueChange={(v) => setNewGroceryCat(v ?? "Produce")}>
                  <SelectTrigger className="h-8 text-xs w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Produce">Produce</SelectItem>
                    <SelectItem value="Protein & Meat">Protein & Meat</SelectItem>
                    <SelectItem value="Dairy & Cold">Dairy & Cold</SelectItem>
                    <SelectItem value="Pantry & Grains">Pantry & Grains</SelectItem>
                    <SelectItem value="Spices & Oils">Spices & Oils</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={addCustomGrocery} className="h-8 text-xs gap-1">
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>

              {/* Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grocerySections.map((sec, catIdx) => (
                  <div key={sec.category} className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <span className="font-semibold text-xs tracking-wide uppercase text-foreground">
                        {sec.category}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {sec.items.length} items
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {sec.items.map((item, itemIdx) => (
                        <div
                          key={item.name + itemIdx}
                          onClick={() => toggleGroceryItem(catIdx, itemIdx)}
                          className={`flex items-start justify-between gap-2 p-1.5 rounded cursor-pointer transition-colors text-xs ${
                            item.checked ? "line-through opacity-50 bg-muted/20" : "hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {item.checked ? (
                              <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-foreground">{item.name}</span>
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                            {item.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================================================================== */}
        {/* 3. RECIPE MACRO ANALYZER */}
        {/* ==================================================================== */}
        <TabsContent value="analyzer" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Apple className="h-5 w-5 text-amber-500" />
                  Recipe & Meal Input
                </CardTitle>
                <CardDescription>
                  Paste individual ingredients line by line to calculate precise macros and density score.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold mb-1 block">Recipe Name</Label>
                  <Input
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="e.g. Turkey Sweet Potato Skillet"
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1 block">Ingredients List (one per line)</Label>
                  <Textarea
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    rows={6}
                    className="text-xs font-mono"
                    placeholder="200g chicken breast&#10;150g sweet potato&#10;1 tbsp olive oil"
                  />
                </div>

                <Button onClick={handleAnalyzeRecipe} className="w-full text-xs gap-1.5">
                  Analyze Nutrition
                </Button>
              </CardContent>
            </Card>

            {analysisResult && (
              <Card className="border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {analysisResult.recipeName}
                      </CardTitle>
                      <CardDescription>Macro breakdown & health score.</CardDescription>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Health Score</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {analysisResult.healthScore} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Calories</span>
                      <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{analysisResult.totalCalories}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Protein</span>
                      <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">{analysisResult.protein}g</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Carbs</span>
                      <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">{analysisResult.carbs}g</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Fats</span>
                      <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{analysisResult.fat}g</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                      Nutritional Highlights
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keyNutrients.map((kn) => (
                        <Badge key={kn} variant="outline" className="text-xs py-1 px-2.5 bg-muted/40">
                          {kn}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ==================================================================== */}
        {/* 4. AI NUTRITIONIST CONSULTATION */}
        {/* ==================================================================== */}
        <TabsContent value="consult" className="space-y-6 mt-6">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    AI Clinical Dietitian & Nutritionist
                  </CardTitle>
                  <CardDescription>
                    Receive tailored guidance on macro ratios, satiety, food intolerances, and metabolic health.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  "How to distribute 160g of protein across 4 meals for maximal MPS?",
                  "Satiety strategies: Best high-volume foods during a strict deficit",
                  "What are optimal pre and post-workout carbohydrate timing strategies?",
                  "Gut microbiome: 5 simple dietary additions to reduce systemic inflammation",
                ].map((promptText) => (
                  <Button
                    key={promptText}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1 px-2.5 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setNutriPrompt(promptText);
                      handleConsultNutritionist(promptText);
                    }}
                  >
                    {promptText}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Ask the Clinical Nutritionist anything (e.g. 'Can you suggest nutrient-dense low-glycemic breakfast alternatives to eggs?')"
                  value={nutriPrompt}
                  onChange={(e) => setNutriPrompt(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                <div className="flex justify-end items-center">
                  <Button
                    onClick={() => handleConsultNutritionist()}
                    disabled={isNutriLoading}
                    className="gap-2 text-xs bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {isNutriLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Consulting Dietitian...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" /> Consult Nutritionist (20 cr)
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {nutriResponse && (
                <div className="mt-6 p-4 rounded-xl bg-card border border-border/60 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Clinical Nutrition Assessment
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => copyText(nutriResponse)}
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                  </div>
                  <div className="text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                    {nutriResponse}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
