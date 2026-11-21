import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.salary-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "salary-calculator",
  "name": "Salary Calculator",
  "tagline": "Calculate take-home pay.",
  "keywords": [
    "salary calculator",
    "take home pay",
    "net salary",
    "paycheck calculator",
    "gross to net"
  ],
  "synonyms": [
    "take home pay",
    "net salary",
    "paycheck calculator"
  ],
  "jobs": [
    "gross to net",
    "federal tax",
    "state tax"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Salary Calculator – Calculate Take-Home Pay",
    "description": "Convert gross salary to net take-home pay with federal tax, state tax, and FICA deductions. online calculator. Free, private, no sign-up. Runs in your browser.",
    "h1": "Salary Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Salary Calculator runs in your browser, so your files and text stay on your device."
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
    "calc.tax-calculator",
    "calc.loan-calculator",
    "calc.profit-calculator",
    "calc.break-even-calculator"
  ],
  "legacySlugs": [
    "salary-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
