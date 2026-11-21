import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "create.certificate-maker",
  "space": "create",
  "category": "design",
  "slug": "certificate-maker",
  "name": "Certificate Maker",
  "tagline": "Design professional certificates.",
  "keywords": [
    "certificate maker",
    "award certificate",
    "certificate generator",
    "diploma maker"
  ],
  "synonyms": [
    "award certificate",
    "certificate generator",
    "diploma maker"
  ],
  "jobs": [
    "certificate templates",
    "custom text",
    "logo upload"
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
    "title": "Certificate Maker – Design & Print Certificates",
    "description": "Design professional certificates with templates. Customize text, colors, and logos. Export as PDF. Free, private, no sign-up. Runs in your browser.",
    "h1": "Certificate Maker"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "Can I add my organization's logo?",
      "a": "Yes! Upload your logo and customize colors to match your brand."
    },
    {
      "q": "Can I generate multiple certificates at once?",
      "a": "Yes, use batch mode to generate certificates for a list of names from a CSV or text file."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Certificate Maker runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "work.resume-builder",
    "work.invoice-generator",
    "create.color-palette-generator",
    "create.design"
  ],
  "legacySlugs": [
    "certificate-maker"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
