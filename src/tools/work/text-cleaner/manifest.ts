import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.text-cleaner",
  "space": "work",
  "category": "text",
  "slug": "text-cleaner",
  "name": "Text Cleaner",
  "tagline": "Clean and format text.",
  "keywords": [
    "text cleaner",
    "clean text",
    "remove spaces",
    "strip html"
  ],
  "synonyms": [
    "clean text",
    "remove spaces",
    "strip html"
  ],
  "jobs": [
    "remove extra spaces",
    "remove line breaks",
    "strip html"
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
    "title": "Text Cleaner – Clean & Format Text Online",
    "description": "Clean up text by removing extra spaces, line breaks, HTML tags, and more. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Text Cleaner"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Text Cleaner runs in your browser, so your files and text stay on your device."
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
    "work.case-converter",
    "work.grammar-checker",
    "work.paraphraser"
  ],
  "legacySlugs": [
    "text-cleaner"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
