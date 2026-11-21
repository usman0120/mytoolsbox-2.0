import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.lorem-ipsum",
  "space": "dev",
  "category": "generators",
  "slug": "lorem-ipsum",
  "name": "Lorem Ipsum Generator",
  "tagline": "Generate placeholder text.",
  "keywords": [
    "lorem ipsum",
    "placeholder text",
    "dummy text",
    "filler text"
  ],
  "synonyms": [
    "placeholder text",
    "dummy text",
    "filler text"
  ],
  "jobs": [
    "paragraphs",
    "words",
    "sentences"
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
    "title": "Lorem Ipsum Generator – Generate Placeholder Text",
    "description": "Generate Lorem Ipsum placeholder text. Customize paragraphs, words, or bytes. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Lorem Ipsum Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Lorem Ipsum Generator runs in your browser, so your files and text stay on your device."
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
    "dev.ai-regex-builder",
    "dev.ai-sql-assistant"
  ],
  "legacySlugs": [
    "lorem-ipsum"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
