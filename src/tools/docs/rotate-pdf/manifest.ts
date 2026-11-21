import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.rotate-pdf",
  "space": "docs",
  "category": "edit-sign",
  "slug": "rotate-pdf",
  "name": "Rotate PDF",
  "tagline": "Turn sideways or upside-down PDF pages the right way.",
  "keywords": [
    "rotate pdf",
    "turn pdf pages",
    "fix sideways pdf",
    "rotate pdf pages"
  ],
  "synonyms": [
    "turn pdf",
    "flip pdf orientation"
  ],
  "jobs": [
    "rotate a scanned pdf",
    "fix upside-down pdf pages"
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
      "accept": [
        "application/pdf"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Rotate PDF Online – Fix Sideways PDF Pages",
    "description": "Rotate PDF pages 90, 180 or 270 degrees and save the fixed file. The same workspace also adds watermarks and extracts text. Free, private, no sign-up.",
    "h1": "Rotate PDF pages"
  },
  "howTo": [
    "Open the PDF.",
    "Choose 90, 180 or 270 degrees.",
    "Download the rotated PDF."
  ],
  "faq": [
    {
      "q": "Does rotating reduce quality?",
      "a": "No. Rotation changes page orientation only; content is not re-compressed."
    },
    {
      "q": "Can I rotate all pages at once?",
      "a": "Yes. The chosen angle is applied to every page."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. The PDF is rotated in your browser."
    },
    {
      "q": "What else can I do here?",
      "a": "Switch to the other actions to add a text watermark, compress, or extract text without opening the file again."
    }
  ],
  "related": [
    "docs.merge-pdf",
    "docs.split-pdf",
    "docs.watermark-pdf",
    "docs.compress-pdf"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
