import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.essay-outline",
  "space": "study",
  "category": "writing-citing",
  "slug": "essay-outline",
  "name": "Essay Outline Generator",
  "tagline": "Plan an essay: thesis, sections, evidence to find and a word budget.",
  "keywords": [
    "essay outline",
    "essay planner",
    "thesis statement",
    "essay structure",
    "argumentative essay outline"
  ],
  "synonyms": [
    "essay planner",
    "thesis statement",
    "essay structure"
  ],
  "jobs": [
    "essay outline",
    "essay planner",
    "thesis statement"
  ],
  "template": "ai",
  "input": [],
  "output": [],
  "engine": "ai",
  "aiTask": "essay.outline",
  "legacySlugs": [],
  "status": "live",
  "offline": false,
  "seo": {
    "title": "Essay Outline Generator – Thesis and Structure (AI)",
    "description": "Turn an essay question into a clear outline: thesis, introduction, body sections with evidence to find, counter-arguments, conclusion and a word budget. Free.",
    "h1": "Essay Outline Generator"
  },
  "howTo": [
    "Paste the essay question or topic.",
    "Choose the essay type, level and length.",
    "Create the outline, then copy, download or save it."
  ],
  "faq": [
    {
      "q": "Does it write the essay for me?",
      "a": "No. It plans the structure so you can write the essay yourself, which is what most schools and universities allow."
    },
    {
      "q": "Will it make up sources?",
      "a": "No. It suggests the kinds of sources and search terms to look for; you find and cite the real sources."
    },
    {
      "q": "Is my topic stored?",
      "a": "Your topic is sent to our AI provider to write the outline and is not stored by us unless you save the result."
    },
    {
      "q": "Is it free?",
      "a": "Yes, within your daily AI allowance and without sign-up."
    }
  ],
  "related": [
    "study.citation-generator",
    "work.paraphraser",
    "work.grammar-checker",
    "ai.writer"
  ]
};

export default manifest;
