import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.habit-tracker",
  "space": "work",
  "category": "productivity",
  "slug": "habit-tracker",
  "name": "Habit Tracker",
  "tagline": "Build habits with streak tracking.",
  "keywords": [
    "habit tracker",
    "habit builder",
    "streak tracker",
    "daily tracker",
    "goal tracker"
  ],
  "synonyms": [
    "habit builder",
    "streak tracker",
    "daily tracker"
  ],
  "jobs": [
    "daily habits",
    "streak counter",
    "calendar view"
  ],
  "template": "editor",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Habit Tracker – Build Better Habits Daily",
    "description": "Build better habits with streak tracking and visual progress charts. Set daily goals and never break the chain. Free, private, no sign-up. Runs in your browser.",
    "h1": "Habit Tracker"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "Does it sync across devices?",
      "a": "Data is stored locally. You can export and import your habit data to transfer between devices."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Habit Tracker runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    },
    {
      "q": "Does it work on my phone?",
      "a": "Yes. It works in any modern browser on phones, tablets and computers."
    }
  ],
  "related": [
    "study.pomodoro-timer",
    "study.study-planner",
    "work.countdown-timer",
    "work.daily-planner"
  ],
  "legacySlugs": [
    "habit-tracker"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
