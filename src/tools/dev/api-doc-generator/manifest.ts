import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.api-doc-generator",
  "space": "dev",
  "category": "docs-diagrams",
  "slug": "api-doc-generator",
  "name": "AI API Documentation Generator",
  "tagline": "AI-powered API documentation.",
  "keywords": [
    "api documentation",
    "api docs",
    "openapi generator",
    "swagger generator"
  ],
  "synonyms": [
    "api docs",
    "openapi generator",
    "swagger generator"
  ],
  "jobs": [
    "endpoint docs",
    "parameter docs",
    "response schemas"
  ],
  "template": "ai",
  "input": [],
  "output": [
    {
      "type": "markdown",
      "accept": [
        "text/markdown"
      ]
    }
  ],
  "engine": "ai",
  "aiTask": "general",
  "seo": {
    "title": "AI API Documentation Generator – Document Your APIs",
    "description": "Generate comprehensive API documentation from your code. Endpoints, parameters, responses, and schemas. Free daily AI allowance, no sign-up.",
    "h1": "AI API Documentation Generator"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "Where is my text sent?",
      "a": "AI API Documentation Generator sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
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
    "dev.code-doc-generator",
    "dev.api-request-tester",
    "dev.error-explainer",
    "dev.markdown-editor"
  ],
  "legacySlugs": [
    "ai-api-doc-generator"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
