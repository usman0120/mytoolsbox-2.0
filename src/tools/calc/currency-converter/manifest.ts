import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.currency-converter",
  "space": "calc",
  "category": "finance",
  "slug": "currency-converter",
  "name": "Currency Converter",
  "tagline": "Convert currencies with live rates.",
  "keywords": [
    "currency converter",
    "exchange rate",
    "forex",
    "money converter"
  ],
  "synonyms": [
    "exchange rate",
    "forex",
    "money converter"
  ],
  "jobs": [
    "170+ currencies",
    "live rates",
    "swap currencies"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Currency Converter – Live Exchange Rates",
    "description": "Convert between 170+ world currencies with up-to-date exchange rates and a quick swap button. Free, private, no sign-up. Works on any device.",
    "h1": "Currency Converter"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Currency Converter runs in your browser, so your files and text stay on your device."
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
    "calc.unit-converter",
    "calc.percentage-calculator",
    "calc.break-even-calculator",
    "calc.budget-planner"
  ],
  "legacySlugs": [
    "currency-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
