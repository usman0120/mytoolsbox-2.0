import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.mime-types",
  "space": "dev",
  "category": "web-seo",
  "slug": "mime-types",
  "name": "MIME Type Lookup",
  "tagline": "Look up MIME types by extension.",
  "keywords": [
    "mime type",
    "mime types",
    "file type",
    "content type"
  ],
  "synonyms": [
    "mime types",
    "file type",
    "content type"
  ],
  "jobs": [
    "extension lookup",
    "mime type search",
    "category browsing"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "MIME Type Lookup – File Extension to MIME Type",
    "description": "Look up MIME types by file extension or search by type. Browse 60+ MIME types across categories. Free, private, no sign-up. Runs in your browser.",
    "h1": "MIME Type Lookup"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. MIME Type Lookup runs in your browser, so your files and text stay on your device."
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
    "dev.http-status-codes",
    "dev.api-request-tester",
    "dev.json-formatter",
    "dev.color-contrast-checker"
  ],
  "legacySlugs": [
    "mime-types"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
