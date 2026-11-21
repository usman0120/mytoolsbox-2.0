import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.loan-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "loan-calculator",
  "name": "Loan Calculator",
  "tagline": "Calculate loan payments.",
  "keywords": [
    "loan calculator",
    "mortgage calculator",
    "emi calculator",
    "loan payment"
  ],
  "synonyms": [
    "mortgage calculator",
    "emi calculator",
    "loan payment"
  ],
  "jobs": [
    "monthly payment",
    "total interest",
    "amortization schedule"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Loan Calculator – Calculate Loan Payments Online",
    "description": "Calculate monthly loan payments, total interest, and amortization schedule. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Loan Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Loan Calculator runs in your browser, so your files and text stay on your device."
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
    "calc.break-even-calculator",
    "calc.budget-planner",
    "calc.currency-converter"
  ],
  "legacySlugs": [
    "loan-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
