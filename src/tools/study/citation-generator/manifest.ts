import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.citation-generator",
  "space": "study",
  "category": "writing-citing",
  "slug": "citation-generator",
  "name": "Citation Generator",
  "tagline": "Generate citations in any format.",
  "keywords": [
    "citation generator",
    "apa citation",
    "mla citation",
    "bibliography"
  ],
  "synonyms": [
    "apa citation",
    "mla citation",
    "bibliography"
  ],
  "jobs": [
    "apa 7th",
    "mla 9th",
    "chicago"
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
    "title": "Citation Generator – APA, MLA, Chicago & More",
    "description": "Generate citations in APA, MLA, Chicago, Harvard, and IEEE formats. Cite books, articles, and websites. Free, private, no sign-up. Runs in your browser.",
    "h1": "Citation Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Citation Generator runs in your browser, so your files and text stay on your device."
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
    "ai.research-assistant",
    "study.pdf-highlighter",
    "study.equation-solver"
  ],
  "legacySlugs": [
    "citation-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
