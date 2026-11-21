import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.timestamp-converter",
  "space": "dev",
  "category": "encode-decode",
  "slug": "timestamp-converter",
  "name": "Timestamp Converter",
  "tagline": "Convert Unix timestamps to dates.",
  "keywords": [
    "timestamp converter",
    "unix timestamp",
    "epoch converter",
    "date converter"
  ],
  "synonyms": [
    "unix timestamp",
    "epoch converter",
    "date converter"
  ],
  "jobs": [
    "unix to date",
    "date to unix",
    "iso 8601"
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
    "title": "Timestamp Converter – Unix Timestamp to Date",
    "description": "Convert between Unix timestamps and human-readable dates. ISO 8601, UTC, local, and relative formats. Free, private, no sign-up. Runs in your browser.",
    "h1": "Timestamp Converter"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Timestamp Converter runs in your browser, so your files and text stay on your device."
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
    "dev.uuid-generator",
    "dev.hash-generator",
    "dev.base64-encoder",
    "dev.jwt-decoder"
  ],
  "legacySlugs": [
    "timestamp-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
