import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.word-counter",
  "space": "work",
  "category": "text",
  "slug": "word-counter",
  "name": "Word Counter",
  "tagline": "Count words and characters.",
  "keywords": [
    "word counter",
    "count words",
    "character count",
    "word count"
  ],
  "synonyms": [
    "count words",
    "character count",
    "word count"
  ],
  "jobs": [
    "word count",
    "character count",
    "sentence count"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Word Counter – Count Words & Characters Online",
    "description": "Count words, characters, sentences and paragraphs, and estimate reading and speaking time as you type. Free, private, no sign-up. Works offline.",
    "h1": "Word Counter"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Word Counter runs in your browser, so your files and text stay on your device."
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
    "work.case-converter",
    "work.text-cleaner",
    "work.grammar-checker",
    "work.paraphraser"
  ],
  "legacySlugs": [
    "word-counter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
