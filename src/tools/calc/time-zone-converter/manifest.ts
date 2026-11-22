import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.time-zone-converter",
  "space": "calc",
  "category": "date-time",
  "slug": "time-zone-converter",
  "name": "Time Zone Converter",
  "tagline": "Convert a time between cities, with daylight saving applied.",
  "keywords": [
    "time zone converter",
    "pakistan time to est",
    "convert time zones",
    "meeting time converter",
    "world clock"
  ],
  "synonyms": [
    "pakistan time to est",
    "convert time zones",
    "meeting time converter"
  ],
  "jobs": [
    "time zone converter",
    "pakistan time to est",
    "convert time zones"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Time Zone Converter – Meeting Times Across Cities",
    "description": "Convert a date and time between time zones and see the same moment in 24 cities worldwide, with daylight saving time applied automatically. Free, no sign-up.",
    "h1": "Time Zone Converter"
  },
  "howTo": [
    "Enter the date and time.",
    "Choose its time zone and the zone to convert to.",
    "Read the converted time and the world table."
  ],
  "faq": [
    {
      "q": "Is daylight saving handled?",
      "a": "Yes. Offsets come from your browser's time zone database for the exact date you enter."
    },
    {
      "q": "Why does the difference change during the year?",
      "a": "Some countries move their clocks for summer and others don't, so the gap between them changes."
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
    "calc.date-difference-calculator",
    "calc.age-calculator",
    "work.stopwatch",
    "calc.unit-converter"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
