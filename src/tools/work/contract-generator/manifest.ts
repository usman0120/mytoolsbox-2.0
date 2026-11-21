import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.contract-generator",
  "space": "work",
  "category": "business-docs",
  "slug": "contract-generator",
  "name": "Contract Generator",
  "tagline": "Generate contract templates.",
  "keywords": [
    "contract generator",
    "legal document",
    "nda template",
    "service agreement",
    "freelance contract"
  ],
  "synonyms": [
    "legal document",
    "nda template",
    "service agreement"
  ],
  "jobs": [
    "service agreements",
    "nda templates",
    "freelance contracts"
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
    "title": "Contract Generator – Legal Document Templates",
    "description": "Generate legal document templates including service agreements, NDAs, and freelance contracts. Customizable with optional clauses. Free, private, no sign-up.",
    "h1": "Contract Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Contract Generator runs in your browser, so your files and text stay on your device."
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
    "work.quotation-generator",
    "work.business-name-generator",
    "work.invoice-generator"
  ],
  "legacySlugs": [
    "contract-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
