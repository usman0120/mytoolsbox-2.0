import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.pdf-highlighter",
  "space": "study",
  "category": "writing-citing",
  "slug": "pdf-highlighter",
  "name": "PDF Highlighter & Notes",
  "tagline": "Highlight PDFs and add notes.",
  "keywords": [
    "pdf highlighter",
    "pdf notes",
    "annotate pdf",
    "pdf annotation",
    "highlight pdf"
  ],
  "synonyms": [
    "pdf notes",
    "annotate pdf",
    "pdf annotation"
  ],
  "jobs": [
    "pdf text extraction",
    "color highlighting",
    "note annotations"
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
      "type": "text",
      "accept": [
        "text/plain"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "PDF Highlighter & Notes – Annotate PDFs Online",
    "description": "Highlight PDF text and add notes. Extract, annotate, and export your highlights. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "PDF Highlighter & Notes"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "What types of PDFs are supported?",
      "a": "Text-based PDFs work best. Scanned or image-based PDFs may not be extractable."
    },
    {
      "q": "Is there a file size limit?",
      "a": "Files up to 50MB are supported. Larger files may take longer to process."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. PDF Highlighter & Notes runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "work.text-annotator",
    "study.citation-generator",
    "study.equation-solver",
    "study.flashcards"
  ],
  "legacySlugs": [
    "pdf-highlighter-notes"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
