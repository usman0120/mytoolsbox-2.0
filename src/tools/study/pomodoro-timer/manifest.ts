import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.pomodoro-timer",
  "space": "study",
  "category": "planning",
  "slug": "pomodoro-timer",
  "name": "Pomodoro Timer",
  "tagline": "Focus timer with work/break intervals.",
  "keywords": [
    "pomodoro",
    "focus timer",
    "productivity timer",
    "work timer"
  ],
  "synonyms": [
    "focus timer",
    "productivity timer",
    "work timer"
  ],
  "jobs": [
    "customizable intervals",
    "sound notifications",
    "session tracking"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Pomodoro Timer – Focus & Productivity Tool",
    "description": "Boost your productivity with a free Pomodoro timer. Customizable work/break intervals with sound notifications. Free, private, no sign-up. Runs in your browser.",
    "h1": "Pomodoro Timer"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "What is the Pomodoro Technique?",
      "a": "It's a time management method using 25-minute focused work sessions followed by 5-minute breaks."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Pomodoro Timer runs in your browser, so your files and text stay on your device."
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
    "study.study-planner",
    "study.study-timer",
    "study.citation-generator",
    "study.equation-solver"
  ],
  "legacySlugs": [
    "pomodoro-timer"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
