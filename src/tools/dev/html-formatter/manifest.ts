import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.html-formatter",
  "space": "dev",
  "category": "format-validate",
  "slug": "html-formatter",
  "name": "HTML Formatter",
  "tagline": "Format & minify HTML.",
  "keywords": [
    "html formatter",
    "format html",
    "html beautifier",
    "minify html"
  ],
  "synonyms": [
    "format html",
    "html beautifier",
    "minify html"
  ],
  "jobs": [
    "format html",
    "minify html",
    "custom indent size"
  ],
  "template": "text",
  "input": [],
  "output": [
    {
      "type": "text",
      "accept": [
        "text/html"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "HTML Formatter – Beautify & Minify HTML Online",
    "description": "Format, beautify, and minify HTML code. Clean indentation for better readability. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "HTML Formatter"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. HTML Formatter runs in your browser, so your files and text stay on your device."
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
    "dev.css-formatter",
    "dev.json-formatter",
    "dev.sql-formatter",
    "dev.diff-checker"
  ],
  "legacySlugs": [
    "html-formatter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
