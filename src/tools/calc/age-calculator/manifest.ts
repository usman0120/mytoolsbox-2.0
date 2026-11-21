import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.age-calculator",
  "space": "calc",
  "category": "date-time",
  "slug": "age-calculator",
  "name": "Age Calculator",
  "tagline": "Calculate exact age.",
  "keywords": [
    "age calculator",
    "calculate age",
    "date of birth",
    "how old am i"
  ],
  "synonyms": [
    "calculate age",
    "date of birth",
    "how old am i"
  ],
  "jobs": [
    "age in years/months/days",
    "date difference",
    "next birthday countdown"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Age Calculator – Calculate Your Exact Age",
    "description": "Calculate your exact age in years, months, and days. Also find date differences. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Age Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Age Calculator runs in your browser, so your files and text stay on your device."
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
    "calc.bmi-calculator",
    "calc.break-even-calculator",
    "calc.budget-planner"
  ],
  "legacySlugs": [
    "age-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
