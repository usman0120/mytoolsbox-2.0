import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.todo-list",
  "space": "work",
  "category": "productivity",
  "slug": "todo-list",
  "name": "Todo List",
  "tagline": "Drag-and-drop todo list with auto-save.",
  "keywords": [
    "todo list",
    "task manager",
    "to do",
    "task list",
    "checklist"
  ],
  "synonyms": [
    "task manager",
    "to do",
    "task list"
  ],
  "jobs": [
    "drag & drop reorder",
    "auto-save to browser",
    "task completion tracking"
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
    "title": "Todo List – Drag & Drop Task Manager",
    "description": "Stay organized with a free drag-and-drop todo list. Auto-saves to your browser - no account needed. Free, private, no sign-up. Runs in your browser.",
    "h1": "Todo List"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my todo list saved?",
      "a": "Yes! Your tasks are automatically saved to your browser's local storage."
    },
    {
      "q": "Can I reorder tasks?",
      "a": "Yes, simply drag and drop tasks to reorder them however you like."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Todo List runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "work.daily-planner",
    "work.habit-tracker",
    "work.notepad",
    "work.countdown-timer"
  ],
  "legacySlugs": [
    "todo-list"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
