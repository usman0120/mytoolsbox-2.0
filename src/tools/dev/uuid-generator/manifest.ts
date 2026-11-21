import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.uuid-generator",
  "space": "dev",
  "category": "generators",
  "slug": "uuid-generator",
  "name": "UUID Generator",
  "tagline": "Generate UUID v4 identifiers.",
  "keywords": [
    "uuid generator",
    "uuid v4",
    "guid generator",
    "unique id"
  ],
  "synonyms": [
    "uuid v4",
    "guid generator",
    "unique id"
  ],
  "jobs": [
    "uuid v4",
    "bulk generation",
    "copy to clipboard"
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
    "title": "UUID Generator – Generate UUID v4 Online",
    "description": "Generate random UUID v4 identifiers. Single or bulk generation in your browser. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "UUID Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. UUID Generator runs in your browser, so your files and text stay on your device."
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
    "dev.hash-generator",
    "dev.password-generator",
    "dev.base64-encoder",
    "dev.ai-regex-builder"
  ],
  "legacySlugs": [
    "uuid-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
