import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.url-encoder",
  "space": "dev",
  "category": "encode-decode",
  "slug": "url-encoder",
  "name": "URL Encoder/Decoder",
  "tagline": "Encode/decode URLs.",
  "keywords": [
    "url encoder",
    "url decoder",
    "url encode",
    "url decode"
  ],
  "synonyms": [
    "url decoder",
    "url encode",
    "url decode"
  ],
  "jobs": [
    "url encode",
    "url decode",
    "query string parsing"
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
    "title": "URL Encoder/Decoder – Encode & Decode URLs Online",
    "description": "URL encode and decode text. Handle special characters and query strings. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "URL Encoder/Decoder"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. URL Encoder/Decoder runs in your browser, so your files and text stay on your device."
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
    "dev.base64-encoder",
    "dev.jwt-decoder",
    "dev.hash-generator",
    "dev.timestamp-converter"
  ],
  "legacySlugs": [
    "url-encoder"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
