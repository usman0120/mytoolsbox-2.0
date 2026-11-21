import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.diff-checker",
  "space": "dev",
  "category": "format-validate",
  "slug": "diff-checker",
  "name": "Diff Checker",
  "tagline": "Compare text differences.",
  "keywords": [
    "diff checker",
    "text compare",
    "diff tool",
    "compare text"
  ],
  "synonyms": [
    "text compare",
    "diff tool",
    "compare text"
  ],
  "jobs": [
    "line-by-line diff",
    "character diff",
    "side-by-side view"
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
    "title": "Diff Checker – Compare Text Online",
    "description": "Compare two texts and find differences. Line-by-line and character-level diff. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Diff Checker"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Diff Checker runs in your browser, so your files and text stay on your device."
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
    "dev.regex-tester",
    "dev.css-formatter",
    "dev.html-formatter"
  ],
  "legacySlugs": [
    "diff-checker"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
