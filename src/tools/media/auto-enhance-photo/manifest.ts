import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.auto-enhance-photo",
  "space": "media",
  "category": "image-edit",
  "slug": "auto-enhance-photo",
  "name": "Auto Enhance Photo",
  "tagline": "One-click photo exposure and color fix.",
  "keywords": [
    "auto enhance photo",
    "photo fixer",
    "fix dark photo",
    "photo enhancer online",
    "improve photo quality",
    "auto color correction"
  ],
  "synonyms": [
    "photo fixer",
    "fix dark photo",
    "photo enhancer online"
  ],
  "jobs": [
    "one-click auto enhance",
    "exposure and contrast fix",
    "color and white balance"
  ],
  "template": "file",
  "input": [
    {
      "type": "image",
      "accept": [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp"
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
    "title": "Auto Enhance Photo Online – One-Click Photo Fixer",
    "description": "Automatically fix exposure, color and sharpness in your photos with one click. Fine-tune with sliders. Free, private, no sign-up. Runs in your browser.",
    "h1": "Auto Enhance Photo"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "What does auto enhance change?",
      "a": "It analyzes brightness, contrast, color balance and sharpness, then applies balanced corrections you can adjust."
    },
    {
      "q": "Do I need editing skills?",
      "a": "No. One click gives a good starting point; sliders are there if you want more control."
    },
    {
      "q": "Is my photo uploaded?",
      "a": "No. All processing happens in your browser, so the photo never leaves your device."
    },
    {
      "q": "Which formats are supported?",
      "a": "JPG, PNG, WebP and BMP. You can download the result as JPG, PNG or WebP."
    }
  ],
  "related": [
    "media.compress-image",
    "media.resize-image",
    "media.crop-image",
    "media.convert-image"
  ],
  "legacySlugs": [
    "auto-enhance-photo"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
