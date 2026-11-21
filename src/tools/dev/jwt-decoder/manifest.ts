import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.jwt-decoder",
  "space": "dev",
  "category": "encode-decode",
  "slug": "jwt-decoder",
  "name": "JWT Decoder",
  "tagline": "Decode and inspect JWT tokens.",
  "keywords": [
    "jwt decoder",
    "jwt",
    "json web token",
    "decode jwt"
  ],
  "synonyms": [
    "jwt",
    "json web token",
    "decode jwt"
  ],
  "jobs": [
    "decode jwt",
    "view header/payload",
    "expiry check"
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
    "title": "JWT Decoder – Decode JSON Web Tokens Online",
    "description": "Decode a JSON Web Token to inspect its header, payload, claims and expiry time. Free, private, no sign-up; the token never leaves your browser.",
    "h1": "JWT Decoder"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. JWT Decoder runs in your browser, so your files and text stay on your device."
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
    "dev.json-formatter",
    "dev.hash-generator",
    "dev.timestamp-converter"
  ],
  "legacySlugs": [
    "jwt-decoder"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
