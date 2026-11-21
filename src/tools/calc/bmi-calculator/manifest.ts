import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.bmi-calculator",
  "space": "calc",
  "category": "health",
  "slug": "bmi-calculator",
  "name": "BMI Calculator",
  "tagline": "Body Mass Index in metric or imperial units, with the WHO category.",
  "keywords": [
    "bmi calculator",
    "body mass index",
    "bmi",
    "health calculator"
  ],
  "synonyms": [
    "body mass index",
    "bmi",
    "health calculator"
  ],
  "jobs": [
    "bmi calculation",
    "health category",
    "metric & imperial"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "BMI Calculator – Body Mass Index, Metric & Imperial",
    "description": "Calculate your Body Mass Index from height and weight in metric or imperial units and see the WHO weight category. Educational, not medical advice. Free.",
    "h1": "BMI calculator"
  },
  "howTo": [
    "Choose metric or imperial units.",
    "Enter your height and weight.",
    "See your BMI and what the category means."
  ],
  "faq": [
    {
      "q": "How is BMI calculated?",
      "a": "Weight in kilograms divided by height in metres squared. In imperial units: 703 × weight (lb) ÷ height (in)²."
    },
    {
      "q": "What are the BMI categories?",
      "a": "WHO adult categories: under 18.5 underweight, 18.5–24.9 healthy, 25–29.9 overweight, 30 and above obesity."
    },
    {
      "q": "Is BMI accurate for everyone?",
      "a": "No. It doesn't separate muscle from fat and isn't designed for children, pregnancy or very muscular people. Talk to a health professional about your situation."
    },
    {
      "q": "Is my data stored?",
      "a": "No. The calculation happens in your browser."
    }
  ],
  "related": [
    "calc.percentage-calculator",
    "calc.age-calculator",
    "calc.break-even-calculator",
    "calc.budget-planner"
  ],
  "legacySlugs": [
    "bmi-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
