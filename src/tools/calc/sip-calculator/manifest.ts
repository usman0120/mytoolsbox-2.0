import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.sip-calculator",
  "space": "calc",
  "category": "finance",
  "slug": "sip-calculator",
  "name": "SIP Calculator",
  "tagline": "Estimate the future value of a monthly investment plan, with optional step-up.",
  "keywords": [
    "sip calculator",
    "systematic investment plan",
    "mutual fund calculator",
    "step up sip",
    "monthly investment calculator"
  ],
  "synonyms": [
    "systematic investment plan",
    "mutual fund calculator",
    "step up sip"
  ],
  "jobs": [
    "sip calculator",
    "systematic investment plan",
    "mutual fund calculator"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "SIP Calculator – Mutual Fund Returns with Step-Up",
    "description": "Estimate how a monthly SIP grows over time at an expected return, with an optional yearly step-up. See amount invested, gains and a growth chart. Free.",
    "h1": "SIP Calculator"
  },
  "howTo": [
    "Enter your monthly investment amount.",
    "Set the expected annual return and the number of years; add a yearly step-up if you plan to increase it.",
    "Compare the estimated value with what you invested."
  ],
  "faq": [
    {
      "q": "How is SIP value calculated?",
      "a": "Each monthly instalment grows at the monthly rate (annual return ÷ 12) until the end of the period; instalments are assumed at the start of each month."
    },
    {
      "q": "What is a step-up SIP?",
      "a": "Increasing your monthly amount by a fixed percentage every year, for example 10% when your salary rises."
    },
    {
      "q": "Are returns guaranteed?",
      "a": "No. Market-linked funds go up and down; the result is an estimate at a constant return."
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
    "calc.compound-interest-calculator",
    "calc.roi-calculator",
    "calc.salary-calculator",
    "calc.budget-planner"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
