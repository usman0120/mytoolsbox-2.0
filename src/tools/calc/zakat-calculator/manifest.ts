import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.zakat-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "zakat-calculator",
  "name": "Zakat Calculator",
  "tagline": "Work out zakat on cash, gold, silver and investments against the nisab.",
  "keywords": [
    "zakat calculator",
    "zakat on gold",
    "nisab",
    "calculate zakat",
    "zakat 2.5 percent"
  ],
  "synonyms": [
    "zakat on gold",
    "nisab",
    "calculate zakat"
  ],
  "jobs": [
    "zakat calculator",
    "zakat on gold",
    "nisab"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Zakat Calculator – Cash, Gold, Silver and Nisab",
    "description": "Calculate zakat at 2.5% on cash, gold, silver, investments and business stock after debts, using the gold or silver nisab and today's prices. Free, private.",
    "h1": "Zakat Calculator"
  },
  "howTo": [
    "Enter cash, gold and silver (in grams or tola) with today's price per gram.",
    "Add investments and money owed to you, and subtract debts due now.",
    "Choose the nisab standard and see whether zakat is due and how much."
  ],
  "faq": [
    {
      "q": "Which nisab should I use?",
      "a": "Many scholars recommend the silver nisab (612.36 g) because it is lower, so more people pay. Others use gold (87.48 g). Follow your scholar's guidance."
    },
    {
      "q": "Is zakat due on jewellery I wear?",
      "a": "Scholars differ. Some include all gold and silver; others exempt jewellery in regular use. Enter what your school of thought includes."
    },
    {
      "q": "What is a tola?",
      "a": "A unit used in South Asia for gold, equal to 11.664 grams."
    },
    {
      "q": "Is my information stored?",
      "a": "No. The calculation runs in your browser."
    }
  ],
  "related": [
    "calc.percentage-calculator",
    "calc.currency-converter",
    "calc.budget-planner",
    "calc.salary-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
