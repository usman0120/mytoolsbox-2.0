import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.text-to-pdf",
  "space": "docs",
  "category": "convert",
  "slug": "text-to-pdf",
  "name": "Text to PDF",
  "tagline": "Turn plain text or Markdown into a clean PDF.",
  "keywords": [
    "text to pdf",
    "txt to pdf",
    "markdown to pdf",
    "convert notes to pdf"
  ],
  "synonyms": [
    "txt to pdf",
    "md to pdf"
  ],
  "jobs": [
    "save notes as pdf",
    "convert markdown to pdf"
  ],
  "template": "file",
  "input": [
    {
      "type": "text"
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
    "title": "Text to PDF Online – Convert TXT or Markdown",
    "description": "Turn plain text or Markdown into a neatly formatted PDF with your font size, margins and page numbers. Free, private, no sign-up; nothing is uploaded.",
    "h1": "Convert text to PDF"
  },
  "howTo": [
    "Paste text or open a .txt or .md file.",
    "Set font size, margins and page numbers.",
    "Download the PDF."
  ],
  "faq": [
    {
      "q": "Does it support Markdown?",
      "a": "Yes. Headings, lists, bold and italic text are formatted in the PDF."
    },
    {
      "q": "Can I add page numbers?",
      "a": "Yes. Turn on page numbers in the options."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. The PDF is created in your browser."
    },
    {
      "q": "Which page sizes are available?",
      "a": "A4 and Letter, with adjustable margins."
    }
  ],
  "related": [
    "docs.word-to-pdf",
    "docs.text-to-word",
    "docs.merge-pdf",
    "docs.pdf-to-text"
  ],
  "legacySlugs": [
    "text-to-pdf"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
