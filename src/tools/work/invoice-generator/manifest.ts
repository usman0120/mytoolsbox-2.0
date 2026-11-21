import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.invoice-generator",
  "space": "work",
  "category": "business-docs",
  "slug": "invoice-generator",
  "name": "Invoice Maker",
  "tagline": "Create professional invoices instantly.",
  "keywords": [
    "invoice maker",
    "invoice generator",
    "free invoice",
    "billing",
    "receipt maker"
  ],
  "synonyms": [
    "invoice generator",
    "free invoice",
    "billing"
  ],
  "jobs": [
    "custom branding",
    "line items",
    "tax calculation"
  ],
  "template": "editor",
  "input": [],
  "output": [
    {
      "type": "pdf",
      "accept": [
        "application/pdf"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Invoice Maker – Professional Invoice Generator",
    "description": "Create professional invoices with custom branding, tax calculations, and PDF export. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Invoice Maker"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "Can I add my company logo?",
      "a": "Yes! Upload your logo and customize colors to match your brand."
    },
    {
      "q": "Does it calculate taxes automatically?",
      "a": "Yes, set your tax rate and it calculates automatically for each line item."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Invoice Maker runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "calc.percentage-calculator",
    "work.business-name-generator",
    "work.contract-generator",
    "work.proposal-generator"
  ],
  "legacySlugs": [
    "invoice-maker"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
