import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.css-formatter",
  "space": "dev",
  "category": "format-validate",
  "slug": "css-formatter",
  "name": "CSS Formatter",
  "tagline": "Format & minify CSS.",
  "keywords": [
    "css formatter",
    "format css",
    "css beautifier",
    "minify css"
  ],
  "synonyms": [
    "format css",
    "css beautifier",
    "minify css"
  ],
  "jobs": [
    "format css",
    "minify css",
    "custom indent size"
  ],
  "template": "text",
  "input": [],
  "output": [
    {
      "type": "text",
      "accept": [
        "text/css"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "CSS Formatter – Beautify & Minify CSS Online",
    "description": "Format, beautify, and minify CSS code. Organize your stylesheets with clean indentation. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "CSS Formatter"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. CSS Formatter runs in your browser, so your files and text stay on your device."
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
    "dev.html-formatter",
    "dev.json-formatter",
    "dev.sql-formatter",
    "dev.diff-checker"
  ],
  "legacySlugs": [
    "css-formatter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
