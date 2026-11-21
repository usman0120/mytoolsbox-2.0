import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.file-organizer",
  "space": "work",
  "category": "productivity",
  "slug": "file-organizer",
  "name": "File Organizer",
  "tagline": "Organize files by type and date.",
  "keywords": [
    "file organizer",
    "sort files",
    "organize files",
    "file sorter",
    "file manager"
  ],
  "synonyms": [
    "sort files",
    "organize files",
    "file sorter"
  ],
  "jobs": [
    "sort by file type",
    "sort by date",
    "custom rules"
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
    "title": "File Organizer – Sort & Organize Files Online",
    "description": "Organize your files by type, date, or custom rules. Free browser-based file organization tool. Free, private, no sign-up. Runs in your browser.",
    "h1": "File Organizer"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Are my files uploaded to a server?",
      "a": "No, all file organization happens locally in your browser. Your files never leave your device."
    },
    {
      "q": "What file types are supported?",
      "a": "You can organize any file type - documents, images, videos, archives, and more."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. File Organizer runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "work.daily-planner",
    "work.todo-list",
    "work.notepad",
    "work.countdown-timer"
  ],
  "legacySlugs": [
    "file-organizer"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
