import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.compress-video",
  "space": "media",
  "category": "video",
  "slug": "compress-video",
  "name": "Video Compressor",
  "tagline": "Reduce video file size online.",
  "keywords": [
    "video compressor",
    "compress video",
    "reduce video size",
    "video optimizer"
  ],
  "synonyms": [
    "compress video",
    "reduce video size",
    "video optimizer"
  ],
  "jobs": [
    "quality presets",
    "resolution adjustment",
    "format conversion"
  ],
  "template": "file",
  "input": [
    {
      "type": "video",
      "accept": [
        "video/mp4",
        "video/webm",
        "video/quicktime"
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
    "title": "Video Compressor – Reduce Video Size Online",
    "description": "Compress video files online. Reduce file size while maintaining quality. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Video Compressor"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "How much can I compress a video?",
      "a": "Depending on the source, you can typically reduce file size by 30-70% while maintaining good quality."
    },
    {
      "q": "What formats are supported?",
      "a": "Import MP4, WebM, and MOV files. Export as MP4 or WebM."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Video Compressor runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.resize-video",
    "media.merge-videos",
    "media.screen-recorder",
    "media.video-editor"
  ],
  "legacySlugs": [
    "video-compressor"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
