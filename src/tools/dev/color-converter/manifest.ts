import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.color-converter",
  "space": "dev",
  "category": "web-seo",
  "slug": "color-converter",
  "name": "Color Converter",
  "tagline": "Convert between color formats.",
  "keywords": [
    "color converter",
    "hex to rgb",
    "rgb to hsl",
    "color picker"
  ],
  "synonyms": [
    "hex to rgb",
    "rgb to hsl",
    "color picker"
  ],
  "jobs": [
    "hex to rgb",
    "rgb to hsl",
    "color preview"
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
    "title": "Color Converter – HEX, RGB, HSL, CMYK",
    "description": "Convert colors between HEX, RGB, HSL, and CMYK formats. Preview colors and copy values instantly. Free, private, no sign-up. Runs in your browser.",
    "h1": "Color Converter"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Color Converter runs in your browser, so your files and text stay on your device."
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
    "dev.color-contrast-checker",
    "create.color-palette-generator",
    "dev.css-formatter",
    "dev.api-request-tester"
  ],
  "legacySlugs": [
    "color-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
