import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.word-to-pdf",
  "space": "docs",
  "category": "convert",
  "slug": "word-to-pdf",
  "name": "Word to PDF",
  "tagline": "Save Word, ODT, RTF or text documents as PDF.",
  "keywords": [
    "word to pdf",
    "docx to pdf",
    "convert word to pdf",
    "doc to pdf"
  ],
  "synonyms": [
    "docx to pdf",
    "odt to pdf",
    "rtf to pdf"
  ],
  "jobs": [
    "save a word document as pdf",
    "convert docx to pdf without word"
  ],
  "template": "file",
  "input": [
    {
      "type": "docx",
      "accept": [
        ".docx",
        ".doc",
        ".odt",
        ".rtf",
        ".txt"
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
    "title": "Word to PDF Online – Convert DOCX to PDF",
    "description": "Convert Word documents (DOCX, ODT, RTF or TXT) to PDF for sharing and printing. Free, private, no sign-up. Simple layouts convert best; nothing is uploaded.",
    "h1": "Convert Word to PDF"
  },
  "howTo": [
    "Open a Word, ODT, RTF or text file.",
    "Check the preview of the converted document.",
    "Download the PDF."
  ],
  "faq": [
    {
      "q": "Will my formatting be kept?",
      "a": "Headings, paragraphs, lists and basic styling carry over. Complex layouts with text boxes or exotic fonts may look different."
    },
    {
      "q": "Do I need Microsoft Word installed?",
      "a": "No. The document is converted in your browser."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. Conversion happens on your device."
    },
    {
      "q": "Which formats are supported?",
      "a": "DOCX, ODT, RTF and TXT. Old .doc files convert best after saving them as DOCX."
    }
  ],
  "related": [
    "docs.pdf-to-word",
    "docs.text-to-pdf",
    "docs.powerpoint-to-pdf",
    "docs.merge-pdf"
  ],
  "legacySlugs": [
    "word-to-pdf-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
