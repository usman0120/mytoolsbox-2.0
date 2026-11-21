import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.api-request-tester",
  "space": "dev",
  "category": "web-seo",
  "slug": "api-request-tester",
  "name": "API Request Builder",
  "tagline": "Build & send HTTP requests.",
  "keywords": [
    "api request",
    "http request",
    "api tester",
    "rest client"
  ],
  "synonyms": [
    "http request",
    "api tester",
    "rest client"
  ],
  "jobs": [
    "all http methods",
    "custom headers",
    "request body"
  ],
  "template": "text",
  "input": [],
  "output": [
    {
      "type": "json",
      "accept": [
        "application/json"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "API Request Builder – Test HTTP Requests Online",
    "description": "Build and send HTTP requests. Support for all methods, custom headers, and response inspection. Free, private, no sign-up. Runs in your browser.",
    "h1": "API Request Builder"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. API Request Builder runs in your browser, so your files and text stay on your device."
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
    "dev.json-formatter",
    "dev.color-contrast-checker",
    "dev.color-converter"
  ],
  "legacySlugs": [
    "api-request-builder"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
