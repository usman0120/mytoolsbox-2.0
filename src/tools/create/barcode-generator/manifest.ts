import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "create.barcode-generator",
  "space": "create",
  "category": "qr-barcodes",
  "slug": "barcode-generator",
  "name": "Barcode Generator",
  "tagline": "Generate barcodes & QR codes.",
  "keywords": [
    "barcode generator",
    "ean13",
    "upc",
    "code128",
    "barcode maker"
  ],
  "synonyms": [
    "ean13",
    "upc",
    "code128"
  ],
  "jobs": [
    "ean-13",
    "upc-a",
    "code-128"
  ],
  "template": "text",
  "input": [],
  "output": [
    {
      "type": "image",
      "accept": [
        "image/png",
        "image/svg+xml"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Barcode Generator – Create Barcodes Online",
    "description": "Generate EAN-13, UPC-A, Code-128, and more barcode formats. Download as PNG or SVG. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Barcode Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Barcode Generator runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    },
    {
      "q": "Does it work on my phone?",
      "a": "Yes. It works in any modern browser on phones, tablets and computers."
    },
    {
      "q": "Does it work offline?",
      "a": "Once the page has loaded, the tool keeps working without an internet connection."
    }
  ],
  "related": [
    "create.qr-code-generator",
    "create.barcode-scanner",
    "create.certificate-maker",
    "create.color-palette-generator"
  ],
  "legacySlugs": [
    "barcode-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
