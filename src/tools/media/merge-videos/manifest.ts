import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.merge-videos",
  "space": "media",
  "category": "video",
  "slug": "merge-videos",
  "name": "Merge Videos",
  "tagline": "Combine multiple videos into one.",
  "keywords": [
    "merge videos",
    "combine videos",
    "video joiner",
    "video merger",
    "concatenate videos"
  ],
  "synonyms": [
    "combine videos",
    "video joiner",
    "video merger"
  ],
  "jobs": [
    "multi-video merging",
    "drag & drop reorder",
    "trim clips"
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
    "title": "Video Merger – Combine Videos Online",
    "description": "Join several video clips into one file. Reorder and trim the clips, then export the result. Free, private, no sign-up. Runs in your browser.",
    "h1": "Merge Videos"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "How many videos can I merge?",
      "a": "You can merge up to 10 video clips at once. For best performance, keep total size under 1GB."
    },
    {
      "q": "Will the output quality match the input?",
      "a": "Yes, the merger preserves the quality of your source videos."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Merge Videos runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.compress-video",
    "media.resize-video",
    "media.extract-audio",
    "media.screen-recorder"
  ],
  "legacySlugs": [
    "merge-videos"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
