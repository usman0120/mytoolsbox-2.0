import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.ai-sql-assistant",
  "space": "dev",
  "category": "generators",
  "slug": "ai-sql-assistant",
  "name": "AI SQL Assistant",
  "tagline": "AI-powered SQL helper.",
  "keywords": [
    "ai sql",
    "sql assistant",
    "sql explainer",
    "sql optimizer"
  ],
  "synonyms": [
    "sql assistant",
    "sql explainer",
    "sql optimizer"
  ],
  "jobs": [
    "explain queries",
    "optimize sql",
    "format sql"
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
    "title": "AI SQL Assistant – Explain & Optimize SQL Queries",
    "description": "Explain, optimize, format, and generate SQL queries with AI. Support for multiple database dialects. Free daily AI allowance, no sign-up. Works on any device.",
    "h1": "AI SQL Assistant"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "Where is my text sent?",
      "a": "AI SQL Assistant sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
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
    "dev.sql-formatter",
    "dev.ai-regex-builder",
    "dev.cron-builder",
    "dev.lorem-ipsum"
  ],
  "legacySlugs": [
    "ai-sql-assistant"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
