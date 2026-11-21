import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "ai.writer",
  "space": "ai",
  "category": "everyday",
  "slug": "writer",
  "name": "AI Text Generator",
  "tagline": "Generate text content with AI chat.",
  "keywords": [
    "ai text generator",
    "ai writer",
    "content generator",
    "ai chat",
    "text generation"
  ],
  "synonyms": [
    "ai writer",
    "content generator",
    "ai chat"
  ],
  "jobs": [
    "chat-style interface",
    "multiple content types",
    "message history"
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
  "aiTask": "general",
  "seo": {
    "title": "AI Writer – Draft Emails, Posts & Articles",
    "description": "Generate articles, emails, stories, and more with our free AI text generator. Chat-style interface for easy content creation. Works on any device.",
    "h1": "AI Text Generator"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "What can I generate?",
      "a": "Generate articles, emails, stories, social media posts, marketing copy, and much more."
    },
    {
      "q": "Is my content saved?",
      "a": "Your chat history is saved to your browser's local storage for convenience."
    },
    {
      "q": "Where is my text sent?",
      "a": "AI Text Generator sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
    },
    {
      "q": "Is it free?",
      "a": "Yes. AI features are free within a daily allowance: 10 requests a day without an account and 40 when you sign in."
    }
  ],
  "related": [
    "ai.chat",
    "ai.fitness-coach",
    "ai.nutrition-guide",
    "ai.farm-advisor"
  ],
  "legacySlugs": [
    "ai-text-generator"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
