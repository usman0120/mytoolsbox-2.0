import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.blur-sharpen-image",
  "space": "media",
  "category": "image-edit",
  "slug": "blur-sharpen-image",
  "name": "Image Blur & Sharpen",
  "tagline": "Blur or sharpen images.",
  "keywords": [
    "blur image",
    "sharpen image",
    "gaussian blur",
    "image sharpener",
    "unblur image"
  ],
  "synonyms": [
    "sharpen image",
    "gaussian blur",
    "image sharpener"
  ],
  "jobs": [
    "gaussian blur",
    "sharpen filter",
    "adjustable intensity"
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
    "title": "Image Blur & Sharpen Tool – Adjust Image Focus Online",
    "description": "Blur or sharpen images with adjustable intensity. Apply Gaussian blur for privacy or sharpen for crisp details. Free, private, no sign-up. Runs in your browser.",
    "h1": "Image Blur & Sharpen"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "What type of blur is used?",
      "a": "We use Gaussian blur which creates a smooth, natural-looking blur effect perfect for privacy and backgrounds."
    },
    {
      "q": "Can I sharpen a blurry photo?",
      "a": "Yes! The sharpen filter enhances edges and details to make images appear crisper and more defined."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Image Blur & Sharpen runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.resize-image",
    "media.convert-image",
    "media.add-text-to-image",
    "media.auto-enhance-photo"
  ],
  "legacySlugs": [
    "image-blur-sharpen"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
