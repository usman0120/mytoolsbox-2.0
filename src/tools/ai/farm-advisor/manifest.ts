import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "ai.farm-advisor",
  "space": "ai",
  "category": "grow",
  "slug": "farm-advisor",
  "name": "Farm Advisor",
  "tagline": "Crop, fertilizer and pest advice from AI, plus farm calculators.",
  "keywords": [
    "farming calculator",
    "crop yield",
    "fertilizer calculator",
    "agriculture app",
    "kisan app",
    "farming ai",
    "crop disease detection",
    "irrigation calculator"
  ],
  "synonyms": [
    "crop yield",
    "fertilizer calculator",
    "agriculture app"
  ],
  "jobs": [
    "crop yield calculator",
    "fertilizer & nutrient planner",
    "land area measurement"
  ],
  "template": "ai",
  "input": [],
  "output": [],
  "engine": "ai",
  "seo": {
    "title": "Farm Advisor AI – Crop, Fertilizer & Pest Advice",
    "description": "Farming calculators for fertilizer, seed rate, yield, land and irrigation, plus an AI crop advisor. Local formulas; advice is guidance, not a guarantee.",
    "h1": "Farm Advisor"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "What calculators are included?",
      "a": "Seven calculators: Crop Yield, Fertilizer, Land Area, Yield Analysis, Irrigation, Planting Planner, and Cost/Profit with sensitivity analysis."
    },
    {
      "q": "Can I upload crop photos for disease detection?",
      "a": "Yes! The AI Crop Image Assistant can analyze photos of leaves, pests, or crop issues and provide preliminary guidance. Always confirm with a local expert for treatment decisions."
    },
    {
      "q": "Is this suitable for small farmers?",
      "a": "Absolutely! All calculators work for any farm size. The cost-profit calculator includes break-even analysis and sensitivity scenarios to help small farmers make informed decisions."
    },
    {
      "q": "Where is my text sent?",
      "a": "Farmer AI sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
    }
  ],
  "related": [
    "calc.percentage-calculator",
    "calc.unit-converter",
    "ai.math-solver",
    "ai.chat"
  ],
  "legacySlugs": [
    "farmer-ai"
  ],
  "status": "live",
  "offline": false,
  "aiTask": "general"
};

export default manifest;
