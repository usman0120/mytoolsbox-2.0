import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.countdown-timer",
  "space": "work",
  "category": "productivity",
  "slug": "countdown-timer",
  "name": "Countdown Timer",
  "tagline": "Countdown to important dates.",
  "keywords": [
    "countdown timer",
    "event countdown",
    "days until",
    "deadline timer",
    "countdown clock"
  ],
  "synonyms": [
    "event countdown",
    "days until",
    "deadline timer"
  ],
  "jobs": [
    "live countdown",
    "days/hours/minutes/seconds",
    "multiple timers"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Countdown Timer – Track Days Until Your Event",
    "description": "Create countdown timers for events, deadlines, and special occasions. Free and easy to use. Free, private, no sign-up. Runs in your browser.",
    "h1": "Countdown Timer"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Can I create multiple countdowns?",
      "a": "Yes! Create as many countdown timers as you need for different events."
    },
    {
      "q": "Does the timer work when my browser is closed?",
      "a": "The timer calculates the remaining time based on your system clock, so it's always accurate when you open it."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Countdown Timer runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "study.pomodoro-timer",
    "work.stopwatch",
    "work.daily-planner",
    "work.file-organizer"
  ],
  "legacySlugs": [
    "countdown-timer"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
