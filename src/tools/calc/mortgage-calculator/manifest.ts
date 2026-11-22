import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.mortgage-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "mortgage-calculator",
  "name": "Mortgage Calculator",
  "tagline": "Monthly payment, total interest and a yearly amortisation schedule.",
  "keywords": [
    "mortgage calculator",
    "home loan calculator",
    "mortgage payment",
    "amortization schedule",
    "house loan emi"
  ],
  "synonyms": [
    "home loan calculator",
    "mortgage payment",
    "amortization schedule"
  ],
  "jobs": [
    "mortgage calculator",
    "home loan calculator",
    "mortgage payment"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Mortgage Calculator – Monthly Payment and Amortization",
    "description": "Work out your monthly mortgage payment, total interest and a year-by-year amortization schedule from price, down payment, rate and term. Free, no sign-up.",
    "h1": "Mortgage Calculator"
  },
  "howTo": [
    "Enter the home price and your down payment.",
    "Add the interest rate and loan term, and optionally yearly tax and insurance.",
    "Read the monthly payment and see how each year splits into principal and interest."
  ],
  "faq": [
    {
      "q": "What does the monthly payment include?",
      "a": "Principal and interest. If you enter yearly property tax and insurance, they are spread across 12 months and added."
    },
    {
      "q": "Why is so much of the early payment interest?",
      "a": "Interest is charged on the remaining balance, which is highest at the start. As the balance falls, more of each payment goes to principal."
    },
    {
      "q": "Does it handle variable rates?",
      "a": "No. It assumes a fixed rate for the whole term. For a variable loan, try a few rates to see the range."
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
    "calc.loan-calculator",
    "calc.compound-interest-calculator",
    "calc.salary-calculator",
    "calc.budget-planner"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
