import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.compress-image",
  "space": "media",
  "category": "image-edit",
  "slug": "compress-image",
  "name": "Compress Image",
  "tagline": "Make JPG, PNG and WebP photos smaller without visible quality loss.",
  "keywords": [
    "compress image",
    "compress jpg",
    "compress png",
    "image compressor",
    "shrink image file size",
    "reduce photo size"
  ],
  "synonyms": [
    "compress jpg",
    "compress png",
    "image compressor"
  ],
  "jobs": [
    "compress jpg/png/webp",
    "quality adjustment",
    "batch processing"
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
    "title": "Compress Image Online – Make JPG, PNG & WebP Smaller",
    "description": "Shrink JPG, PNG and WebP images for email, forms and websites. Pick a quality level, compare before and after, and download. Free, private, no upload.",
    "h1": "Compress images"
  },
  "howTo": [
    "Add one or more photos, or paste a screenshot.",
    "Choose a quality level and output format (JPG, PNG, WebP or AVIF).",
    "Compare the size saved, then download each image or all as a ZIP."
  ],
  "faq": [
    {
      "q": "How much smaller will my photo get?",
      "a": "Phone photos usually shrink by 60–90% at the recommended quality, with no difference you can see on screen. PNG screenshots shrink most when converted to WebP."
    },
    {
      "q": "Can I get a photo under a specific size, like 100 KB?",
      "a": "Lower the quality and try WebP until the size shown is under your limit. For many images at once, the “Email-ready images” Flow checks that every file is under 200 KB."
    },
    {
      "q": "Are my photos uploaded?",
      "a": "No. Compression runs in your browser, so the photos never leave your device."
    },
    {
      "q": "Which format should I choose?",
      "a": "JPG works everywhere. WebP is 25–35% smaller at the same quality and is supported by all modern browsers. Keep PNG for images that need transparency."
    },
    {
      "q": "Does compression remove location data?",
      "a": "Re-encoding the image drops most camera metadata, including GPS location, from the downloaded copy."
    }
  ],
  "related": [
    "media.resize-image",
    "media.convert-image",
    "media.crop-image",
    "media.add-text-to-image"
  ],
  "legacySlugs": [
    "image-compressor"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
