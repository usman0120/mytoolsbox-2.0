import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.code-doc-generator",
  "space": "dev",
  "category": "docs-diagrams",
  "slug": "code-doc-generator",
  "name": "AI Documentation Generator",
  "tagline": "AI-powered code documentation.",
  "keywords": [
    "ai documentation",
    "doc generator",
    "code documentation",
    "jsdoc generator"
  ],
  "synonyms": [
    "doc generator",
    "code documentation",
    "jsdoc generator"
  ],
  "jobs": [
    "auto-document code",
    "multiple doc styles",
    "parameter docs"
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
    "title": "AI Documentation Generator – Auto-Document Code",
    "description": "Generate code documentation automatically. Support for JSDoc, docstrings, GoDoc, and more styles. Free daily AI allowance, no sign-up. Works on any device.",
    "h1": "AI Documentation Generator"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "Where is my text sent?",
      "a": "AI Documentation Generator sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
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
    "dev.api-doc-generator",
    "dev.markdown-editor",
    "dev.error-explainer",
    "dev.ai-regex-builder"
  ],
  "legacySlugs": [
    "ai-doc-generator"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
