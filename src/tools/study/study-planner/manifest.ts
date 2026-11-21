import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.study-planner",
  "space": "study",
  "category": "planning",
  "slug": "study-planner",
  "name": "Study Planner",
  "tagline": "Smart study scheduler with progress tracking.",
  "keywords": [
    "study planner",
    "study schedule",
    "exam prep",
    "study tracker",
    "revision planner"
  ],
  "synonyms": [
    "study schedule",
    "exam prep",
    "study tracker"
  ],
  "jobs": [
    "subject organization",
    "goal setting",
    "progress tracking"
  ],
  "template": "editor",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Study Planner – Smart Study Scheduler",
    "description": "Plan study sessions, track progress, and build streaks. Smart scheduler with Pomodoro integration. Free, private, no sign-up. Runs in your browser.",
    "h1": "Study Planner"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "Does it sync across devices?",
      "a": "Your study data is saved locally. You can export and import your schedule to transfer between devices."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Study Planner runs in your browser, so your files and text stay on your device."
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
    "study.study-timer",
    "study.citation-generator",
    "study.equation-solver"
  ],
  "legacySlugs": [
    "study-planner"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
