import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.text-annotator",
  "space": "work",
  "category": "text",
  "slug": "text-annotator",
  "name": "Text Annotator",
  "tagline": "Highlight and annotate text.",
  "keywords": [
    "text annotator",
    "highlight text",
    "annotate text",
    "text highlighter",
    "study notes"
  ],
  "synonyms": [
    "highlight text",
    "annotate text",
    "text highlighter"
  ],
  "jobs": [
    "color highlighting",
    "note annotations",
    "hover preview"
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
    "title": "Text Annotator – Highlight & Annotate Text Online",
    "description": "Annotate and highlight text with color-coded markers and notes. Perfect for research and studying. Free, private, no sign-up. Runs in your browser.",
    "h1": "Text Annotator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Can I export my annotations?",
      "a": "Yes! You can export all highlights and notes as a text file."
    },
    {
      "q": "How many colors are available?",
      "a": "There are 6 highlight colors to choose from for color-coding your annotations."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Text Annotator runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "study.pdf-highlighter",
    "work.word-counter",
    "work.summarizer",
    "work.case-converter"
  ],
  "legacySlugs": [
    "text-annotator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
