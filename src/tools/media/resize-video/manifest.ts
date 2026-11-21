import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.resize-video",
  "space": "media",
  "category": "video",
  "slug": "resize-video",
  "name": "Video Resizer",
  "tagline": "Change video dimensions online.",
  "keywords": [
    "video resizer",
    "resize video",
    "change video size",
    "video dimensions",
    "scale video"
  ],
  "synonyms": [
    "resize video",
    "change video size",
    "video dimensions"
  ],
  "jobs": [
    "dimension presets",
    "percentage scaling",
    "aspect ratio lock"
  ],
  "template": "file",
  "input": [
    {
      "type": "video",
      "accept": [
        "video/mp4",
        "video/webm"
      ]
    }
  ],
  "output": [
    {
      "type": "video",
      "accept": [
        "video/mp4",
        "video/webm"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Video Resizer – Resize Videos Online",
    "description": "Resize video dimensions online. Scale by percentage or set exact dimensions. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Video Resizer"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "What dimensions can I resize to?",
      "a": "You can choose from common presets (1080p, 720p, 480p) or set custom dimensions."
    },
    {
      "q": "Will resizing affect quality?",
      "a": "Downscaling maintains good quality. Upscaling may result in some quality loss."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Video Resizer runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.compress-video",
    "media.merge-videos",
    "media.screen-recorder",
    "media.video-editor"
  ],
  "legacySlugs": [
    "video-resizer"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
