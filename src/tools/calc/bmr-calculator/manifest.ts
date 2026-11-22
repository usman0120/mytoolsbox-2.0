import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.bmr-calculator",
  "space": "calc",
  "category": "health",
  "slug": "bmr-calculator",
  "name": "BMR and Calorie Calculator",
  "tagline": "Daily calories to maintain, lose or gain weight from your BMR and activity.",
  "keywords": [
    "bmr calculator",
    "tdee calculator",
    "calorie calculator",
    "maintenance calories",
    "calories to lose weight"
  ],
  "synonyms": [
    "tdee calculator",
    "calorie calculator",
    "maintenance calories"
  ],
  "jobs": [
    "bmr calculator",
    "tdee calculator",
    "calorie calculator"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "BMR and TDEE Calculator – Daily Calorie Needs",
    "description": "Estimate your basal metabolic rate and total daily calories with the Mifflin-St Jeor equation, plus targets to lose or gain weight. Metric or imperial units.",
    "h1": "BMR and Calorie Calculator"
  },
  "howTo": [
    "Enter sex, age, weight and height in metric or imperial units.",
    "Choose how active you are.",
    "Read your maintenance calories and the targets for losing or gaining weight."
  ],
  "faq": [
    {
      "q": "What is the difference between BMR and TDEE?",
      "a": "BMR is what your body burns at complete rest. TDEE adds daily activity and exercise, so it is the number to eat to keep your weight steady."
    },
    {
      "q": "Which formula is used?",
      "a": "Mifflin-St Jeor, which studies found to be the most accurate common equation for healthy adults."
    },
    {
      "q": "How accurate is it?",
      "a": "Within about 10% for most people. Track your weight for 2–3 weeks and adjust."
    },
    {
      "q": "Is it free?",
      "a": "Yes. No sign-up, no limits, and the calculation runs in your browser."
    }
  ],
  "related": [
    "calc.bmi-calculator",
    "calc.body-fat-calculator",
    "calc.ideal-weight-calculator",
    "ai.nutrition-guide"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
