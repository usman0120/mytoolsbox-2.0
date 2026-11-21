import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "create.barcode-scanner",
  "space": "create",
  "category": "qr-barcodes",
  "slug": "barcode-scanner",
  "name": "Barcode Scanner",
  "tagline": "Scan barcodes with camera or images.",
  "keywords": [
    "barcode scanner",
    "qr scanner",
    "scan barcode",
    "barcode reader",
    "qr code scanner"
  ],
  "synonyms": [
    "qr scanner",
    "scan barcode",
    "barcode reader"
  ],
  "jobs": [
    "camera scanning",
    "image upload scanning",
    "manual code entry"
  ],
  "template": "file",
  "input": [
    {
      "type": "image",
      "accept": [
        "image/jpeg",
        "image/png",
        "image/webp"
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
    "title": "Barcode Scanner – Scan QR & Barcodes Online",
    "description": "Scan barcodes and QR codes using your camera or uploaded images. online barcode scanner with history. Free, private, no sign-up. Runs in your browser.",
    "h1": "Barcode Scanner"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "What barcode formats are supported?",
      "a": "We support QR codes, UPC, EAN, Code 128, Code 39, and many other common barcode formats."
    },
    {
      "q": "Do I need to install anything?",
      "a": "No installation needed! Works directly in your browser using your camera or uploaded images."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Barcode Scanner runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "create.qr-code-generator",
    "create.barcode-generator",
    "media.image-to-text",
    "create.certificate-maker"
  ],
  "legacySlugs": [
    "barcode-scanner"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
