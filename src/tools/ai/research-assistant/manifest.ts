import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "ai.research-assistant",
  "space": "ai",
  "category": "learn",
  "slug": "research-assistant",
  "name": "Research Assistant",
  "tagline": "Research organizer with citation management.",
  "keywords": [
    "research assistant",
    "citation manager",
    "bibliography generator",
    "reference manager",
    "academic research"
  ],
  "synonyms": [
    "citation manager",
    "bibliography generator",
    "reference manager"
  ],
  "jobs": [
    "citation management",
    "bibliography generator",
    "note organization"
  ],
  "template": "ai",
  "input": [],
  "output": [],
  "engine": "ai",
  "aiTask": "general",
  "seo": {
    "title": "Research Assistant – Citation & Bibliography Tool",
    "description": "Organize research, manage citations, and generate bibliographies in APA, MLA, Chicago, and BibTeX formats. Free daily AI allowance, no sign-up.",
    "h1": "Research Assistant"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "What citation formats are supported?",
      "a": "APA 7th, MLA 9th, Chicago, Harvard, IEEE, and BibTeX for LaTeX users."
    },
    {
      "q": "Can I export my bibliography?",
      "a": "Yes! Export as formatted text, BibTeX, or copy directly to your clipboard."
    },
    {
      "q": "Where is my text sent?",
      "a": "Research Assistant sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
    },
    {
      "q": "Is it free?",
      "a": "Yes. AI features are free within a daily allowance: 10 requests a day without an account and 40 when you sign in."
    }
  ],
  "related": [
    "work.notepad",
    "work.word-counter",
    "ai.math-solver",
    "ai.notes-generator"
  ],
  "legacySlugs": [
    "research-assistant"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
