import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.discount-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "discount-calculator",
  "name": "Discount Calculator",
  "tagline": "Sale price and savings, including stacked discounts and sales tax.",
  "keywords": [
    "discount calculator",
    "sale price calculator",
    "percent off calculator",
    "price after discount",
    "double discount"
  ],
  "synonyms": [
    "sale price calculator",
    "percent off calculator",
    "price after discount"
  ],
  "jobs": [
    "discount calculator",
    "sale price calculator",
    "percent off calculator"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Discount Calculator – Sale Price, Savings and Tax",
    "description": "Find the sale price and how much you save after a percentage discount, including a second stacked discount and sales tax. Instant, free, no sign-up needed.",
    "h1": "Discount Calculator"
  },
  "howTo": [
    "Enter the original price and the discount percentage.",
    "Add an extra discount or sales tax if they apply.",
    "See the final price and your total saving."
  ],
  "faq": [
    {
      "q": "Are two discounts the same as adding them?",
      "a": "No. 20% off then 10% off is 28% off, not 30%, because the second discount applies to the already reduced price."
    },
    {
      "q": "Is tax added before or after the discount?",
      "a": "After. Sales tax is charged on the discounted price."
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
    "calc.percentage-calculator",
    "calc.margin-calculator",
    "calc.profit-calculator",
    "calc.tax-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
