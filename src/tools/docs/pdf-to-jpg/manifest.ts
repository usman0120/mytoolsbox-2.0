import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.pdf-to-jpg",
  "space": "docs",
  "category": "convert",
  "slug": "pdf-to-jpg",
  "name": "PDF to JPG",
  "tagline": "Turn each PDF page into a JPG or PNG image.",
  "keywords": [
    "pdf to jpg",
    "pdf to png",
    "pdf to image",
    "convert pdf to picture"
  ],
  "synonyms": [
    "pdf to image",
    "pdf to png",
    "save pdf as image"
  ],
  "jobs": [
    "convert pdf to jpg",
    "save a pdf page as an image",
    "turn pdf into png images"
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
      "type": "image",
      "many": true,
      "accept": [
        "image/jpeg",
        "image/png",
        "image/webp"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "PDF to JPG Online – Convert PDF Pages to Images",
    "description": "Convert PDF pages to JPG or PNG images at the quality you choose, then download one page or all of them. Free, private, no sign-up, and no uploads needed.",
    "h1": "Convert PDF to JPG"
  },
  "howTo": [
    "Open a PDF.",
    "Pick JPG or PNG, the quality and which pages.",
    "Download single images or all pages as a ZIP."
  ],
  "faq": [
    {
      "q": "Can I convert only some pages?",
      "a": "Yes. Select the pages you want before converting."
    },
    {
      "q": "JPG or PNG: which should I choose?",
      "a": "JPG makes smaller files and suits photos. PNG keeps sharp text and transparency but is larger."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. Pages are rendered by pdf.js in your browser and never leave your device."
    },
    {
      "q": "What resolution are the images?",
      "a": "You can choose the scale. Higher scales give sharper images and larger files."
    }
  ],
  "related": [
    "docs.jpg-to-pdf",
    "docs.compress-pdf",
    "docs.split-pdf",
    "docs.pdf-to-text"
  ],
  "legacySlugs": [
    "pdf-to-images"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
