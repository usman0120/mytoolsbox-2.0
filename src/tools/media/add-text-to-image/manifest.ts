import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.add-text-to-image",
  "space": "media",
  "category": "image-edit",
  "slug": "add-text-to-image",
  "name": "Image Text Overlay",
  "tagline": "Add text to images.",
  "keywords": [
    "text overlay",
    "add text to image",
    "image caption",
    "meme maker",
    "photo text"
  ],
  "synonyms": [
    "add text to image",
    "image caption",
    "meme maker"
  ],
  "jobs": [
    "custom text",
    "font size & color",
    "opacity control"
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
    "title": "Image Text Overlay – Add Text to Images Online",
    "description": "Add custom text to images with font, size, color, opacity, and position control. Perfect for memes and social media. Free, private, no sign-up.",
    "h1": "Image Text Overlay"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Can I add multiple text layers?",
      "a": "Yes! You can add multiple text overlays with different styles, positions, and rotations."
    },
    {
      "q": "What fonts are available?",
      "a": "All system fonts available in your browser are supported, including bold, italic, and custom sizes."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Image Text Overlay runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.watermark-image",
    "media.convert-image",
    "media.resize-image",
    "media.auto-enhance-photo"
  ],
  "legacySlugs": [
    "image-text-overlay"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
