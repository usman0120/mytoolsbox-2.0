import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.video-editor",
  "space": "media",
  "category": "video",
  "slug": "video-editor",
  "name": "Video Editor",
  "tagline": "Browser-based video editing suite.",
  "keywords": [
    "video editor",
    "trim video",
    "video cutter",
    "merge videos",
    "video converter",
    "extract audio",
    "gif maker",
    "video compressor"
  ],
  "synonyms": [
    "trim video",
    "video cutter",
    "merge videos"
  ],
  "jobs": [
    "trim & cut",
    "merge videos",
    "resize & crop"
  ],
  "template": "editor",
  "input": [],
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
    "title": "Video Editor – Trim, Merge, Convert & Edit Videos Online",
    "description": "Complete video editing toolkit in your browser. All processing is local. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Video Editor"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "Is there a file size limit?",
      "a": "Since processing is local, limits depend on your device's memory. For best results, keep files under 500MB."
    },
    {
      "q": "Can I convert video formats?",
      "a": "Yes! Convert between MP4, WebM, OGG, AVI, and MOV formats right in your browser."
    },
    {
      "q": "How does audio extraction work?",
      "a": "The Extract Audio tool uses your browser's built-in media capabilities to separate the audio track from your video."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Video Editor runs in your browser, so your files and text stay on your device."
    }
  ],
  "related": [
    "media.photo-editor",
    "media.compress-video",
    "media.merge-videos",
    "media.resize-video"
  ],
  "legacySlugs": [
    "video-editor"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
