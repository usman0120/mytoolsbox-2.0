import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "create.qr-code-generator",
  "space": "create",
  "category": "qr-barcodes",
  "slug": "qr-code-generator",
  "name": "QR Code Generator",
  "tagline": "QR codes for links, text, Wi-Fi and contacts, with colors and a logo.",
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
    "title": "QR Code Generator – Links, Wi-Fi & vCard, PNG or SVG",
    "description": "Create QR codes for links, text, Wi-Fi networks and contact cards. Add colors and a logo, then download PNG, JPG or SVG. Free, never expires, no sign-up.",
    "h1": "QR code generator"
  },
  "howTo": [
    "Choose what the code is for and enter the details.",
    "Pick colors, add a logo and set error correction.",
    "Download PNG or SVG and test it with your phone camera."
  ],
  "faq": [
    {
      "q": "Do these QR codes expire?",
      "a": "No. The code stores your link or text directly, so it works as long as the link itself works. There is no redirect service in between."
    },
    {
      "q": "Can I add my logo?",
      "a": "Yes. Use a higher error-correction level when adding a logo so the code still scans with part of it covered."
    },
    {
      "q": "PNG or SVG?",
      "a": "SVG stays sharp at any size, so it's best for print. PNG is easiest for sharing online."
    },
    {
      "q": "How do Wi-Fi QR codes work?",
      "a": "Scanning the code offers to join the network with the name and password you entered, without typing the password."
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
