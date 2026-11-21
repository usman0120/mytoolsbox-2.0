import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.grayscale-image",
  "space": "media",
  "category": "image-edit",
  "slug": "grayscale-image",
  "name": "Image Grayscale Converter",
  "tagline": "Convert images to grayscale & sepia.",
  "keywords": [
    "grayscale image",
    "black and white",
    "sepia",
    "monochrome",
    "b&w converter"
  ],
  "synonyms": [
    "black and white",
    "sepia",
    "monochrome"
  ],
  "jobs": [
    "grayscale conversion",
    "sepia tone",
    "monochrome filters"
  ],
  "template": "file",
  "input": [
    {
      "type": "image",
      "accept": [
        "image/jpeg",
        "image/png",
        "image/webp"
      ]
    }
  ],
  "output": [
    {
      "type": "image",
      "accept": [
        "image/jpeg",
        "image/png",
        "image/webp"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Image Grayscale Converter – Convert to Black & White Online",
    "description": "Convert images to grayscale, sepia, or monochrome effects. Adjust intensity and apply artistic filters. Free, private, no sign-up. Runs in your browser.",
    "h1": "Image Grayscale Converter"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "What effects are available?",
      "a": "Grayscale (black & white), sepia (warm vintage tone), and custom monochrome with adjustable intensity."
    },
    {
      "q": "Can I preview before downloading?",
      "a": "Yes! A live before/after comparison is shown so you can see the effect before saving."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Image Grayscale Converter runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.convert-image",
    "media.resize-image",
    "media.add-text-to-image",
    "media.auto-enhance-photo"
  ],
  "legacySlugs": [
    "image-grayscale"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
