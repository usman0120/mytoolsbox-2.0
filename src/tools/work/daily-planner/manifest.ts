import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.daily-planner",
  "space": "work",
  "category": "productivity",
  "slug": "daily-planner",
  "name": "Daily Planner",
  "tagline": "Time-blocked daily planning tool.",
  "keywords": [
    "daily planner",
    "day planner",
    "time blocker",
    "daily schedule",
    "planner"
  ],
  "synonyms": [
    "day planner",
    "time blocker",
    "daily schedule"
  ],
  "jobs": [
    "time blocking",
    "priority levels",
    "auto-save to browser"
  ],
  "template": "text",
  "input": [],
  "output": [
    {
      "type": "text",
      "accept": [
        "text/plain"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Daily Planner – Time-Block Your Day",
    "description": "Plan your day with a free time-blocked daily planner. Set priorities and track accomplishments. Free, private, no sign-up. Runs in your browser.",
    "h1": "Daily Planner"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my plan saved?",
      "a": "Yes! Your daily plan is automatically saved to your browser's local storage."
    },
    {
      "q": "Can I plan multiple days?",
      "a": "The planner focuses on one day at a time. You can download each day's plan for reference."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Daily Planner runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "work.todo-list",
    "work.habit-tracker",
    "study.pomodoro-timer",
    "work.countdown-timer"
  ],
  "legacySlugs": [
    "daily-planner"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
