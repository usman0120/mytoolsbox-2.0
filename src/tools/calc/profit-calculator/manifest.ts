import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.profit-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "profit-calculator",
  "name": "Profit Calculator",
  "tagline": "Calculate business profit & margins.",
  "keywords": [
    "profit calculator",
    "profit margin",
    "gross profit",
    "net profit",
    "business calculator"
  ],
  "synonyms": [
    "profit margin",
    "gross profit",
    "net profit"
  ],
  "jobs": [
    "gross profit",
    "net profit",
    "gross margin"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Profit Calculator – Calculate Business Profit & Margins",
    "description": "Calculate gross profit, net profit, and profit margins from revenue and costs. online business calculator. Free, private, no sign-up. Runs in your browser.",
    "h1": "Profit Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Profit Calculator runs in your browser, so your files and text stay on your device."
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
    "calc.margin-calculator",
    "calc.break-even-calculator",
    "calc.roi-calculator",
    "calc.budget-planner"
  ],
  "legacySlugs": [
    "profit-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
