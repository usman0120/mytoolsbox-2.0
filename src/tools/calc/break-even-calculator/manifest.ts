import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.break-even-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "break-even-calculator",
  "name": "Break-Even Calculator",
  "tagline": "Calculate break-even point.",
  "keywords": [
    "break even calculator",
    "break even point",
    "contribution margin",
    "cost analysis"
  ],
  "synonyms": [
    "break even point",
    "contribution margin",
    "cost analysis"
  ],
  "jobs": [
    "break-even units",
    "break-even revenue",
    "contribution margin"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Break-Even Calculator – Calculate Break-Even Point",
    "description": "Calculate your break-even point in units and revenue. Includes contribution margin analysis and target profit calculations. Free, private, no sign-up.",
    "h1": "Break-Even Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Break-Even Calculator runs in your browser, so your files and text stay on your device."
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
    "calc.margin-calculator",
    "calc.roi-calculator",
    "calc.budget-planner"
  ],
  "legacySlugs": [
    "break-even-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
