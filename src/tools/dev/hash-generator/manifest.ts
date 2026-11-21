import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.hash-generator",
  "space": "dev",
  "category": "encode-decode",
  "slug": "hash-generator",
  "name": "Hash Generator",
  "tagline": "Generate MD5, SHA hashes.",
  "keywords": [
    "hash generator",
    "md5",
    "sha256",
    "sha512",
    "checksum"
  ],
  "synonyms": [
    "md5",
    "sha256",
    "sha512"
  ],
  "jobs": [
    "md5",
    "sha-1",
    "sha-256"
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
    "title": "Hash Generator – MD5, SHA-1, SHA-256, SHA-512",
    "description": "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes. Verify file integrity in your browser. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Hash Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Hash Generator runs in your browser, so your files and text stay on your device."
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
    "dev.password-generator",
    "dev.jwt-decoder",
    "dev.timestamp-converter"
  ],
  "legacySlugs": [
    "hash-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
