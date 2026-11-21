import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.http-status-codes",
  "space": "dev",
  "category": "web-seo",
  "slug": "http-status-codes",
  "name": "HTTP Status Reference",
  "tagline": "HTTP status code reference.",
  "keywords": [
    "http status",
    "http status codes",
    "status code reference",
    "http codes"
  ],
  "synonyms": [
    "http status codes",
    "status code reference",
    "http codes"
  ],
  "jobs": [
    "60+ status codes",
    "search by code/keyword",
    "category filtering"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "HTTP Status Reference – All HTTP Status Codes",
    "description": "Look up HTTP status codes with descriptions. Browse all 1xx-5xx codes with search and filtering. Free, private, no sign-up. Runs in your browser.",
    "h1": "HTTP Status Reference"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. HTTP Status Reference runs in your browser, so your files and text stay on your device."
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
    "dev.api-request-tester",
    "dev.json-formatter",
    "dev.color-contrast-checker",
    "dev.color-converter"
  ],
  "legacySlugs": [
    "http-status"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
