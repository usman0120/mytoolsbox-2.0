import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.convert-image",
  "space": "media",
  "category": "image-convert",
  "slug": "convert-image",
  "name": "Image Converter",
  "tagline": "Convert images between formats.",
  "keywords": [
    "convert image",
    "jpg to png",
    "png to jpg",
    "image converter",
    "webp converter",
    "photo format converter"
  ],
  "synonyms": [
    "jpg to png",
    "png to jpg",
    "image converter"
  ],
  "jobs": [
    "jpg to png",
    "png to jpg",
    "webp conversion"
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
    "title": "Image Converter – Convert JPG, PNG, WebP Online",
    "description": "Convert images between formats. JPG, PNG, WebP supported. Fast client-side conversion directly in your browser. Free, private, no sign-up. Runs in your browser.",
    "h1": "Image Converter"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Which image formats can I convert between?",
      "a": "You can convert between JPG, PNG, and WebP seamlessly."
    },
    {
      "q": "Does converting PNG to WebP make file sizes smaller?",
      "a": "Yes, WebP typically provides 25% to 35% smaller file sizes than PNG while preserving transparent backgrounds."
    },
    {
      "q": "Can I convert multiple images at once?",
      "a": "Yes, you can upload multiple pictures and batch convert them to your target format in seconds."
    },
    {
      "q": "Are my converted photos stored on any server?",
      "a": "No, conversions occur completely in your browser memory with 100% privacy."
    }
  ],
  "related": [
    "media.compress-image",
    "media.resize-image",
    "media.image-to-text",
    "media.add-text-to-image"
  ],
  "legacySlugs": [
    "image-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
