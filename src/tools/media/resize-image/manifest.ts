import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.resize-image",
  "space": "media",
  "category": "image-edit",
  "slug": "resize-image",
  "name": "Resize Image",
  "tagline": "Change image dimensions in pixels or percent, or use social media presets.",
  "keywords": [
    "resize image",
    "image resizer",
    "change image size",
    "scale image online",
    "photo dimension changer"
  ],
  "synonyms": [
    "image resizer",
    "change image size",
    "scale image online"
  ],
  "jobs": [
    "resize by dimensions",
    "resize by percentage",
    "maintain aspect ratio"
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
    "title": "Resize Image Online – Pixels, Percent & Social Sizes",
    "description": "Resize photos to exact pixels or a percentage, or use presets for Instagram and other social sizes. Keeps proportions by default. Free, private, no upload.",
    "h1": "Resize images"
  },
  "howTo": [
    "Add your image.",
    "Enter a width and height, a percentage, or pick a preset.",
    "Preview the result and download it."
  ],
  "faq": [
    {
      "q": "Will resizing stretch my photo?",
      "a": "Not by default. The aspect ratio is locked, so changing the width updates the height to match. Unlock it only if you want to stretch."
    },
    {
      "q": "What size should I use for Instagram?",
      "a": "Use the Instagram presets: 1080 × 1080 for square posts and 1080 × 1350 for portrait posts."
    },
    {
      "q": "Does making an image bigger add detail?",
      "a": "No. Enlarging can't add detail that isn't there, so large increases look soft. Resizing down keeps images sharp."
    },
    {
      "q": "Are my images uploaded?",
      "a": "No. Resizing happens in your browser."
    }
  ],
  "related": [
    "media.compress-image",
    "media.crop-image",
    "media.convert-image",
    "media.add-text-to-image"
  ],
  "legacySlugs": [
    "image-resizer"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
