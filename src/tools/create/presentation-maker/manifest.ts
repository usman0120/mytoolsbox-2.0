import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "create.presentation-maker",
  "space": "create",
  "category": "design",
  "slug": "presentation-maker",
  "name": "Presentation Maker",
  "tagline": "Slide editor, presenter view & optional AI assistance.",
  "keywords": [
    "presentation maker",
    "slide creator",
    "slideshow",
    "pitch deck",
    "presentation tool"
  ],
  "synonyms": [
    "slide creator",
    "slideshow",
    "pitch deck"
  ],
  "jobs": [
    "slide templates",
    "slide editing and reordering",
    "images and text"
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
    "title": "Presentation Maker – Create Beautiful Slides",
    "description": "Create stunning presentations with drag-and-drop editor. Templates, rich content, and PDF export. Free, private, no sign-up. Runs in your browser.",
    "h1": "Presentation Maker"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "Can I export to PowerPoint?",
      "a": "You can export as PDF. PPTX export is coming soon."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Presentation Maker runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    },
    {
      "q": "Does it work on my phone?",
      "a": "Yes. It works in any modern browser on phones, tablets and computers."
    }
  ],
  "related": [
    "create.certificate-maker",
    "create.color-palette-generator",
    "create.design",
    "create.barcode-generator"
  ],
  "legacySlugs": [
    "presentation-maker"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
