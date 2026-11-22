import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.trim-video",
  "space": "media",
  "category": "video",
  "slug": "trim-video",
  "name": "Trim Video",
  "tagline": "Cut the start and end of a video without uploading it.",
  "keywords": [
    "trim video",
    "cut video",
    "video cutter",
    "shorten video",
    "clip video"
  ],
  "synonyms": [
    "cut video",
    "video cutter",
    "shorten video"
  ],
  "jobs": [
    "trim video",
    "cut video",
    "video cutter"
  ],
  "template": "file",
  "input": [
    {
      "type": "video",
      "accept": [
        "video/mp4",
        "video/quicktime",
        "video/webm",
        "video/x-matroska"
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
    "title": "Trim Video – Cut the Start and End of Any Video, Free",
    "description": "Trim MP4, MOV and WebM videos: set the start and end with a slider or at the playhead, then save as MP4 or WebM. Free, private, runs on your device.",
    "h1": "Trim Video"
  },
  "howTo": [
    "Add a video, or drop it on the page.",
    "Drag the trim handles, or play to a moment and use Start or End at playhead.",
    "Trim, preview, then download."
  ],
  "faq": [
    {
      "q": "How precise is the cut?",
      "a": "To a tenth of a second. Set the start and end at the playhead while the video is paused for the most accurate cut."
    },
    {
      "q": "Does trimming lower the quality?",
      "a": "The video is re-encoded at Best quality by default, which keeps it visually the same."
    },
    {
      "q": "How long does it take?",
      "a": "Usually much faster than the video's length on a laptop, because it uses the device's video hardware. Long or 4K videos take longer on phones."
    },
    {
      "q": "Is my video uploaded?",
      "a": "No. Trim Video runs in your browser using your device's media hardware. The file never leaves your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.compress-video",
    "media.mute-video",
    "media.video-to-gif",
    "media.resize-video"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
