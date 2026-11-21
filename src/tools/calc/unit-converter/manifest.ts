import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.unit-converter",
  "space": "calc",
  "category": "units",
  "slug": "unit-converter",
  "name": "Unit Converter",
  "tagline": "Convert between units.",
  "keywords": [
    "unit converter",
    "convert units",
    "length converter",
    "weight converter"
  ],
  "synonyms": [
    "convert units",
    "length converter",
    "weight converter"
  ],
  "jobs": [
    "length",
    "weight",
    "temperature"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Unit Converter – Convert Length, Weight, Temperature & More",
    "description": "Convert between units of length, weight, temperature, volume, and more. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Unit Converter"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Unit Converter runs in your browser, so your files and text stay on your device."
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
    "calc.currency-converter",
    "calc.percentage-calculator",
    "calc.age-calculator",
    "calc.bmi-calculator"
  ],
  "legacySlugs": [
    "unit-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
