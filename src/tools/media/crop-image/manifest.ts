import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.crop-image",
  "space": "media",
  "category": "image-edit",
  "slug": "crop-image",
  "name": "Image Cropper",
  "tagline": "Crop images to any size.",
  "keywords": [
    "crop image",
    "image cropper",
    "crop photo"
  ],
  "synonyms": [
    "image cropper",
    "crop photo"
  ],
  "jobs": [
    "freeform crop",
    "aspect ratio presets",
    "rotate"
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
    "title": "Image Cropper – Crop Images Online",
    "description": "Crop images. Use presets or custom aspect ratios. All processing in your browser. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Image Cropper"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Image Cropper runs in your browser, so your files and text stay on your device."
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
    "media.resize-image",
    "media.compress-image",
    "media.rotate-image",
    "media.add-text-to-image"
  ],
  "legacySlugs": [
    "image-cropper"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
