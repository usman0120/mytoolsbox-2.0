import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "ai.nutrition-guide",
  "space": "ai",
  "category": "everyday",
  "slug": "nutrition-guide",
  "name": "AI Nutrition & Meal Planner",
  "tagline": "7-day meal blueprints, aisle-sorted grocery lists & AI nutritionist.",
  "keywords": [
    "nutrition ai",
    "meal planner",
    "grocery checklist",
    "macro analyzer",
    "high protein meal plan",
    "diet generator",
    "ai dietitian"
  ],
  "synonyms": [
    "meal planner",
    "grocery checklist",
    "macro analyzer"
  ],
  "jobs": [
    "7-day tailored meal plan generator (high-protein, mediterranean, balanced, vegan, keto)",
    "granular macro breakdown per meal (calories, protein, carbs, fats)",
    "step-by-step cooking instructions and prep time estimates"
  ],
  "template": "ai",
  "input": [],
  "output": [
    {
      "type": "text",
      "accept": [
        "text/plain"
      ]
    }
  ],
  "engine": "ai",
  "aiTask": "general",
  "seo": {
    "title": "AI Nutrition & Meal Planner – 7-Day Diets & Smart Grocery",
    "description": "Plan meals for a week, build a grocery list and learn the basics of balanced eating with AI. Educational, not medical advice. Free daily AI allowance.",
    "h1": "AI Nutrition & Meal Planner"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "What dietary protocols are supported?",
      "a": "High-Protein athlete, Balanced macro ratio, Mediterranean longevity, Plant-Based / Vegan, and Low-Carb Ketogenic diets are all fully supported."
    },
    {
      "q": "How does the automated grocery list work?",
      "a": "The platform scans your active 7-day meal plan, combines recurring ingredients across meals, and sorts them into supermarket aisles (Produce, Meat, Dairy, Pantry, Spices) with an interactive checklist."
    },
    {
      "q": "Does it work without an account?",
      "a": "Yes, you can generate 7-day meal blueprints, analyze recipes, and manage grocery lists locally without registration."
    },
    {
      "q": "Where is my text sent?",
      "a": "AI Nutrition & Meal Planner sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
    }
  ],
  "related": [
    "ai.fitness-coach",
    "calc.budget-planner",
    "work.habit-tracker",
    "ai.chat"
  ],
  "legacySlugs": [
    "nutrition-ai"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
