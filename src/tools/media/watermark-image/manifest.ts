import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.watermark-image",
  "space": "media",
  "category": "image-edit",
  "slug": "watermark-image",
  "name": "Image Watermarker",
  "tagline": "Add watermarks to images.",
  "keywords": [
    "watermark image",
    "add watermark",
    "image watermark",
    "photo watermark",
    "copyright image"
  ],
  "synonyms": [
    "add watermark",
    "image watermark",
    "photo watermark"
  ],
  "jobs": [
    "text watermarks",
    "image watermarks",
    "adjustable opacity"
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
    "title": "Image Watermarker – Add Watermarks to Photos Online",
    "description": "Add text or image watermarks to your photos. Customize opacity, position, and size. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Image Watermarker"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Can I use my logo as a watermark?",
      "a": "Yes! You can upload any image (PNG with transparency recommended) to use as a watermark."
    },
    {
      "q": "Can I tile the watermark across the image?",
      "a": "Yes, the tile mode repeats your watermark across the entire image for maximum protection."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Image Watermarker runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.add-text-to-image",
    "media.convert-image",
    "media.resize-image",
    "media.auto-enhance-photo"
  ],
  "legacySlugs": [
    "image-watermarker"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
