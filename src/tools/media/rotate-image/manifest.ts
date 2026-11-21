import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.rotate-image",
  "space": "media",
  "category": "image-edit",
  "slug": "rotate-image",
  "name": "Image Rotator",
  "tagline": "Rotate and flip images.",
  "keywords": [
    "rotate image",
    "flip image",
    "image rotator",
    "rotate photo"
  ],
  "synonyms": [
    "flip image",
    "image rotator",
    "rotate photo"
  ],
  "jobs": [
    "rotate by any angle",
    "flip horizontal/vertical",
    "live preview"
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
    "title": "Image Rotator – Rotate & Flip Images Online",
    "description": "Rotate images by any angle with live preview. Flip horizontally or vertically. All processing in your browser. Free, private, no sign-up. Runs in your browser.",
    "h1": "Image Rotator"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Can I rotate by a specific angle?",
      "a": "Yes! You can rotate by any angle from 0 to 360 degrees with a live preview."
    },
    {
      "q": "Does rotation affect image quality?",
      "a": "We use high-quality canvas rendering to preserve image quality during rotation."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Image Rotator runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.resize-image",
    "media.crop-image",
    "media.convert-image",
    "media.add-text-to-image"
  ],
  "legacySlugs": [
    "image-rotator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
