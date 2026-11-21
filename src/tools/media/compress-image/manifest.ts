import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.compress-image",
  "space": "media",
  "category": "image-edit",
  "slug": "compress-image",
  "name": "Image Compressor",
  "tagline": "Compress images without quality loss.",
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
    "title": "Image Compressor – Compress JPG, PNG, WebP Online",
    "description": "Compress images without quality loss. JPG, PNG, WebP supported. 100% private in-browser compression with zero uploads. Free, private, no sign-up.",
    "h1": "Image Compressor"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Will compression reduce image quality?",
      "a": "Our compressor uses smart perceptual algorithms to minimize quality loss while maximizing size reduction. You can adjust the quality slider to find your preferred balance."
    },
    {
      "q": "How does browser-based image compression work?",
      "a": "Using HTML5 Canvas and modern WebAssembly codecs, your images are compressed and re-encoded locally without sending files to remote servers."
    },
    {
      "q": "Can I compress images in batch mode?",
      "a": "Yes, you can drop multiple JPG, PNG, and WebP files to compress all of them simultaneously directly in your browser."
    },
    {
      "q": "Are watermarks added to compressed pictures?",
      "a": "Never. All tools on MyToolsBox are 100% free with zero watermarks or image restrictions."
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
