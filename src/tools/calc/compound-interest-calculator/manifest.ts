import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.compound-interest-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "compound-interest-calculator",
  "name": "Compound Interest Calculator",
  "tagline": "See how savings grow with interest and monthly contributions.",
  "keywords": [
    "compound interest calculator",
    "savings calculator",
    "investment growth",
    "future value calculator",
    "interest on interest"
  ],
  "synonyms": [
    "savings calculator",
    "investment growth",
    "future value calculator"
  ],
  "jobs": [
    "compound interest calculator",
    "savings calculator",
    "investment growth"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Compound Interest Calculator – Savings Growth by Year",
    "description": "See how money grows with compound interest and regular monthly contributions, with a year-by-year chart and the effective annual rate. Free and private.",
    "h1": "Compound Interest Calculator"
  },
  "howTo": [
    "Enter the starting amount and how much you add each month.",
    "Set the annual rate, number of years and how often interest compounds.",
    "Read the final balance and see contributions versus interest on the chart."
  ],
  "faq": [
    {
      "q": "What is compound interest?",
      "a": "Interest earned on both your deposits and the interest already added, so growth speeds up over time."
    },
    {
      "q": "Does compounding frequency matter much?",
      "a": "A little. Monthly compounding earns slightly more than yearly at the same rate; the effective annual rate shows the difference."
    },
    {
      "q": "Are inflation and taxes included?",
      "a": "No. To see real growth, subtract the inflation rate from the interest rate."
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
    "calc.sip-calculator",
    "calc.roi-calculator",
    "calc.mortgage-calculator",
    "calc.budget-planner"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
