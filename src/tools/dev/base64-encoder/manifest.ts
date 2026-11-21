import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.base64-encoder",
  "space": "dev",
  "category": "encode-decode",
  "slug": "base64-encoder",
  "name": "Base64 Encoder/Decoder",
  "tagline": "Encode/decode Base64.",
  "keywords": [
    "base64",
    "base64 encode",
    "base64 decode",
    "base64 encoder"
  ],
  "synonyms": [
    "base64 encode",
    "base64 decode",
    "base64 encoder"
  ],
  "jobs": [
    "encode to base64",
    "decode from base64",
    "file support"
  ],
  "template": "text",
  "input": [],
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
    "title": "Base64 Encoder/Decoder – Encode & Decode Online",
    "description": "Encode text or files to Base64 and decode Base64 back to text, including URL-safe Base64. Free, private and no sign-up. Runs in your browser.",
    "h1": "Base64 Encoder/Decoder"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Base64 Encoder/Decoder runs in your browser, so your files and text stay on your device."
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
    "dev.url-encoder",
    "dev.hash-generator",
    "dev.jwt-decoder",
    "dev.timestamp-converter"
  ],
  "legacySlugs": [
    "base64-encoder"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
