import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.date-difference-calculator",
  "space": "calc",
  "category": "date-time",
  "slug": "date-difference-calculator",
  "name": "Date Difference Calculator",
  "tagline": "Days, weeks, months and weekdays between two dates.",
  "keywords": [
    "date difference calculator",
    "days between dates",
    "how many days until",
    "date calculator",
    "business days calculator"
  ],
  "synonyms": [
    "days between dates",
    "how many days until",
    "date calculator"
  ],
  "jobs": [
    "date difference calculator",
    "days between dates",
    "how many days until"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Date Difference Calculator – Days Between Two Dates",
    "description": "Count the days, weeks, months and years between two dates, including weekdays only, with the option to include the end date. Free, instant, works offline.",
    "h1": "Date Difference Calculator"
  },
  "howTo": [
    "Pick the start and end dates.",
    "Choose whether to count the end date.",
    "Read days, weeks, months and weekdays."
  ],
  "faq": [
    {
      "q": "Should I count the end date?",
      "a": "Count it for durations like hotel nights or leave days that include both dates; leave it off for 'how long until'."
    },
    {
      "q": "Are public holidays excluded from weekdays?",
      "a": "No. Weekdays are Monday to Friday; subtract your local holidays."
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
    "calc.time-zone-converter",
    "calc.due-date-calculator",
    "work.stopwatch"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
