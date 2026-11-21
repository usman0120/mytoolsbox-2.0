import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.sql-formatter",
  "space": "dev",
  "category": "format-validate",
  "slug": "sql-formatter",
  "name": "SQL Formatter",
  "tagline": "Format and beautify SQL.",
  "keywords": [
    "sql formatter",
    "format sql",
    "sql beautifier",
    "sql prettier"
  ],
  "synonyms": [
    "format sql",
    "sql beautifier",
    "sql prettier"
  ],
  "jobs": [
    "multiple dialects",
    "keyword casing",
    "indentation styles"
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
    "title": "SQL Formatter – Beautify SQL Queries Online",
    "description": "Format and beautify SQL for MySQL, PostgreSQL, SQLite and T-SQL in your browser, with optional AI explanations. Free, no sign-up, any device.",
    "h1": "SQL Formatter"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "Where is my text sent?",
      "a": "SQL Formatter sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
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
    "dev.json-formatter",
    "dev.regex-tester",
    "dev.css-formatter",
    "dev.diff-checker"
  ],
  "legacySlugs": [
    "sql-formatter"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
