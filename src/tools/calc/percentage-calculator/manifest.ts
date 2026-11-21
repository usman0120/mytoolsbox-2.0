import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.percentage-calculator",
  "space": "calc",
  "category": "maths",
  "slug": "percentage-calculator",
  "name": "Percentage Calculator",
  "tagline": "Percent of a number, percentage change, increases, discounts and more.",
  "keywords": [
    "percentage calculator",
    "percent",
    "percentage change",
    "tip calculator"
  ],
  "synonyms": [
    "percent",
    "percentage change",
    "tip calculator"
  ],
  "jobs": [
    "basic percentage",
    "percentage change",
    "tip calculator"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Percentage Calculator – Percent Of, Change & Discount",
    "description": "Find a percentage of a number, what percent one number is of another, percentage increase or decrease, and discounts. Formula shown. Free, no sign-up.",
    "h1": "Percentage calculator"
  },
  "howTo": [
    "Pick the kind of percentage question.",
    "Enter your two numbers.",
    "Read the answer and the formula used."
  ],
  "faq": [
    {
      "q": "How do I work out a percentage of a number?",
      "a": "Multiply the number by the percentage and divide by 100. For example, 15% of 240 is 240 × 15 ÷ 100 = 36."
    },
    {
      "q": "How is percentage change calculated?",
      "a": "(New − Old) ÷ Old × 100. Going from 80 to 100 is a 25% increase; from 100 to 80 is a 20% decrease."
    },
    {
      "q": "How do I find the price after a discount?",
      "a": "Multiply the price by (100 − discount) ÷ 100. A 20% discount on 50 gives 40."
    },
    {
      "q": "Why can't I divide by zero?",
      "a": "A percentage of zero, or a change from zero, isn't defined. Enter a non-zero starting value."
    }
  ],
  "related": [
    "calc.loan-calculator",
    "calc.bmi-calculator",
    "calc.age-calculator",
    "calc.matrix-calculator"
  ],
  "legacySlugs": [
    "percentage-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
