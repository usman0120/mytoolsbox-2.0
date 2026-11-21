import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.pdf-to-text",
  "space": "docs",
  "category": "convert",
  "slug": "pdf-to-text",
  "name": "PDF to Text",
  "tagline": "Copy all the text out of a PDF.",
  "keywords": [
    "pdf to text",
    "extract text from pdf",
    "pdf to txt",
    "copy text from pdf"
  ],
  "synonyms": [
    "pdf to txt",
    "get text from pdf"
  ],
  "jobs": [
    "copy text from a pdf",
    "save pdf as txt"
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
      "type": "text"
    }
  ],
  "engine": "client",
  "seo": {
    "title": "PDF to Text Online – Extract Text from a PDF",
    "description": "Extract all the text from a PDF to copy or download as a .txt file. Free, private, no sign-up. Works on PDFs with selectable text; nothing is uploaded.",
    "h1": "Extract text from a PDF"
  },
  "howTo": [
    "Open a PDF.",
    "The text of every page is extracted.",
    "Copy it or download a .txt file."
  ],
  "faq": [
    {
      "q": "Why is the result empty?",
      "a": "The PDF is probably a scan with no text layer. Scanned pages need OCR first."
    },
    {
      "q": "Is formatting kept?",
      "a": "No. You get plain text, which is easy to paste anywhere."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. Text is extracted in your browser."
    },
    {
      "q": "Can I extract text from one page only?",
      "a": "Extract the full text, or split the PDF first to keep just the pages you need."
    }
  ],
  "related": [
    "docs.pdf-to-word",
    "docs.pdf-to-markdown",
    "docs.compare-pdf",
    "docs.split-pdf"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
