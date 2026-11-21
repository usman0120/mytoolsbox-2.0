import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "create.color-palette-generator",
  "space": "create",
  "category": "design",
  "slug": "color-palette-generator",
  "name": "Color Palette Generator",
  "tagline": "Generate beautiful color palettes.",
  "keywords": [
    "color palette",
    "color scheme",
    "color generator",
    "design colors"
  ],
  "synonyms": [
    "color scheme",
    "color generator",
    "design colors"
  ],
  "jobs": [
    "multiple harmony rules",
    "copy hex codes",
    "export palette"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Color Palette Generator – Design Color Schemes",
    "description": "Generate beautiful color palettes using color theory. Complementary, analogous, triadic, and monochromatic schemes. Free, private, no sign-up.",
    "h1": "Color Palette Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Color Palette Generator runs in your browser, so your files and text stay on your device."
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
    "create.certificate-maker",
    "create.design",
    "create.presentation-maker",
    "create.barcode-generator"
  ],
  "legacySlugs": [
    "color-palette"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
