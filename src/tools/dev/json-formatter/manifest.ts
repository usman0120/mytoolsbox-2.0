import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.json-formatter",
  "space": "dev",
  "category": "format-validate",
  "slug": "json-formatter",
  "name": "JSON Formatter",
  "tagline": "Format and validate JSON.",
  "keywords": [
    "json formatter",
    "format json",
    "json beautifier",
    "json validator"
  ],
  "synonyms": [
    "format json",
    "json beautifier",
    "json validator"
  ],
  "jobs": [
    "format json",
    "validate json",
    "tree view"
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
      "type": "json",
      "accept": [
        "application/json"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "JSON Formatter – Format & Validate JSON Online",
    "description": "Format, validate, and beautify JSON data. Tree view, error highlighting, and minification. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "JSON Formatter"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. JSON Formatter runs in your browser, so your files and text stay on your device."
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
    "dev.json-validator",
    "dev.css-formatter",
    "dev.diff-checker",
    "dev.html-formatter"
  ],
  "legacySlugs": [
    "json-formatter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
