import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.bmi-calculator",
  "space": "calc",
  "category": "health",
  "slug": "bmi-calculator",
  "name": "BMI Calculator",
  "tagline": "Calculate your BMI.",
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
    "title": "BMI Calculator – Calculate Your Body Mass Index",
    "description": "Calculate your BMI. Understand your health category with metric and imperial units. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "BMI Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. BMI Calculator runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    },
    {
      "q": "Does it work on my phone?",
      "a": "Yes. It works in any modern browser on phones, tablets and computers."
    },
    {
      "q": "Does it work offline?",
      "a": "Once the page has loaded, the tool keeps working without an internet connection."
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
