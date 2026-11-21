import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.ai-regex-builder",
  "space": "dev",
  "category": "generators",
  "slug": "ai-regex-builder",
  "name": "AI Regex Builder",
  "tagline": "AI-powered regex generation.",
  "keywords": [
    "ai regex",
    "regex builder",
    "regex generator",
    "ai regex builder"
  ],
  "synonyms": [
    "regex builder",
    "regex generator",
    "ai regex builder"
  ],
  "jobs": [
    "natural language input",
    "ai-generated patterns",
    "live testing"
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
    "title": "AI Regex Builder – Generate Regex from Description",
    "description": "Generate regular expressions from natural language descriptions. AI-powered with live testing. Free daily AI allowance, no sign-up. Works on any device.",
    "h1": "AI Regex Builder"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "Where is my text sent?",
      "a": "AI Regex Builder sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
    },
    {
      "q": "Is it free?",
      "a": "Yes. AI features are free within a daily allowance: 10 requests a day without an account and 40 when you sign in."
    },
    {
      "q": "Can AI answers be wrong?",
      "a": "Yes. Treat answers as a helpful draft and check important facts before you rely on them."
    },
    {
      "q": "Does it work on my phone?",
      "a": "Yes. It works in any modern browser on phones, tablets and computers."
    }
  ],
  "related": [
    "dev.regex-tester",
    "dev.ai-sql-assistant",
    "dev.cron-builder",
    "dev.lorem-ipsum"
  ],
  "legacySlugs": [
    "ai-regex-builder"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
