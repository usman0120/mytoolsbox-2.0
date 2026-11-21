import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.margin-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "margin-calculator",
  "name": "Margin Calculator",
  "tagline": "Calculate profit margins & markup.",
  "keywords": [
    "margin calculator",
    "profit margin",
    "markup calculator",
    "selling price calculator"
  ],
  "synonyms": [
    "profit margin",
    "markup calculator",
    "selling price calculator"
  ],
  "jobs": [
    "gross margin",
    "markup %",
    "target price"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Margin Calculator – Calculate Profit Margins & Markup",
    "description": "Calculate profit margins, markup percentages, and target selling prices. online margin calculator. Free, private, no sign-up. Runs in your browser.",
    "h1": "Margin Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Margin Calculator runs in your browser, so your files and text stay on your device."
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
    "calc.profit-calculator",
    "calc.break-even-calculator",
    "calc.roi-calculator",
    "calc.budget-planner"
  ],
  "legacySlugs": [
    "margin-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
