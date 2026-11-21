import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.resize-image",
  "space": "media",
  "category": "image-edit",
  "slug": "resize-image",
  "name": "Image Resizer",
  "tagline": "Resize images to any dimensions.",
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
    "title": "Image Resizer – Resize Images Online (Pixels & Percentage)",
    "description": "Resize images online. Set exact pixel dimensions or percentage with aspect ratio lock. 100% client-side privacy. Free, private, no sign-up. Works on any device.",
    "h1": "Image Resizer"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Can I resize images by exact pixel dimensions?",
      "a": "Yes, you can specify custom width and height in pixels or scale by percentage, with an optional aspect ratio lock."
    },
    {
      "q": "Will resizing an image reduce its clarity?",
      "a": "High-quality bicubic interpolation is used to ensure sharp results when scaling down or adjusting aspect ratios."
    },
    {
      "q": "Can I resize photos for social media headers and posts?",
      "a": "Yes, you can input exact dimensions for YouTube thumbnails, Instagram posts, Twitter banners, or LinkedIn headers."
    },
    {
      "q": "Do my photos get uploaded to a server when resizing?",
      "a": "No. The entire resizing process happens directly inside your web browser using HTML5 Canvas."
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
