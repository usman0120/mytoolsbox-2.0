import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.study-timer",
  "space": "study",
  "category": "planning",
  "slug": "study-timer",
  "name": "Study Timer",
  "tagline": "Track study time with subjects & streaks.",
  "keywords": [
    "study timer",
    "study tracker",
    "focus timer",
    "study session",
    "learning timer"
  ],
  "synonyms": [
    "study tracker",
    "focus timer",
    "study session"
  ],
  "jobs": [
    "customizable timer",
    "subject tracking",
    "daily/weekly stats"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Study Timer – Track Study Sessions & Build Streaks",
    "description": "Track your study time with a customizable timer. Set subjects, monitor daily and weekly totals, and build study streaks. Free, private, no sign-up.",
    "h1": "Study Timer"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Study Timer runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    },
    {
      "q": "Does it work on my phone?",
      "a": "Yes. It works in any modern browser on phones, tablets and computers."
    },
    {
      "q": "Does it work offline?",
      "a": "Once the page has loaded, the tool keeps working without an internet connection."
    }
  ],
  "related": [
    "study.pomodoro-timer",
    "work.stopwatch",
    "study.study-planner",
    "study.citation-generator"
  ],
  "legacySlugs": [
    "study-timer"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
