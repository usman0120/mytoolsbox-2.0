import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "ai.notes-generator",
  "space": "ai",
  "category": "learn",
  "slug": "notes-generator",
  "name": "AI Notes Generator",
  "tagline": "AI-powered study notes generation.",
  "keywords": [
    "ai notes generator",
    "study notes",
    "note maker ai",
    "lecture notes",
    "summary generator"
  ],
  "synonyms": [
    "study notes",
    "note maker ai",
    "lecture notes"
  ],
  "jobs": [
    "ai note generation",
    "multiple formats",
    "key points extraction"
  ],
  "template": "ai",
  "input": [],
  "output": [],
  "engine": "ai",
  "seo": {
    "title": "AI Notes Generator – Create Study Notes Instantly",
    "description": "Turn any topic into clear study notes with AI: bullet points, outlines, summaries or detailed notes, with key points. Free daily AI allowance, no sign-up.",
    "h1": "AI Notes Generator"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "What formats can I generate notes in?",
      "a": "Choose from bullet points, structured outlines, concise summaries, or detailed comprehensive notes."
    },
    {
      "q": "Can I download my generated notes?",
      "a": "Yes! Download notes as Markdown files or copy them to your clipboard."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    },
    {
      "q": "Where is my text sent?",
      "a": "AI Notes Generator sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
    }
  ],
  "related": [
    "study.study-planner",
    "ai.math-solver",
    "ai.research-assistant",
    "ai.chat"
  ],
  "legacySlugs": [
    "ai-notes-generator"
  ],
  "status": "live",
  "offline": false,
  "aiTask": "general"
};

export default manifest;
