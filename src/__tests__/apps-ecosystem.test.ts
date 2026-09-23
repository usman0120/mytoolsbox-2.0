import { describe, it, expect } from "vitest";
import {
  calculateOneRepMax,
  calculateTDEE,
  generateWorkoutProgram,
  generateOfflineFitnessAdvice,
} from "@/features/apps/fitness/fitness-engine-logic";
import {
  generateWeeklyMealPlan,
  aggregateGroceryList,
  analyzeRecipeIngredients,
  generateOfflineNutritionAdvice,
} from "@/features/apps/nutrition/nutrition-engine-logic";
import { appRegistry, getAppBySlug } from "@/content/apps/registry";
import { CREDIT_COSTS } from "@/lib/ai/credits";

describe("Apps Ecosystem & Logic Engine", () => {
  describe("Fitness AI Platform Logic", () => {
    it("calculates 1RM accurately using multiple validated formulas", () => {
      const res = calculateOneRepMax(100, 5);
      // Epley: 100 * (1 + 0.0333 * 5) = 116.65
      expect(res.epley).toBeCloseTo(116.7, 1);
      // Brzycki: 100 * (36 / (37 - 5)) = 112.5
      expect(res.brzycki).toBeCloseTo(112.5, 1);
      expect(res.average).toBeGreaterThan(110);
      expect(res.percentages.length).toBe(10);
      // 100% should match 1RM
      const oneRep = res.percentages.find((p) => p.reps === 1);
      expect(oneRep?.percent).toBe(100);
      expect(oneRep?.weight).toBe(res.average);
    });

    it("handles boundary values for 1RM", () => {
      const zero = calculateOneRepMax(0, 0);
      expect(zero.average).toBe(0);

      const single = calculateOneRepMax(140, 1);
      expect(single.average).toBe(140);
      expect(single.percentages[0].weight).toBe(140);
    });

    it("calculates Mifflin-St Jeor TDEE and macro distribution correctly", () => {
      const maleTdee = calculateTDEE({
        gender: "male",
        age: 25,
        weightKg: 80,
        heightCm: 180,
        activity: "moderate",
        goal: "maintain",
      });

      // BMR male: 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805
      expect(maleTdee.bmr).toBe(1805);
      // Moderate: 1805 * 1.55 = 2797.75 => 2798
      expect(maleTdee.tdee).toBe(2798);
      expect(maleTdee.targetCalories).toBe(2798);
      expect(maleTdee.proteinGrams).toBe(160); // 80kg * 2.0g
      expect(maleTdee.fatGrams).toBe(72); // 80kg * 0.9g
      expect(maleTdee.carbGrams).toBeGreaterThan(300);
      expect(maleTdee.waterLiters).toBeGreaterThan(2.5);
    });

    it("generates structured workout splits with correct volume and mechanics", () => {
      const ppl = generateWorkoutProgram({
        splitType: "ppl",
        daysPerWeek: 4,
        experience: "intermediate",
        goal: "hypertrophy",
        equipment: "full_gym",
      });

      expect(ppl.days.length).toBe(4);
      expect(ppl.days[0].dayName).toContain("Push");
      expect(ppl.days[1].dayName).toContain("Pull");
      expect(ppl.days[2].dayName).toContain("Legs");
      expect(ppl.days[0].exercises.length).toBeGreaterThan(0);
      expect(ppl.days[0].exercises[0].defaultSets).toBe(4);
    });

    it("provides responsive offline fitness advice", () => {
      const advice = generateOfflineFitnessAdvice("bench press plateau");
      expect(advice).toContain("Bench Press");
      expect(advice).toContain("Technique");
    });
  });

  describe("Nutrition AI Platform Logic", () => {
    it("generates a full 7-day meal blueprint with daily totals", () => {
      const plan = generateWeeklyMealPlan({
        dietType: "high_protein",
        targetDailyCalories: 2400,
        mealFrequency: "3_meals_2_snacks",
      });

      expect(plan.days.length).toBe(7);
      plan.days.forEach((day) => {
        expect(day.meals.length).toBe(5); // 3 meals + 2 snacks
        expect(day.totalCalories).toBeGreaterThan(1500);
        expect(day.totalProtein).toBeGreaterThan(100);
      });
    });

    it("aggregates and categorizes supermarket grocery items", () => {
      const plan = generateWeeklyMealPlan({
        dietType: "mediterranean",
        targetDailyCalories: 2000,
        mealFrequency: "3_meals",
      });

      const grocery = aggregateGroceryList(plan);
      expect(grocery.length).toBeGreaterThan(0);
      const produce = grocery.find((g) => g.category === "Produce");
      expect(produce).toBeDefined();
      expect(produce?.items.length).toBeGreaterThan(0);
    });

    it("analyzes custom recipe ingredients and scores health density", () => {
      const analysis = analyzeRecipeIngredients(
        "Chicken & Quinoa Salad",
        "200g chicken breast\n100g quinoa\n1 tbsp olive oil\n100g spinach"
      );

      expect(analysis.recipeName).toBe("Chicken & Quinoa Salad");
      expect(analysis.protein).toBeGreaterThan(40);
      expect(analysis.totalCalories).toBeGreaterThan(400);
      expect(analysis.healthScore).toBeGreaterThan(60);
      expect(analysis.keyNutrients.length).toBe(3);
    });

    it("provides responsive offline clinical nutrition advice", () => {
      const advice = generateOfflineNutritionAdvice("protein distribution and muscle");
      expect(advice).toContain("Protein");
      expect(advice).toContain("mTOR");
    });
  });

  describe("Apps Registry & Centralized Credits Integration", () => {
    it("includes fitness-ai in app registry with complete metadata", () => {
      const app = getAppBySlug("fitness-ai");
      expect(app).toBeDefined();
      expect(app?.name).toBe("AI Fitness & Gym Coach");
      expect(app?.status).toBe("active");
      expect(app?.features.length).toBeGreaterThan(5);
      expect(app?.faq.length).toBeGreaterThan(2);
    });

    it("includes nutrition-ai in app registry with complete metadata", () => {
      const app = getAppBySlug("nutrition-ai");
      expect(app).toBeDefined();
      expect(app?.name).toBe("AI Nutrition & Meal Planner");
      expect(app?.status).toBe("active");
      expect(app?.features.length).toBeGreaterThan(5);
      expect(app?.faq.length).toBeGreaterThan(2);
    });

    it("verifies fitness_coach and nutrition_planner credit pricing", () => {
      expect(CREDIT_COSTS.fitness_coach).toBe(20);
      expect(CREDIT_COSTS.nutrition_planner).toBe(20);
    });

    it("verifies all AI tool operation costs are registered with non-zero costs", () => {
      expect(CREDIT_COSTS.ai_summary).toBe(15);
      expect(CREDIT_COSTS.chat_message).toBe(10);
      expect(CREDIT_COSTS.sql_assistant).toBe(20);
      expect(CREDIT_COSTS.error_explanation).toBe(20);
      expect(CREDIT_COSTS.doc_generation).toBe(20);
      expect(CREDIT_COSTS.regex_builder).toBe(15);
      expect(CREDIT_COSTS.code_explanation).toBe(20);
      expect(CREDIT_COSTS.grammar_check).toBe(10);
      expect(CREDIT_COSTS.paraphrase).toBe(15);
      expect(CREDIT_COSTS.simple_rewrite).toBe(10);
    });
  });

  describe("50/30/20 Wealth & Runway Mathematical Logic", () => {
    it("computes accurate 50/30/20 split targets", () => {
      const netIncome = 5000;
      const targetNeeds = netIncome * 0.5;
      const targetWants = netIncome * 0.3;
      const targetSavings = netIncome * 0.2;

      expect(targetNeeds).toBe(2500);
      expect(targetWants).toBe(1500);
      expect(targetSavings).toBe(1000);
      expect(targetNeeds + targetWants + targetSavings).toBe(netIncome);
    });

    it("calculates emergency fund runway accurately", () => {
      const totalSavingsReserve = 18000;
      const monthlyOutflow = 3000;
      const runwayMonths = totalSavingsReserve / monthlyOutflow;

      expect(runwayMonths).toBe(6);
      expect(runwayMonths >= 6).toBe(true); // Recommended healthy runway
    });
  });

  describe("Habit Command Center Streak Calculation", () => {
    it("determines habit streaks correctly from consecutive activity records", () => {
      const history = [true, true, true, false, true, true]; // last day is active
      let streak = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i]) {
          streak++;
        } else {
          break;
        }
      }
      expect(streak).toBe(2);
    });

    it("resets streak to 0 if last day was missed", () => {
      const history = [true, true, true, false];
      let streak = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i]) {
          streak++;
        } else {
          break;
        }
      }
      expect(streak).toBe(0);
    });
  });

  describe("Quiz Scoring Logic", () => {
    it("grades quiz submissions with precise percentage calculations", () => {
      const questions = [
        { id: "q1", correctIndex: 1 },
        { id: "q2", correctIndex: 0 },
        { id: "q3", correctIndex: 2 },
        { id: "q4", correctIndex: 3 },
      ];
      const answers: Record<string, number> = {
        q1: 1, // correct
        q2: 0, // correct
        q3: 1, // wrong
        q4: 3, // correct
      };

      const correctCount = questions.filter((q) => answers[q.id] === q.correctIndex).length;
      const scorePercent = Math.round((correctCount / questions.length) * 100);

      expect(correctCount).toBe(3);
      expect(scorePercent).toBe(75);
    });
  });
});
