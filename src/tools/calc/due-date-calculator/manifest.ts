import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.due-date-calculator",
  "space": "calc",
  "category": "health",
  "slug": "due-date-calculator",
  "name": "Pregnancy Due Date Calculator",
  "tagline": "Due date, current week and trimester from your last period or conception.",
  "keywords": [
    "due date calculator",
    "pregnancy calculator",
    "how many weeks pregnant",
    "pregnancy week calculator",
    "edd calculator"
  ],
  "synonyms": [
    "pregnancy calculator",
    "how many weeks pregnant",
    "pregnancy week calculator"
  ],
  "jobs": [
    "due date calculator",
    "pregnancy calculator",
    "how many weeks pregnant"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Due Date Calculator – Pregnancy Week and Trimester",
    "description": "Estimate your baby's due date from the first day of your last period, conception date or IVF transfer, and see how many weeks pregnant you are today. Free.",
    "h1": "Pregnancy Due Date Calculator"
  },
  "howTo": [
    "Choose what you know: last period, conception or IVF transfer date.",
    "Enter the date and, for the last period, your usual cycle length.",
    "See the due date, current week and trimester."
  ],
  "faq": [
    {
      "q": "How is the due date worked out?",
      "a": "Naegele's rule: 280 days after the first day of your last period, adjusted if your cycle is longer or shorter than 28 days."
    },
    {
      "q": "How accurate is it?",
      "a": "It is an estimate. Most babies arrive within two weeks either side, and an early ultrasound usually gives a more accurate date."
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
    "calc.age-calculator",
    "calc.date-difference-calculator",
    "calc.bmi-calculator",
    "calc.ideal-weight-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
