import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.paraphraser",
  "space": "work",
  "category": "text",
  "slug": "paraphraser",
  "name": "Paraphrase Tool",
  "tagline": "Rewrite text in different styles.",
  "keywords": [
    "paraphrase tool",
    "rewrite text",
    "rephrase",
    "text spinner"
  ],
  "synonyms": [
    "rewrite text",
    "rephrase",
    "text spinner"
  ],
  "jobs": [
    "multiple styles",
    "preserve meaning",
    "tone adjustment"
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
    "title": "Paraphrase Tool – Rewrite Text Online",
    "description": "Rewrite text in different styles while preserving meaning. Standard, fluent, creative, and concise modes. Free daily AI allowance, no sign-up.",
    "h1": "Paraphrase Tool"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "Where is my text sent?",
      "a": "Paraphrase Tool sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
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
    "work.grammar-checker",
    "work.word-counter",
    "work.text-cleaner",
    "work.case-converter"
  ],
  "legacySlugs": [
    "paraphrase-tool"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
