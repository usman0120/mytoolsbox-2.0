import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.split-pdf",
  "space": "docs",
  "category": "organize",
  "slug": "split-pdf",
  "name": "Split PDF",
  "tagline": "Pull out pages or split a PDF into several files.",
  "keywords": [
    "split pdf",
    "extract pdf pages",
    "separate pdf pages",
    "pdf splitter"
  ],
  "synonyms": [
    "extract pages",
    "cut pdf",
    "separate pdf"
  ],
  "jobs": [
    "extract one page from a pdf",
    "split pdf into separate files",
    "save pages 3 to 5 as a new pdf"
  ],
  "template": "file",
  "input": [
    {
      "type": "pdf",
      "accept": [
        "application/pdf"
      ]
    }
  ],
  "output": [
    {
      "type": "pdf",
      "many": true,
      "accept": [
        "application/pdf"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Split PDF Online – Extract Pages or Page Ranges",
    "description": "Split a PDF by page ranges or extract only the pages you need, then download them. Free, private, no sign-up, and nothing is uploaded to a server.",
    "h1": "Split a PDF"
  },
  "howTo": [
    "Open the PDF you want to split.",
    "Choose page ranges or individual pages.",
    "Download each part, or all parts as a ZIP."
  ],
  "faq": [
    {
      "q": "How do I extract a single page?",
      "a": "Enter just that page number as the range, for example 4, and download the result."
    },
    {
      "q": "Can I split every page into its own file?",
      "a": "Yes. Choose to split into single pages and download them together as a ZIP."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. The PDF is read and split in your browser and never leaves your device."
    },
    {
      "q": "Does splitting reduce quality?",
      "a": "No. Pages are copied without re-compressing, so they look exactly like the original."
    }
  ],
  "related": [
    "docs.merge-pdf",
    "docs.compress-pdf",
    "docs.pdf-to-jpg",
    "docs.rotate-pdf"
  ],
  "legacySlugs": [
    "pdf-splitter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
