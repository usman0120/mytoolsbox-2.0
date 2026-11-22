import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.ideal-weight-calculator",
  "space": "calc",
  "category": "health",
  "slug": "ideal-weight-calculator",
  "name": "Ideal Weight Calculator",
  "tagline": "Healthy weight range for your height, with four classic formulas.",
  "keywords": [
    "ideal weight calculator",
    "healthy weight for height",
    "ideal body weight",
    "how much should i weigh"
  ],
  "synonyms": [
    "healthy weight for height",
    "ideal body weight",
    "how much should i weigh"
  ],
  "jobs": [
    "ideal weight calculator",
    "healthy weight for height",
    "ideal body weight"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Ideal Weight Calculator – Healthy Weight for Your Height",
    "description": "Find a healthy weight range for your height from BMI 18.5–24.9, and compare the Devine, Robinson, Miller and Hamwi ideal body weight formulas. Free, private.",
    "h1": "Ideal Weight Calculator"
  },
  "howTo": [
    "Choose sex and enter your height.",
    "Read the healthy weight range.",
    "Compare the classic ideal weight formulas."
  ],
  "faq": [
    {
      "q": "Which number should I aim for?",
      "a": "Any weight inside the healthy range. The single-number formulas were made for drug dosing and don't account for build or muscle."
    },
    {
      "q": "Does it work for children?",
      "a": "No. Children and teenagers need age-specific growth charts."
    },
    {
      "q": "Can I share or save the result?",
      "a": "Yes. Copy link opens the calculator with the same numbers. Signed-in users can save results to their Workspace."
    },
    {
      "q": "Is it free?",
      "a": "Yes. No sign-up, no limits, and the calculation runs in your browser."
    }
  ],
  "related": [
    "calc.bmi-calculator",
    "calc.body-fat-calculator",
    "calc.bmr-calculator",
    "ai.nutrition-guide"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
