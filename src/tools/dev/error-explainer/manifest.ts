import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.error-explainer",
  "space": "dev",
  "category": "docs-diagrams",
  "slug": "error-explainer",
  "name": "AI Error Explainer",
  "tagline": "AI-powered error explanations.",
  "keywords": [
    "ai error",
    "error explainer",
    "debug helper",
    "error fixer"
  ],
  "synonyms": [
    "error explainer",
    "debug helper",
    "error fixer"
  ],
  "jobs": [
    "error analysis",
    "root cause",
    "step-by-step fix"
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
    "title": "AI Error Explainer – Understand & Fix Errors",
    "description": "Get AI-powered explanations and solutions for programming errors. Paste any error and get actionable fixes. Free daily AI allowance, no sign-up.",
    "h1": "AI Error Explainer"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "Where is my text sent?",
      "a": "AI Error Explainer sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
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
    "dev.ai-sql-assistant",
    "dev.regex-tester",
    "dev.api-doc-generator",
    "dev.code-doc-generator"
  ],
  "legacySlugs": [
    "ai-error-explainer"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
