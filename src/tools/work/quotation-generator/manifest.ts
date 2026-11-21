import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.quotation-generator",
  "space": "work",
  "category": "business-docs",
  "slug": "quotation-generator",
  "name": "Quotation Generator",
  "tagline": "Create professional quotations.",
  "keywords": [
    "quotation generator",
    "quote maker",
    "estimate generator",
    "free quotation"
  ],
  "synonyms": [
    "quote maker",
    "estimate generator",
    "free quotation"
  ],
  "jobs": [
    "itemized pricing",
    "tax & discount",
    "multi-currency"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Quotation Generator – Create Professional Quotes Online",
    "description": "Create professional quotations with itemized pricing, tax calculations, and terms. online tool. Free, private, no sign-up. Runs in your browser.",
    "h1": "Quotation Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Quotation Generator runs in your browser, so your files and text stay on your device."
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
    "calc.profit-calculator",
    "work.proposal-generator",
    "work.business-name-generator",
    "work.contract-generator"
  ],
  "legacySlugs": [
    "quotation-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
