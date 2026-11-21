import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.roi-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "roi-calculator",
  "name": "ROI Calculator",
  "tagline": "Calculate return on investment.",
  "keywords": [
    "roi calculator",
    "return on investment",
    "investment calculator",
    "annualized return"
  ],
  "synonyms": [
    "return on investment",
    "investment calculator",
    "annualized return"
  ],
  "jobs": [
    "total roi",
    "annualized roi",
    "net return"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "ROI Calculator – Calculate Return on Investment",
    "description": "Calculate return on investment (ROI) and annualized returns. online ROI calculator for business and personal investments. Free, private, no sign-up.",
    "h1": "ROI Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. ROI Calculator runs in your browser, so your files and text stay on your device."
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
    "calc.margin-calculator",
    "calc.budget-planner"
  ],
  "legacySlugs": [
    "roi-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
