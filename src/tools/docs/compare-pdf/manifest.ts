import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.compare-pdf",
  "space": "docs",
  "category": "organize",
  "slug": "compare-pdf",
  "name": "Compare PDFs",
  "tagline": "See what changed between two versions of a PDF.",
  "keywords": [
    "compare pdf",
    "pdf diff",
    "compare two pdf files",
    "find differences in pdf"
  ],
  "synonyms": [
    "pdf diff",
    "pdf changes"
  ],
  "jobs": [
    "find changes between two pdf versions",
    "compare contract versions"
  ],
  "template": "file",
  "input": [
    {
      "type": "pdf",
      "many": true,
      "accept": [
        "application/pdf"
      ]
    }
  ],
  "output": [
    {
      "type": "text"
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Compare PDF Files Online – Find Text Differences",
    "description": "Compare two PDF files and see which lines were added or removed between versions. Free, private, no sign-up. Both files stay on your device.",
    "h1": "Compare two PDFs"
  },
  "howTo": [
    "Open the original PDF.",
    "Open the changed version.",
    "Review added and removed lines."
  ],
  "faq": [
    {
      "q": "What does it compare?",
      "a": "The text of both PDFs, line by line. Visual differences such as images or colours are not compared."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. Both PDFs are read in your browser."
    },
    {
      "q": "Does it work on scanned PDFs?",
      "a": "Only if both files have a text layer."
    },
    {
      "q": "Can I compare Word documents?",
      "a": "Save them as PDF first, then compare."
    }
  ],
  "related": [
    "docs.pdf-to-text",
    "docs.merge-pdf",
    "docs.split-pdf",
    "docs.pdf-to-word"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
