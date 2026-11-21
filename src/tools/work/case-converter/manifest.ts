import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.case-converter",
  "space": "work",
  "category": "text",
  "slug": "case-converter",
  "name": "Case Converter",
  "tagline": "Convert text case.",
  "keywords": [
    "case converter",
    "uppercase",
    "lowercase",
    "title case",
    "convert case"
  ],
  "synonyms": [
    "uppercase",
    "lowercase",
    "title case"
  ],
  "jobs": [
    "uppercase",
    "lowercase",
    "title case"
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
    "title": "Case Converter – Convert Text Case Online",
    "description": "Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase and more in one click. Free, private, no sign-up. Runs in your browser.",
    "h1": "Case Converter"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Case Converter runs in your browser, so your files and text stay on your device."
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
    "work.word-counter",
    "work.text-cleaner",
    "work.grammar-checker",
    "work.paraphraser"
  ],
  "legacySlugs": [
    "case-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
