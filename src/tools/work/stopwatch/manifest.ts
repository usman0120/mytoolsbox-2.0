import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.stopwatch",
  "space": "work",
  "category": "productivity",
  "slug": "stopwatch",
  "name": "Stopwatch & Countdown",
  "tagline": "Precise stopwatch with lap timing.",
  "keywords": [
    "stopwatch",
    "countdown",
    "timer",
    "lap timer"
  ],
  "synonyms": [
    "countdown",
    "timer",
    "lap timer"
  ],
  "jobs": [
    "lap timing",
    "countdown mode",
    "millisecond precision"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Stopwatch & Countdown Timer – Online Timer Tool",
    "description": "Precise online stopwatch with lap timing and countdown timer. Perfect for workouts, cooking, and presentations. Free, private, no sign-up. Runs in your browser.",
    "h1": "Stopwatch & Countdown"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Stopwatch & Countdown runs in your browser, so your files and text stay on your device."
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
    "work.countdown-timer",
    "work.daily-planner",
    "work.file-organizer"
  ],
  "legacySlugs": [
    "stopwatch"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
