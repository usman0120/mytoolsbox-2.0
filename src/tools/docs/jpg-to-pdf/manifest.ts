import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.jpg-to-pdf",
  "space": "docs",
  "category": "convert",
  "slug": "jpg-to-pdf",
  "name": "JPG to PDF",
  "tagline": "Put photos and scans into one PDF.",
  "keywords": [
    "jpg to pdf",
    "image to pdf",
    "png to pdf",
    "photos to pdf"
  ],
  "synonyms": [
    "images to pdf",
    "picture to pdf",
    "scan to pdf"
  ],
  "jobs": [
    "convert photos to one pdf",
    "make a pdf from phone pictures",
    "turn scanned images into a pdf"
  ],
  "template": "file",
  "input": [
    {
      "type": "image",
      "many": true,
      "accept": [
        "image/jpeg",
        "image/png",
        "image/webp"
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
    "title": "JPG to PDF Online – Convert Images to One PDF",
    "description": "Turn JPG, PNG or WebP images into one PDF. Reorder pages, set page size and margins, then download. Free, private, no sign-up; images stay on your device.",
    "h1": "Convert JPG to PDF"
  },
  "howTo": [
    "Add your images, or take photos on your phone.",
    "Reorder them and choose page size and margins.",
    "Create and download the PDF."
  ],
  "faq": [
    {
      "q": "Which image formats work?",
      "a": "JPG, PNG and WebP. Convert HEIC photos to JPG first."
    },
    {
      "q": "Can I change the order of pages?",
      "a": "Yes. Drag images into the order you want before creating the PDF."
    },
    {
      "q": "Are my images uploaded?",
      "a": "No. The PDF is built in your browser, so your photos never leave your device."
    },
    {
      "q": "Can I fit images to A4 or Letter?",
      "a": "Yes. Choose the page size and the images are scaled to fit with the margins you set."
    }
  ],
  "related": [
    "docs.pdf-to-jpg",
    "docs.merge-pdf",
    "docs.compress-pdf",
    "docs.sign-pdf"
  ],
  "legacySlugs": [
    "images-to-pdf",
    "jpg-to-pdf-merger"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
