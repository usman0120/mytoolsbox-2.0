import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.regex-tester",
  "space": "dev",
  "category": "format-validate",
  "slug": "regex-tester",
  "name": "Regex Tester",
  "tagline": "Test regex patterns in real-time.",
  "keywords": [
    "regex tester",
    "regex",
    "regular expression",
    "test regex"
  ],
  "synonyms": [
    "regex",
    "regular expression",
    "test regex"
  ],
  "jobs": [
    "real-time matching",
    "match highlighting",
    "group extraction"
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
    "title": "Regex Tester – Test Regular Expressions Online",
    "description": "Test regex patterns in real-time with highlighting and group extraction. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Regex Tester"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Regex Tester runs in your browser, so your files and text stay on your device."
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
    "dev.diff-checker",
    "dev.markdown-editor",
    "dev.css-formatter"
  ],
  "legacySlugs": [
    "regex-tester"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
