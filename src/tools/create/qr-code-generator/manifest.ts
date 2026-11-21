import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "create.qr-code-generator",
  "space": "create",
  "category": "qr-barcodes",
  "slug": "qr-code-generator",
  "name": "QR Code Generator",
  "tagline": "Generate customizable QR codes.",
  "keywords": [
    "qr code",
    "qr generator",
    "generate qr",
    "qr code maker"
  ],
  "synonyms": [
    "qr generator",
    "generate qr",
    "qr code maker"
  ],
  "jobs": [
    "url qr codes",
    "text qr codes",
    "wifi qr codes"
  ],
  "template": "text",
  "input": [],
  "output": [
    {
      "type": "image",
      "accept": [
        "image/png"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "QR Code Generator – Create QR Codes Online",
    "description": "Generate free QR codes for URLs, text, WiFi, and more. Customize colors and download as PNG. Free, private, no sign-up. Runs in your browser.",
    "h1": "QR Code Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. QR Code Generator runs in your browser, so your files and text stay on your device."
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
    "create.barcode-generator",
    "create.barcode-scanner",
    "create.certificate-maker",
    "create.color-palette-generator"
  ],
  "legacySlugs": [
    "qr-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
