import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.pdf-to-word",
  "space": "docs",
  "category": "convert",
  "slug": "pdf-to-word",
  "name": "PDF to Word",
  "tagline": "Export the text of a PDF to an editable Word file.",
  "keywords": [
    "pdf to word",
    "pdf to docx",
    "convert pdf to word",
    "pdf to editable word"
  ],
  "synonyms": [
    "pdf to doc",
    "pdf to excel",
    "pdf to editable text"
  ],
  "jobs": [
    "convert pdf to editable word",
    "get text from pdf into word",
    "export pdf to excel rows"
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
      "type": "docx"
    }
  ],
  "engine": "client",
  "seo": {
    "title": "PDF to Word Online – Export PDF Text to DOCX",
    "description": "Export the text in a PDF to an editable Word document, or to Excel or PowerPoint. Free, private, no sign-up. Works on text PDFs; layout is simplified.",
    "h1": "Convert PDF to Word"
  },
  "howTo": [
    "Open a PDF that contains selectable text.",
    "Choose Word, Excel or PowerPoint.",
    "Download the editable file."
  ],
  "faq": [
    {
      "q": "Will the layout match the original PDF?",
      "a": "No. The text is exported as clean paragraphs; images, columns and exact formatting are not kept. It works best for text you want to edit or reuse."
    },
    {
      "q": "Does it work on scanned PDFs?",
      "a": "Only if the PDF already contains a text layer. Scanned pages without text need OCR first."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. Text is extracted and the Office file is built in your browser."
    },
    {
      "q": "Can I export to Excel instead?",
      "a": "Yes. Choose Excel to get one row per line of text, with page numbers."
    }
  ],
  "related": [
    "docs.pdf-to-text",
    "docs.word-to-pdf",
    "docs.pdf-to-powerpoint",
    "docs.pdf-to-markdown"
  ],
  "legacySlugs": [
    "pdf-to-office-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
