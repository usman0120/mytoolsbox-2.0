import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.json-validator",
  "space": "dev",
  "category": "format-validate",
  "slug": "json-validator",
  "name": "JSON Validator",
  "tagline": "Validate JSON syntax.",
  "keywords": [
    "json validator",
    "validate json",
    "check json",
    "json syntax"
  ],
  "synonyms": [
    "validate json",
    "check json",
    "json syntax"
  ],
  "jobs": [
    "syntax validation",
    "error location",
    "line numbers"
  ],
  "template": "file",
  "input": [
    {
      "type": "json",
      "accept": [
        "application/json"
      ]
    }
  ],
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
    "title": "JSON Validator – Check JSON Syntax Online",
    "description": "Validate JSON syntax. Get detailed error messages and fix issues quickly. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "JSON Validator"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. JSON Validator runs in your browser, so your files and text stay on your device."
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
    "dev.json-formatter",
    "dev.css-formatter",
    "dev.diff-checker",
    "dev.html-formatter"
  ],
  "legacySlugs": [
    "json-validator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
