import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.notepad",
  "space": "work",
  "category": "productivity",
  "slug": "notepad",
  "name": "Notes",
  "tagline": "Quick markdown notes with local storage.",
  "keywords": [
    "notes",
    "markdown notes",
    "note taking",
    "text editor"
  ],
  "synonyms": [
    "markdown notes",
    "note taking",
    "text editor"
  ],
  "jobs": [
    "markdown support",
    "instant search",
    "local storage"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Notes Tool – Markdown Note Taking",
    "description": "Take quick markdown notes with local storage. Search, organize, and export your notes. No account needed. Free, private, no sign-up. Runs in your browser.",
    "h1": "Notes"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Notes runs in your browser, so your files and text stay on your device."
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
    "work.countdown-timer",
    "work.daily-planner",
    "work.file-organizer",
    "work.habit-tracker"
  ],
  "legacySlugs": [
    "notes-app"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
