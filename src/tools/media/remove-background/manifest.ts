import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.remove-background",
  "space": "media",
  "category": "ai-image",
  "slug": "remove-background",
  "name": "Background Remover",
  "tagline": "Remove image backgrounds instantly.",
  "keywords": [
    "remove background",
    "background remover",
    "transparent background",
    "bg remover",
    "remove bg"
  ],
  "synonyms": [
    "background remover",
    "transparent background",
    "bg remover"
  ],
  "jobs": [
    "one-click removal",
    "replace with color",
    "transparent background"
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
        "image/png",
        "image/jpeg",
        "image/webp"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Background Remover – Remove Image Backgrounds Online",
    "description": "Remove image backgrounds with one click. Replace with solid color, transparency, or another image. Free, private, no sign-up. Runs in your browser.",
    "h1": "Background Remover"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "How does background removal work?",
      "a": "We use color threshold analysis to detect and remove backgrounds. Works best on images with clear subject/background separation."
    },
    {
      "q": "Can I replace the background with another image?",
      "a": "Yes! You can replace the removed background with a solid color, transparency, or upload another image."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Background Remover runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.convert-image",
    "media.resize-image",
    "media.watermark-image",
    "media.add-text-to-image"
  ],
  "legacySlugs": [
    "background-remover"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
