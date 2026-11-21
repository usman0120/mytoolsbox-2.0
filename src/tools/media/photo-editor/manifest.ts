import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.photo-editor",
  "space": "media",
  "category": "image-edit",
  "slug": "photo-editor",
  "name": "Image Editor",
  "tagline": "Full-featured browser image editor.",
  "keywords": [
    "image editor",
    "photo editor",
    "online image editor",
    "picture editor",
    "free photo editor"
  ],
  "synonyms": [
    "photo editor",
    "online image editor",
    "picture editor"
  ],
  "jobs": [
    "crop & rotate",
    "filters & effects",
    "text overlays"
  ],
  "template": "editor",
  "input": [],
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
    "title": "Image Editor – Edit Photos in Your Browser",
    "description": "Full-featured image editor with filters, text, drawing, and adjustments. All processing in your browser. Free, private, no sign-up. Runs in your browser.",
    "h1": "Image Editor"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "Are my images uploaded anywhere?",
      "a": "No. All editing happens entirely in your browser. Your images never leave your device."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Image Editor runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    },
    {
      "q": "Does it work on my phone?",
      "a": "Yes. It works in any modern browser on phones, tablets and computers."
    }
  ],
  "related": [
    "media.compress-image",
    "media.resize-image",
    "media.crop-image",
    "media.add-text-to-image"
  ],
  "legacySlugs": [
    "image-editor"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
