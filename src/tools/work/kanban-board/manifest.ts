import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.kanban-board",
  "space": "work",
  "category": "productivity",
  "slug": "kanban-board",
  "name": "Kanban Board",
  "tagline": "Drag-and-drop task management board.",
  "keywords": [
    "kanban",
    "task management",
    "todo board",
    "project management"
  ],
  "synonyms": [
    "task management",
    "todo board",
    "project management"
  ],
  "jobs": [
    "drag & drop tasks",
    "multiple columns",
    "local storage"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Kanban Board – Task Management Tool",
    "description": "Simple drag-and-drop Kanban board for personal task management. Organize your projects with columns and cards. Free, private, no sign-up. Runs in your browser.",
    "h1": "Kanban Board"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data saved?",
      "a": "Yes, your board data is saved locally in your browser's storage. It persists across sessions."
    },
    {
      "q": "Can I share my board?",
      "a": "You can export your board as JSON and share it with others to import."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Kanban Board runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "work.countdown-timer",
    "work.daily-planner",
    "work.file-organizer",
    "work.habit-tracker"
  ],
  "legacySlugs": [
    "kanban-board"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
