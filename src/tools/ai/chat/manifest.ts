import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "ai.chat",
  "space": "ai",
  "category": "everyday",
  "slug": "chat",
  "name": "AI Chat",
  "tagline": "Your AI conversation workspace.",
  "keywords": [
    "ai chat",
    "ai assistant",
    "writing",
    "coding",
    "learning"
  ],
  "synonyms": [
    "ai assistant",
    "writing",
    "coding"
  ],
  "jobs": [
    "conversation history",
    "provider and model selection",
    "markdown responses"
  ],
  "template": "ai",
  "input": [],
  "output": [
    {
      "type": "text",
      "accept": [
        "text/plain"
      ]
    }
  ],
  "engine": "ai",
  "seo": {
    "title": "AI Chat — Writing, Coding & Learning Assistant",
    "description": "Chat with an AI assistant for writing, coding and learning. Keep conversations, copy answers and export them. Free daily AI allowance, no sign-up needed.",
    "h1": "AI Chat"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "Are my requests processed locally?",
      "a": "No. AI requests are sent to configured providers. Do not submit sensitive information without reviewing the privacy policy."
    },
    {
      "q": "Do I need an account?",
      "a": "No. AI chat works without an account within a free daily allowance; signing in raises it."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    },
    {
      "q": "Where is my text sent?",
      "a": "AI Chat sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
    }
  ],
  "related": [
    "work.word-counter",
    "dev.json-formatter",
    "ai.fitness-coach",
    "ai.nutrition-guide"
  ],
  "legacySlugs": [
    "ai-chat"
  ],
  "status": "live",
  "offline": false,
  "aiTask": "general"
};

export default manifest;
