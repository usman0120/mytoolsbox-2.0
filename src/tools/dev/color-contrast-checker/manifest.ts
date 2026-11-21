import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.color-contrast-checker",
  "space": "dev",
  "category": "web-seo",
  "slug": "color-contrast-checker",
  "name": "Color Contrast Checker",
  "tagline": "Check WCAG color contrast ratios.",
  "keywords": [
    "color contrast",
    "wcag",
    "accessibility",
    "contrast checker"
  ],
  "synonyms": [
    "wcag",
    "accessibility",
    "contrast checker"
  ],
  "jobs": [
    "wcag aa/aaa",
    "normal & large text",
    "color picker"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Color Contrast Checker – WCAG Accessibility Tool",
    "description": "Check color contrast ratios for WCAG AA/AAA compliance. Test accessibility of your color combinations. Free, private, no sign-up. Runs in your browser.",
    "h1": "Color Contrast Checker"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Color Contrast Checker runs in your browser, so your files and text stay on your device."
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
    "create.color-palette-generator",
    "dev.json-formatter",
    "dev.api-request-tester",
    "dev.color-converter"
  ],
  "legacySlugs": [
    "color-contrast"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
