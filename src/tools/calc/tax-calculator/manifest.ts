import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.tax-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "tax-calculator",
  "name": "Tax Calculator",
  "tagline": "Estimate income tax.",
  "keywords": [
    "tax calculator",
    "income tax",
    "tax estimator",
    "tax brackets",
    "federal tax"
  ],
  "synonyms": [
    "income tax",
    "tax estimator",
    "tax brackets"
  ],
  "jobs": [
    "tax brackets",
    "deductions",
    "effective rate"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Tax Calculator – Estimate Income Tax Online",
    "description": "Estimate your income tax based on US federal tax brackets. Includes deductions, effective rate, and bracket breakdown. Free, private, no sign-up.",
    "h1": "Tax Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Tax Calculator runs in your browser, so your files and text stay on your device."
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
    "calc.salary-calculator",
    "calc.profit-calculator",
    "calc.loan-calculator",
    "calc.break-even-calculator"
  ],
  "legacySlugs": [
    "tax-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
