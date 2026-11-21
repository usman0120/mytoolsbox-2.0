import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.proposal-generator",
  "space": "work",
  "category": "business-docs",
  "slug": "proposal-generator",
  "name": "Proposal Generator",
  "tagline": "Create business proposals.",
  "keywords": [
    "proposal generator",
    "business proposal",
    "project proposal",
    "proposal template"
  ],
  "synonyms": [
    "business proposal",
    "project proposal",
    "proposal template"
  ],
  "jobs": [
    "multiple templates",
    "customizable sections",
    "copy & download"
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
    "title": "Proposal Generator – Create Business Proposals Online",
    "description": "Create professional business proposals with customizable templates. Marketing, web development, consulting, and general templates. Free, private, no sign-up.",
    "h1": "Proposal Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Proposal Generator runs in your browser, so your files and text stay on your device."
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
    "work.contract-generator",
    "work.quotation-generator",
    "work.business-name-generator",
    "work.invoice-generator"
  ],
  "legacySlugs": [
    "proposal-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
