import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.text-to-word",
  "space": "docs",
  "category": "convert",
  "slug": "text-to-word",
  "name": "Text to Word",
  "tagline": "Turn plain text into a formatted Word document.",
  "keywords": [
    "txt to docx",
    "text to word",
    "convert txt to word",
    "plain text to docx"
  ],
  "synonyms": [
    "txt to doc",
    "notes to word"
  ],
  "jobs": [
    "convert a txt file to word",
    "make a docx from plain text"
  ],
  "template": "file",
  "input": [
    {
      "type": "text"
    }
  ],
  "output": [
    {
      "type": "docx"
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Text to Word Online – Convert TXT to DOCX",
    "description": "Convert plain text into a Word (DOCX) document with your choice of font, size, margins and line spacing. Free, private, no sign-up; nothing is uploaded.",
    "h1": "Convert text to Word"
  },
  "howTo": [
    "Paste text or open a .txt file.",
    "Pick font, size, margins and spacing.",
    "Download the DOCX."
  ],
  "faq": [
    {
      "q": "Can I edit the result in Word or Google Docs?",
      "a": "Yes. The output is a standard DOCX file that opens in Word, Google Docs and LibreOffice."
    },
    {
      "q": "Are paragraphs kept?",
      "a": "Yes. Blank lines become paragraph breaks."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. The document is built in your browser."
    },
    {
      "q": "Is there a size limit?",
      "a": "No fixed limit; very long texts depend on your device memory."
    }
  ],
  "related": [
    "docs.text-to-pdf",
    "docs.word-to-pdf",
    "docs.pdf-to-word",
    "docs.csv-to-excel"
  ],
  "legacySlugs": [
    "txt-to-docx"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
