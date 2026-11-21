import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.grammar-checker",
  "space": "work",
  "category": "text",
  "slug": "grammar-checker",
  "name": "Grammar Checker",
  "tagline": "Check grammar and spelling.",
  "keywords": [
    "grammar checker",
    "spell check",
    "grammar check",
    "writing assistant"
  ],
  "synonyms": [
    "spell check",
    "grammar check",
    "writing assistant"
  ],
  "jobs": [
    "grammar check",
    "spell check",
    "style suggestions"
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
    "title": "Grammar Checker – Check Spelling & Grammar Online",
    "description": "Check your text for grammar, spelling, and style issues. Improve your writing clarity. Free daily AI allowance, no sign-up. Works on any device.",
    "h1": "Grammar Checker"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "Where is my text sent?",
      "a": "Grammar Checker sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
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
    "work.word-counter",
    "work.case-converter",
    "work.text-cleaner",
    "work.paraphraser"
  ],
  "legacySlugs": [
    "grammar-checker"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
