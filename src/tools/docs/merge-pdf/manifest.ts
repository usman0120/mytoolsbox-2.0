import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.merge-pdf",
  "space": "docs",
  "category": "organize",
  "slug": "merge-pdf",
  "name": "Merge PDF",
  "tagline": "Combine several PDFs into one file, in the order you choose.",
  "keywords": [
    "merge pdf",
    "combine pdf",
    "join pdf files",
    "pdf merger"
  ],
  "synonyms": [
    "combine",
    "join",
    "append pdf"
  ],
  "jobs": [
    "combine pdfs into one",
    "merge two pdf files",
    "join scanned pages into one pdf"
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
      "type": "pdf",
      "accept": [
        "application/pdf"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Merge PDF Files Online – Combine PDFs in Order",
    "description": "Combine PDF files into one document in seconds. Drag to reorder, then download. Free, private, no sign-up: your files never leave this device.",
    "h1": "Merge PDF files"
  },
  "howTo": [
    "Add two or more PDF files, or drop them on the page.",
    "Drag the files into the order you want.",
    "Merge and download one combined PDF."
  ],
  "faq": [
    {
      "q": "Is there a limit on how many PDFs I can merge?",
      "a": "There is no fixed limit. Very large batches depend on your device memory; most laptops and phones handle dozens of files easily."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. Merging runs in your browser with pdf-lib, so the files stay on your device."
    },
    {
      "q": "Will the merged PDF keep quality?",
      "a": "Yes. Pages are copied as they are, so text, images and links keep their original quality."
    },
    {
      "q": "Can I merge password-protected PDFs?",
      "a": "Not yet. Remove the password first with the app that created the file, then merge."
    }
  ],
  "related": [
    "docs.split-pdf",
    "docs.compress-pdf",
    "docs.jpg-to-pdf",
    "docs.rotate-pdf"
  ],
  "legacySlugs": [
    "pdf-merger"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
