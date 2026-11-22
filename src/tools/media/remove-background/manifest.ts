import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.remove-background",
  "space": "media",
  "category": "ai-image",
  "slug": "remove-background",
  "name": "Background Remover",
  "tagline": "Cut out people and objects with an AI model that runs on your device.",
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
    "transparent PNG",
    "replace background with a colour",
    "cut out a product photo"
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
    "title": "Remove Background from Image – Free, Private, On-Device",
    "description": "Remove the background from any photo with an AI model that runs in your browser. Transparent PNG or a solid colour. Free, no upload, no sign-up.",
    "h1": "Remove Background from Image"
  },
  "howTo": [
    "Add a photo, or drop it on the page.",
    "Pick Person or Any object. The model downloads once, then works offline.",
    "Choose transparent or a colour, then download."
  ],
  "faq": [
    {
      "q": "How does it work?",
      "a": "An image segmentation model runs inside your browser and estimates which pixels belong to the subject. Your photo is never uploaded."
    },
    {
      "q": "Why does it download a model first?",
      "a": "The model is 7 MB for people and 44 MB for any object. It downloads once, is kept by your browser, and later runs offline."
    },
    {
      "q": "Which mode should I use?",
      "a": "Person is faster and best for portraits and selfies. Any object works for products, pets, cars and other subjects."
    },
    {
      "q": "The edges look rough. What can I do?",
      "a": "Raise Edge cleanup to remove faint halos, or add Softness to blend hair and fur into a new background."
    },
    {
      "q": "Can I use the result commercially?",
      "a": "Yes. The models are licensed Apache-2.0 and the output is your image. There is no watermark."
    },
    {
      "q": "Is it free?",
      "a": "Yes. No sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.passport-photo",
    "create.design",
    "media.resize-image",
    "media.compress-image"
  ],
  "legacySlugs": [
    "background-remover"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
