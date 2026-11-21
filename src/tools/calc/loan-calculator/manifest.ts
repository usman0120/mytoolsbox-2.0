import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.loan-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "loan-calculator",
  "name": "Loan Calculator",
  "tagline": "Monthly payment, total interest and a full amortization schedule.",
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
    "title": "Loan Calculator – EMI, Interest & Amortization Schedule",
    "description": "Work out your monthly loan payment (EMI), total interest and payoff schedule. See how extra payments shorten the loan and export to CSV. Free, no sign-up.",
    "h1": "Loan and EMI calculator"
  },
  "howTo": [
    "Enter the loan amount, interest rate and term.",
    "Add an optional extra monthly payment.",
    "Read the payment, total interest and year-by-year schedule."
  ],
  "faq": [
    {
      "q": "How is the monthly payment calculated?",
      "a": "With the standard amortization formula: payment = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the loan amount, r the monthly rate and n the number of months."
    },
    {
      "q": "How much do extra payments save?",
      "a": "Every extra amount goes straight to the principal, so you pay less interest and finish sooner. The calculator shows the new total and payoff time."
    },
    {
      "q": "Is this the same as EMI?",
      "a": "Yes. EMI (equated monthly instalment) is the fixed monthly payment this calculator shows."
    },
    {
      "q": "Why is my bank's figure different?",
      "a": "Banks may add fees, insurance or a different compounding rule. Use this as an estimate and confirm with your lender."
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
