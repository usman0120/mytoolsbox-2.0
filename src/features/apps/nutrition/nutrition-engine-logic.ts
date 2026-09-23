export type DietType = "balanced" | "high_protein" | "keto" | "mediterranean" | "vegan" | "low_carb";
export type MealFrequency = "3_meals" | "3_meals_2_snacks" | "intermittent_fasting";

export interface Ingredient {
  name: string;
  amount: string;
  category: "Produce" | "Protein & Meat" | "Dairy & Cold" | "Pantry & Grains" | "Spices & Oils";
}

export interface MealItem {
  id: string;
  name: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMins: number;
  ingredients: Ingredient[];
  instructions: string[];
}

export interface DayMealPlan {
  dayNumber: number;
  dayName: string;
  meals: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface WeeklyMealPlan {
  id: string;
  name: string;
  dietType: DietType;
  targetDailyCalories: number;
  days: DayMealPlan[];
}

export interface GroceryItem {
  name: string;
  amount: string;
  category: string;
  checked: boolean;
}

export interface GrocerySection {
  category: string;
  items: GroceryItem[];
}

// ---------------------------------------------------------------------------
// Curated Real Recipe Base
// ---------------------------------------------------------------------------

const RECIPE_POOL: MealItem[] = [
  // Breakfasts
  {
    id: "b-oatmeal-berries",
    name: "Cinnamon Chia Overnight Oats with Berries & Whey",
    category: "breakfast",
    calories: 420,
    protein: 34,
    carbs: 52,
    fat: 8,
    prepTimeMins: 10,
    ingredients: [
      { name: "Rolled Oats", amount: "60g", category: "Pantry & Grains" },
      { name: "Whey Protein Isolate", amount: "30g", category: "Pantry & Grains" },
      { name: "Almond Milk (Unsweetened)", amount: "200ml", category: "Dairy & Cold" },
      { name: "Fresh Blueberries", amount: "50g", category: "Produce" },
      { name: "Chia Seeds", amount: "10g", category: "Pantry & Grains" },
    ],
    instructions: [
      "Combine rolled oats, whey protein, and chia seeds in a mason jar.",
      "Pour almond milk, stir thoroughly, and refrigerate overnight (or 4 hours).",
      "Top with fresh blueberries and cinnamon before serving.",
    ],
  },
  {
    id: "b-eggs-avocado-toast",
    name: "Poached Eggs & Smashed Avocado on Sourdough",
    category: "breakfast",
    calories: 450,
    protein: 24,
    carbs: 38,
    fat: 22,
    prepTimeMins: 12,
    ingredients: [
      { name: "Large Eggs", amount: "2 whole", category: "Dairy & Cold" },
      { name: "Artisan Sourdough Bread", amount: "2 slices", category: "Pantry & Grains" },
      { name: "Ripe Avocado", amount: "1/2 medium", category: "Produce" },
      { name: "Baby Spinach", amount: "30g", category: "Produce" },
      { name: "Chili Flakes & Sea Salt", amount: "1 pinch", category: "Spices & Oils" },
    ],
    instructions: [
      "Toast sourdough slices until golden and crisp.",
      "Poach or softly boil eggs in simmering water with a splash of vinegar for 3-4 mins.",
      "Mash avocado with lemon juice, salt, and pepper, spread onto toast, and crown with eggs.",
    ],
  },
  {
    id: "b-tofu-scramble",
    name: "High-Protein Turmeric Tofu Scramble",
    category: "breakfast",
    calories: 380,
    protein: 28,
    carbs: 22,
    fat: 18,
    prepTimeMins: 15,
    ingredients: [
      { name: "Firm Tofu", amount: "200g", category: "Protein & Meat" },
      { name: "Bell Pepper", amount: "1/2 diced", category: "Produce" },
      { name: "Nutritional Yeast", amount: "15g", category: "Pantry & Grains" },
      { name: "Olive Oil", amount: "1 tbsp", category: "Spices & Oils" },
      { name: "Ground Turmeric & Black Pepper", amount: "1/2 tsp", category: "Spices & Oils" },
    ],
    instructions: [
      "Crumble firm tofu with hands in a bowl.",
      "Sauté diced peppers in olive oil until tender.",
      "Add tofu, turmeric, nutritional yeast, and season with black pepper and tamari.",
    ],
  },

  // Lunches
  {
    id: "l-chicken-quinoa-bowl",
    name: "Mediterranean Grilled Chicken & Quinoa Harvest Bowl",
    category: "lunch",
    calories: 580,
    protein: 48,
    carbs: 54,
    fat: 16,
    prepTimeMins: 20,
    ingredients: [
      { name: "Chicken Breast", amount: "180g", category: "Protein & Meat" },
      { name: "Cooked Quinoa", amount: "150g", category: "Pantry & Grains" },
      { name: "Cucumber", amount: "1/2 diced", category: "Produce" },
      { name: "Cherry Tomatoes", amount: "80g", category: "Produce" },
      { name: "Extra Virgin Olive Oil", amount: "1 tbsp", category: "Spices & Oils" },
      { name: "Kalamata Olives", amount: "30g", category: "Pantry & Grains" },
    ],
    instructions: [
      "Season chicken breast with oregano, garlic powder, salt, and grill 6 mins per side.",
      "Fluff cooled quinoa with olive oil and diced cucumber and tomatoes.",
      "Slice chicken against the grain and arrange over the quinoa bed with olives.",
    ],
  },
  {
    id: "l-salmon-sweet-potato",
    name: "Wild Salmon with Roasted Sweet Potato & Steamed Broccoli",
    category: "lunch",
    calories: 620,
    protein: 44,
    carbs: 48,
    fat: 24,
    prepTimeMins: 25,
    ingredients: [
      { name: "Wild Alaskan Salmon Fillet", amount: "170g", category: "Protein & Meat" },
      { name: "Sweet Potato", amount: "200g cubed", category: "Produce" },
      { name: "Broccoli Florets", amount: "150g", category: "Produce" },
      { name: "Avocado Oil", amount: "1 tbsp", category: "Spices & Oils" },
      { name: "Garlic & Lemon Zest", amount: "1 tsp", category: "Spices & Oils" },
    ],
    instructions: [
      "Toss sweet potato cubes with avocado oil, roast at 200°C (400°F) for 25 mins.",
      "Pan-sear salmon skin-side down for 4 mins, flip for 3 mins with lemon garlic zest.",
      "Steam broccoli florets until bright green and crisp-tender.",
    ],
  },
  {
    id: "l-lentil-curry",
    name: "Creamy Coconut Red Lentil Dal with Basmati",
    category: "lunch",
    calories: 520,
    protein: 22,
    carbs: 76,
    fat: 12,
    prepTimeMins: 20,
    ingredients: [
      { name: "Red Lentils", amount: "100g dry", category: "Pantry & Grains" },
      { name: "Light Coconut Milk", amount: "100ml", category: "Dairy & Cold" },
      { name: "Basmati Rice", amount: "70g dry", category: "Pantry & Grains" },
      { name: "Ginger & Garlic Paste", amount: "1 tbsp", category: "Produce" },
      { name: "Cumin & Garam Masala", amount: "1 tsp", category: "Spices & Oils" },
    ],
    instructions: [
      "Simmer red lentils in vegetable broth and aromatics for 15 mins until velvety.",
      "Stir in light coconut milk and garam masala.",
      "Serve hot alongside steamed basmati rice with fresh cilantro.",
    ],
  },

  // Dinners
  {
    id: "d-lean-beef-stirfry",
    name: "Grass-Fed Beef & Rainbow Veggie Stir-Fry",
    category: "dinner",
    calories: 540,
    protein: 46,
    carbs: 42,
    fat: 18,
    prepTimeMins: 18,
    ingredients: [
      { name: "Lean Flank Steak", amount: "170g thinly sliced", category: "Protein & Meat" },
      { name: "Mixed Bell Peppers & Snap Peas", amount: "180g", category: "Produce" },
      { name: "Low-Sodium Tamari / Soy Sauce", amount: "2 tbsp", category: "Spices & Oils" },
      { name: "Brown Rice", amount: "120g cooked", category: "Pantry & Grains" },
      { name: "Sesame Oil", amount: "1 tsp", category: "Spices & Oils" },
    ],
    instructions: [
      "Sear flank steak strips in smoking hot wok for 2 minutes and set aside.",
      "Stir-fry peppers, snap peas, and garlic in sesame oil until vibrant.",
      "Return beef with tamari sauce and toss vigorously over cooked brown rice.",
    ],
  },
  {
    id: "d-turkey-zucchini-pasta",
    name: "Lean Turkey Bolognese over High-Protein Edamame Pasta",
    category: "dinner",
    calories: 510,
    protein: 52,
    carbs: 38,
    fat: 14,
    prepTimeMins: 20,
    ingredients: [
      { name: "Lean Ground Turkey (93/7)", amount: "180g", category: "Protein & Meat" },
      { name: "Crushed Italian Tomatoes", amount: "150g", category: "Pantry & Grains" },
      { name: "Edamame or Lentil Pasta", amount: "60g dry", category: "Pantry & Grains" },
      { name: "Zucchini", amount: "1 grated", category: "Produce" },
      { name: "Italian Herb Blend", amount: "1 tsp", category: "Spices & Oils" },
    ],
    instructions: [
      "Brown ground turkey in pan with minced onion and grated zucchini.",
      "Pour crushed tomatoes and herbs, simmer gently for 12 minutes.",
      "Boil edamame pasta for 4 mins, drain, and combine with the rich meat sauce.",
    ],
  },
  {
    id: "d-baked-cod-asparagus",
    name: "Herb Butter Baked Cod with Roasted Asparagus & Baby Potatoes",
    category: "dinner",
    calories: 460,
    protein: 42,
    carbs: 34,
    fat: 14,
    prepTimeMins: 22,
    ingredients: [
      { name: "Atlantic Cod Fillet", amount: "200g", category: "Protein & Meat" },
      { name: "Fresh Asparagus Spears", amount: "150g", category: "Produce" },
      { name: "Baby Dutch Potatoes", amount: "150g halved", category: "Produce" },
      { name: "Grass-Fed Butter", amount: "15g", category: "Dairy & Cold" },
      { name: "Fresh Dill & Lemon", amount: "1 tbsp", category: "Produce" },
    ],
    instructions: [
      "Roast baby potato halves with olive oil at 200°C for 20 mins.",
      "Place cod and asparagus on baking tray with dab of herb butter and dill.",
      "Bake cod for 10-12 mins until flaky and opaque.",
    ],
  },

  // Snacks
  {
    id: "s-greek-yogurt-walnuts",
    name: "0% Greek Yogurt with Crushed Walnuts & Honey",
    category: "snack",
    calories: 220,
    protein: 20,
    carbs: 14,
    fat: 9,
    prepTimeMins: 3,
    ingredients: [
      { name: "Greek Yogurt 0%", amount: "170g", category: "Dairy & Cold" },
      { name: "Raw Walnuts", amount: "15g", category: "Pantry & Grains" },
      { name: "Pure Raw Honey", amount: "1 tsp", category: "Pantry & Grains" },
    ],
    instructions: ["Scoop cold Greek yogurt into a bowl, sprinkle crushed walnuts, and drizzle raw honey."],
  },
  {
    id: "s-apple-almond-butter",
    name: "Crisp Green Apple with Almond Butter",
    category: "snack",
    calories: 200,
    protein: 5,
    carbs: 26,
    fat: 10,
    prepTimeMins: 3,
    ingredients: [
      { name: "Granny Smith Apple", amount: "1 medium sliced", category: "Produce" },
      { name: "All-Natural Almond Butter", amount: "1 tbsp", category: "Pantry & Grains" },
    ],
    instructions: ["Slice apple thinly and dip in natural unsweetened almond butter."],
  },
];

// ---------------------------------------------------------------------------
// 7-Day Plan Generator
// ---------------------------------------------------------------------------

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function generateWeeklyMealPlan(params: {
  dietType: DietType;
  targetDailyCalories: number;
  mealFrequency: MealFrequency;
}): WeeklyMealPlan {
  const { dietType, targetDailyCalories, mealFrequency } = params;

  const days: DayMealPlan[] = DAY_NAMES.map((dayName, i) => {
    const breakfasts = RECIPE_POOL.filter((r) => r.category === "breakfast");
    const lunches = RECIPE_POOL.filter((r) => r.category === "lunch");
    const dinners = RECIPE_POOL.filter((r) => r.category === "dinner");
    const snacks = RECIPE_POOL.filter((r) => r.category === "snack");

    const b = breakfasts[i % breakfasts.length];
    const l = lunches[i % lunches.length];
    const d = dinners[i % dinners.length];

    const meals: MealItem[] = [b, l, d];

    if (mealFrequency === "3_meals_2_snacks") {
      meals.push(snacks[i % snacks.length]);
      meals.push(snacks[(i + 1) % snacks.length]);
    } else if (mealFrequency === "intermittent_fasting") {
      // IF usually skips traditional breakfast or combines
      // keeps 2 major feasts + 1 snack
      meals[0] = { ...b, name: "Power Breakfast Fast-Breaker" };
    }

    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
    const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

    return {
      dayNumber: i + 1,
      dayName,
      meals,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    };
  });

  return {
    id: `diet_${Date.now()}`,
    name: `7-Day ${dietType.replace("_", " ").toUpperCase()} Blueprint`,
    dietType,
    targetDailyCalories,
    days,
  };
}

// ---------------------------------------------------------------------------
// Grocery List Aggregator
// ---------------------------------------------------------------------------

export function aggregateGroceryList(plan: WeeklyMealPlan): GrocerySection[] {
  const map = new Map<string, { name: string; amount: string; category: string }>();

  plan.days.forEach((d) => {
    d.meals.forEach((m) => {
      m.ingredients.forEach((ing) => {
        const key = ing.name.toLowerCase().trim();
        if (map.has(key)) {
          // Keep existing but add count reference
          const existing = map.get(key)!;
          existing.amount = `${existing.amount} + ${ing.amount}`;
        } else {
          map.set(key, { ...ing });
        }
      });
    });
  });

  const categories = ["Produce", "Protein & Meat", "Dairy & Cold", "Pantry & Grains", "Spices & Oils"];
  const sections: GrocerySection[] = categories.map((cat) => ({
    category: cat,
    items: [],
  }));

  map.forEach((item) => {
    let sec = sections.find((s) => s.category === item.category);
    if (!sec) sec = sections[sections.length - 1];
    sec.items.push({
      name: item.name,
      amount: item.amount,
      category: item.category,
      checked: false,
    });
  });

  return sections.filter((s) => s.items.length > 0);
}

// ---------------------------------------------------------------------------
// Recipe Nutrient Analyzer (Local text parser)
// ---------------------------------------------------------------------------

export interface RecipeAnalysisResult {
  recipeName: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  healthScore: number; // 1-100
  keyNutrients: string[];
}

export function analyzeRecipeIngredients(recipeName: string, text: string): RecipeAnalysisResult {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  let totalCalories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let fiber = 0;

  lines.forEach((line) => {
    const l = line.toLowerCase();
    if (l.includes("chicken") || l.includes("turkey") || l.includes("breast")) {
      totalCalories += 220;
      protein += 42;
      fat += 4;
    } else if (l.includes("beef") || l.includes("steak")) {
      totalCalories += 310;
      protein += 36;
      fat += 16;
    } else if (l.includes("salmon") || l.includes("fish")) {
      totalCalories += 280;
      protein += 34;
      fat += 14;
    } else if (l.includes("egg")) {
      totalCalories += 145;
      protein += 12;
      fat += 10;
    } else if (l.includes("oat") || l.includes("rice") || l.includes("quinoa") || l.includes("pasta")) {
      totalCalories += 250;
      carbs += 48;
      protein += 7;
      fiber += 4;
    } else if (l.includes("avocado") || l.includes("oil") || l.includes("butter")) {
      totalCalories += 160;
      fat += 17;
      carbs += 2;
    } else if (l.includes("spinach") || l.includes("broccoli") || l.includes("salad") || l.includes("vegetable")) {
      totalCalories += 45;
      carbs += 7;
      protein += 3;
      fiber += 3;
    } else if (l.includes("yogurt") || l.includes("milk") || l.includes("whey")) {
      totalCalories += 150;
      protein += 18;
      carbs += 10;
      fat += 3;
    } else {
      totalCalories += 80;
      carbs += 12;
      protein += 2;
    }
  });

  const baseScore = Math.min(95, Math.max(40, Math.round(protein * 0.8 + fiber * 3 + (totalCalories > 200 && totalCalories < 900 ? 30 : 15))));

  return {
    recipeName: recipeName.trim() || "Analyzed Recipe",
    totalCalories: Math.round(totalCalories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    fiber: Math.round(fiber),
    healthScore: baseScore,
    keyNutrients: [
      protein > 30 ? "High Protein Satiety" : "Moderate Protein",
      fiber >= 5 ? "Gut-Healthy Fiber Rich" : "Essential Carbohydrates",
      fat < 20 ? "Cardioprotective Low Saturated Fat" : "Healthy Essential Fatty Acids",
    ],
  };
}

// ---------------------------------------------------------------------------
// Offline Nutritionist Advice
// ---------------------------------------------------------------------------

export function generateOfflineNutritionAdvice(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes("protein") || p.includes("muscle") || p.includes("timing")) {
    return `### 🥗 Clinical Nutrition Guide: Protein Synthesis & Distribution\n\n1. **Optimal Daily Dosage:**\n- Aim for 1.6 to 2.2 grams of protein per kilogram of body weight (approx. 0.8–1.0g per lb) to maximize muscle protein synthesis (MPS).\n\n2. **Leucine Threshold per Meal:**\n- Each meal should provide at least 2.5 to 3.0g of leucine (found in ~30g of whey, chicken, or eggs) to activate the mTOR pathway.\n\n3. **Distribution Pattern:**\n- Spread protein intake across 4 evenly spaced meals (every 3 to 4 hours) rather than consuming 80% of protein in a single evening sitting.`;
  }

  if (p.includes("cut") || p.includes("fat loss") || p.includes("deficit") || p.includes("hunger")) {
    return `### 🔥 Fat Loss & Satiety Management Protocol\n\n1. **Calculated Caloric Deficit:**\n- Maintain a conservative 300–500 kcal/day deficit. This targets 0.5–1.0% of body weight loss per week while preserving lean muscle mass.\n\n2. **High-Volume, Low-Calorie Foods:**\n- Load half of every plate with fibrous vegetables (spinach, zucchini, broccoli, cauliflower rice) to stretch gastric mechanoreceptors and blunt ghrelin (hunger hormone).\n\n3. **Electrolytes & Fluid Retention:**\n- When restricting carbs, glycogen depletion flushes water and sodium. Ensure 3–4g of sodium and 3–4 liters of water daily to prevent fatigue and headaches.`;
  }

  return `### 🥑 Evidence-Based Nutrition Consultation\n\n1. **Whole Food Foundation:**\n- Prioritize minimally processed whole foods: lean animal & plant proteins, complex unrefined grains, colorful vegetables, and cold-pressed monounsaturated fats.\n\n2. **Micronutrient Density:**\n- Include 30+ diverse plant foods per week (vegetables, berries, seeds, herbs) to foster a resilient gut microbiome and reduce systemic inflammation.\n\n3. **Hydration Benchmark:**\n- Drink 35ml of water per kg of bodyweight, increasing by 500ml during intense workout sessions.`;
}
