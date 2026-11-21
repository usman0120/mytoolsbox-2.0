import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.percentage-calculator",
  "space": "calc",
  "category": "maths",
  "slug": "percentage-calculator",
  "name": "Percentage Calculator",
  "tagline": "Calculate percentages easily.",
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
    "title": "Percentage Calculator – Calculate Percentages Online",
    "description": "Work out a percentage of a number, percentage change, tips and discounts, with the formula shown. Free, private, no sign-up. Runs in your browser.",
    "h1": "Percentage Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Percentage Calculator runs in your browser, so your files and text stay on your device."
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
