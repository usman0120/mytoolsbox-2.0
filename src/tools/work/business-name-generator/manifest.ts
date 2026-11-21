import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.business-name-generator",
  "space": "work",
  "category": "business-docs",
  "slug": "business-name-generator",
  "name": "Business Name Generator",
  "tagline": "Generate business name ideas.",
  "keywords": [
    "business name generator",
    "company name ideas",
    "startup name",
    "brand name generator"
  ],
  "synonyms": [
    "company name ideas",
    "startup name",
    "brand name generator"
  ],
  "jobs": [
    "industry-specific names",
    "multiple patterns",
    "copy to clipboard"
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
    "title": "Business Name Generator – Creative Name Ideas",
    "description": "Generate creative and catchy business name ideas for your startup. Industry-specific suggestions with one-click copy. Free, private, no sign-up.",
    "h1": "Business Name Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Business Name Generator runs in your browser, so your files and text stay on your device."
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
    "work.proposal-generator",
    "work.social-media-post-generator",
    "work.contract-generator",
    "work.invoice-generator"
  ],
  "legacySlugs": [
    "business-name-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
