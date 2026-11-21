import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.budget-planner",
  "space": "calc",
  "category": "finance",
  "slug": "budget-planner",
  "name": "Budget Planner",
  "tagline": "Visual budget & expense tracker.",
  "keywords": [
    "budget planner",
    "expense tracker",
    "money manager",
    "budgeting tool",
    "finance tracker"
  ],
  "synonyms": [
    "expense tracker",
    "money manager",
    "budgeting tool"
  ],
  "jobs": [
    "income/expense tracking",
    "category budgets",
    "pie charts"
  ],
  "template": "editor",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Budget Planner – Track Expenses & Income",
    "description": "Track income and expenses with visual charts. Set budgets, categorize spending, and export reports. Free, private, no sign-up. Runs in your browser.",
    "h1": "Budget Planner"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "Is my financial data stored online?",
      "a": "No. All data is stored locally in your browser. Nothing is uploaded to any server."
    },
    {
      "q": "Can I export my budget?",
      "a": "Yes! Export your transactions and summaries as CSV for use in spreadsheet applications."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Budget Planner runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "calc.percentage-calculator",
    "calc.loan-calculator",
    "calc.break-even-calculator",
    "calc.currency-converter"
  ],
  "legacySlugs": [
    "budget-planner"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
