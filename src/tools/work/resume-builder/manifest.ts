import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.resume-builder",
  "space": "work",
  "category": "career",
  "slug": "resume-builder",
  "name": "Resume Builder",
  "tagline": "Resume editor, academic CVs & optional AI assistance.",
  "keywords": [
    "resume builder",
    "cv maker",
    "resume template",
    "professional resume",
    "ats resume"
  ],
  "synonyms": [
    "cv maker",
    "resume template",
    "professional resume"
  ],
  "jobs": [
    "resume templates",
    "academic cv fields",
    "optional ai assistance"
  ],
  "template": "editor",
  "input": [],
  "output": [
    {
      "type": "text",
      "accept": [
        "text/html"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Resume Builder – Professional CV Maker",
    "description": "Build resumes and academic CVs in one workspace with templates, local drafts, HTML/JSON export, browser printing, and. Free, private, no sign-up.",
    "h1": "Resume Builder"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "Can I save a PDF?",
      "a": "Use Print and choose Save as PDF in your browser. HTML and JSON downloads are also available."
    },
    {
      "q": "Are AI features required?",
      "a": "No. Resume and CV editing work locally. Optional AI assistance needs an internet connection and counts toward the free daily AI allowance."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Resume Builder runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "work.cover-letter-generator",
    "work.business-name-generator",
    "work.case-converter",
    "work.contract-generator"
  ],
  "legacySlugs": [
    "resume-builder"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
