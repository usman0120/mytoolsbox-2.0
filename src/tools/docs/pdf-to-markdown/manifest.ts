import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.pdf-to-markdown",
  "space": "docs",
  "category": "convert",
  "slug": "pdf-to-markdown",
  "name": "PDF to Markdown",
  "tagline": "Convert PDF text into Markdown for notes and docs.",
  "keywords": [
    "pdf to markdown",
    "pdf to md",
    "convert pdf to markdown"
  ],
  "synonyms": [
    "pdf to md"
  ],
  "jobs": [
    "convert pdf notes to markdown",
    "move pdf content into a wiki"
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
      "type": "markdown"
    }
  ],
  "engine": "client",
  "seo": {
    "title": "PDF to Markdown Online – Convert PDF to MD",
    "description": "Convert the text of a PDF into Markdown you can paste into notes, wikis or a README. Free, private, no sign-up. Works on text PDFs; nothing is uploaded.",
    "h1": "Convert PDF to Markdown"
  },
  "howTo": [
    "Open a PDF with selectable text.",
    "The text is converted into Markdown paragraphs.",
    "Copy it or download a .md file."
  ],
  "faq": [
    {
      "q": "How are headings detected?",
      "a": "Short standalone lines are treated as headings where possible; review the result before publishing."
    },
    {
      "q": "Are images converted?",
      "a": "No. Only text is converted."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. Conversion runs in your browser."
    },
    {
      "q": "Does it work with scans?",
      "a": "Only when the PDF has a text layer."
    }
  ],
  "related": [
    "docs.pdf-to-text",
    "docs.pdf-to-word",
    "docs.text-to-pdf",
    "docs.compare-pdf"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
