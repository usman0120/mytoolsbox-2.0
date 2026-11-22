import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.passport-photo",
  "space": "media",
  "category": "ai-image",
  "slug": "passport-photo",
  "name": "Passport Photo Maker",
  "tagline": "Make a passport or visa photo at the right size, with a print sheet.",
  "keywords": [
    "passport photo",
    "passport photo maker",
    "visa photo",
    "id photo",
    "passport size photo",
    "35x45 photo",
    "2x2 photo",
    "passport photo online"
  ],
  "synonyms": [
    "visa photo",
    "id photo",
    "passport size photo"
  ],
  "jobs": [
    "passport photo at the official size",
    "white or light background",
    "print sheet for 4×6 or A4",
    "photo under a file-size limit"
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
        "image/jpeg"
      ]
    },
    {
      "type": "pdf",
      "accept": [
        "application/pdf"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Passport Photo Maker – 35×45 mm, 2×2 in, Visa & ID Photos",
    "description": "Make passport and visa photos at home: correct size, head position and plain background, plus a print sheet for 4×6 or A4. Free, private, runs on your device.",
    "h1": "Passport Photo Maker"
  },
  "howTo": [
    "Take a photo facing the camera against a plain wall, then add it here.",
    "Pick the country. The background is replaced and the head is sized to the rules automatically.",
    "Check the guides, adjust if needed, then download the photo or a print sheet."
  ],
  "faq": [
    {
      "q": "Which countries are supported?",
      "a": "United States, United Kingdom, Schengen and EU, Canada, Australia, India, Pakistan, China and Japan, plus a custom size. Rules change, so check the official requirements before you submit."
    },
    {
      "q": "How is the head sized?",
      "a": "The tool finds the top of the head and the chin and scales the photo so the head height falls inside the allowed range. The guide lines show where the crown and chin should sit."
    },
    {
      "q": "Is my photo uploaded?",
      "a": "No. Background replacement and cropping run in your browser. The photo never leaves your device."
    },
    {
      "q": "How do I print it?",
      "a": "Download the print sheet PDF for 4×6 in photo paper, A4 or Letter and print at 100% (actual size). Cut along the guide lines."
    },
    {
      "q": "The form needs a photo under a file size limit. Can it do that?",
      "a": "Yes. Set the maximum size in KB and the digital photo is compressed to fit."
    },
    {
      "q": "What makes a photo get rejected?",
      "a": "Shadows on the face or background, glasses glare, a tilted head, hair covering the eyes, or a blurry photo. Use even light and look straight at the camera."
    },
    {
      "q": "Is it free?",
      "a": "Yes. No sign-up, no watermark."
    }
  ],
  "related": [
    "media.remove-background",
    "media.compress-image",
    "media.crop-image",
    "media.resize-image"
  ],
  "legacySlugs": [
    "passport-photo-maker",
    "passport-size-photo"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
