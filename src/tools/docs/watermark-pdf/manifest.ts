import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.watermark-pdf",
  "space": "docs",
  "category": "secure",
  "slug": "watermark-pdf",
  "name": "Watermark PDF",
  "tagline": "Stamp text like DRAFT or CONFIDENTIAL on every page.",
  "keywords": [
    "watermark pdf",
    "add watermark to pdf",
    "stamp pdf",
    "confidential pdf"
  ],
  "synonyms": [
    "stamp",
    "draft watermark"
  ],
  "jobs": [
    "mark a pdf as draft",
    "add confidential watermark"
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
    "title": "Watermark PDF Online – Add Text to Every Page",
    "description": "Add a text watermark such as DRAFT or CONFIDENTIAL to every page of a PDF, with your own size and opacity. Free, private, no sign-up, and nothing is uploaded.",
    "h1": "Add a watermark to a PDF"
  },
  "howTo": [
    "Open the PDF.",
    "Type the watermark text and set size and opacity.",
    "Download the watermarked PDF."
  ],
  "faq": [
    {
      "q": "Can I change the watermark size and transparency?",
      "a": "Yes. Adjust font size and opacity before applying."
    },
    {
      "q": "Is the watermark on every page?",
      "a": "Yes. It is drawn across each page."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. The watermark is added in your browser."
    },
    {
      "q": "Can a watermark be removed later?",
      "a": "It is drawn into the page content, so it is not trivially removable, but it is not a security feature on its own."
    }
  ],
  "related": [
    "docs.sign-pdf",
    "docs.rotate-pdf",
    "docs.compress-pdf",
    "docs.merge-pdf"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
