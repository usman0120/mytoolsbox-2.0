import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.land-area-converter",
  "space": "calc",
  "category": "agriculture",
  "slug": "land-area-converter",
  "name": "Land Area Converter",
  "tagline": "Convert marla, kanal, acre, hectare, square feet and metres.",
  "keywords": [
    "marla to square feet",
    "kanal to marla",
    "acre to kanal",
    "land area converter",
    "hectare to acre"
  ],
  "synonyms": [
    "kanal to marla",
    "acre to kanal",
    "land area converter"
  ],
  "jobs": [
    "marla to square feet",
    "kanal to marla",
    "acre to kanal"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Land Area Converter – Marla, Kanal, Acre, Hectare",
    "description": "Convert land area between marla, kanal, acre, hectare, murabba, square feet, square yards and square metres, with both 272.25 and 225 sq ft marla. Free.",
    "h1": "Land Area Converter"
  },
  "howTo": [
    "Enter the area.",
    "Choose its unit.",
    "Read it in every other unit."
  ],
  "faq": [
    {
      "q": "How many square feet is one marla?",
      "a": "272.25 sq ft in revenue records (1 acre = 160 marla). Many housing societies use 225 sq ft. Check your documents."
    },
    {
      "q": "How many kanal are in an acre?",
      "a": "8 kanal, which is 160 marla."
    },
    {
      "q": "Can I share or save the result?",
      "a": "Yes. Copy link opens the calculator with the same numbers. Signed-in users can save results to their Workspace."
    },
    {
      "q": "Is it free?",
      "a": "Yes. No sign-up, no limits, and the calculation runs in your browser."
    }
  ],
  "related": [
    "calc.fertilizer-calculator",
    "calc.unit-converter",
    "calc.concrete-calculator",
    "calc.percentage-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
