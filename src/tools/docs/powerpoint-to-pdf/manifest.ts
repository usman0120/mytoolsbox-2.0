import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.powerpoint-to-pdf",
  "space": "docs",
  "category": "convert",
  "slug": "powerpoint-to-pdf",
  "name": "PowerPoint to PDF",
  "tagline": "Save PowerPoint slides as a PDF handout.",
  "keywords": [
    "ppt to pdf",
    "pptx to pdf",
    "powerpoint to pdf",
    "slides to pdf"
  ],
  "synonyms": [
    "pptx to pdf",
    "presentation to pdf"
  ],
  "jobs": [
    "save slides as pdf",
    "convert pptx to pdf for printing"
  ],
  "template": "file",
  "input": [
    {
      "type": "any-file",
      "accept": [
        ".pptx",
        ".ppt"
      ]
    }
  ],
  "output": [
    {
      "type": "pdf",
      "accept": [
        "application/pdf"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "PowerPoint to PDF Online – Convert PPTX to PDF",
    "description": "Convert PowerPoint (PPTX) slides to a PDF you can share or print. Free, private, no sign-up. Slide text is laid out cleanly; files never leave your device.",
    "h1": "Convert PowerPoint to PDF"
  },
  "howTo": [
    "Open a PPTX presentation.",
    "The text of each slide is placed on its own PDF page.",
    "Download the PDF."
  ],
  "faq": [
    {
      "q": "Are slide designs and images kept?",
      "a": "The text of each slide is converted reliably. Background designs, charts and animations are simplified."
    },
    {
      "q": "Do I need PowerPoint installed?",
      "a": "No. The conversion runs in your browser."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. The presentation stays on your device."
    },
    {
      "q": "Does it support .ppt files?",
      "a": "PPTX works best. Save older .ppt files as PPTX first."
    }
  ],
  "related": [
    "docs.pdf-to-powerpoint",
    "docs.word-to-pdf",
    "docs.merge-pdf",
    "docs.compress-pdf"
  ],
  "legacySlugs": [
    "ppt-to-pdf"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
