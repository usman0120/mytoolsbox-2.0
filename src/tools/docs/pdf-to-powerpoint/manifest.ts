import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.pdf-to-powerpoint",
  "space": "docs",
  "category": "convert",
  "slug": "pdf-to-powerpoint",
  "name": "PDF to PowerPoint",
  "tagline": "Turn PDF text into editable PowerPoint slides.",
  "keywords": [
    "pdf to powerpoint",
    "pdf to ppt",
    "pdf to pptx",
    "convert pdf to slides"
  ],
  "synonyms": [
    "pdf to slides",
    "pdf to presentation"
  ],
  "jobs": [
    "turn pdf notes into slides",
    "convert pdf to editable powerpoint"
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
      "type": "any-file"
    }
  ],
  "engine": "client",
  "seo": {
    "title": "PDF to PowerPoint Online – PDF Text to PPTX",
    "description": "Turn the text of a PDF into editable PowerPoint slides you can restyle. Free, private, no sign-up. Text-only output; images and layout are not copied.",
    "h1": "Convert PDF to PowerPoint"
  },
  "howTo": [
    "Open a PDF that contains selectable text.",
    "The text is split into readable slides.",
    "Download the PPTX and restyle it in your slide app."
  ],
  "faq": [
    {
      "q": "Are images and layout copied?",
      "a": "No. Only the text is exported, paginated across slides, so you can apply your own design."
    },
    {
      "q": "Why does one PDF page become several slides?",
      "a": "Long pages are split so each slide stays readable."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. The slides are generated in your browser."
    },
    {
      "q": "Does it work with scanned PDFs?",
      "a": "Only when the PDF has a text layer. Image-only scans contain no text to export."
    }
  ],
  "related": [
    "docs.pdf-to-word",
    "docs.powerpoint-to-pdf",
    "docs.pdf-to-text",
    "docs.compress-pdf"
  ],
  "legacySlugs": [
    "pdf-to-ppt-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
