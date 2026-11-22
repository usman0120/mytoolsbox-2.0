import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.resize-video",
  "space": "media",
  "category": "video",
  "slug": "resize-video",
  "name": "Video Resizer",
  "tagline": "Change resolution, or reframe to 9:16, 1:1 or 4:5 for social media.",
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
    "title": "Resize Video – 9:16, 1:1, 4:5 and 720p, Free Online",
    "description": "Resize videos to 1080p, 720p or 480p, or reframe them for stories, reels and feeds in 9:16, 1:1 or 4:5. Runs on your device. Free, no upload.",
    "h1": "Resize Video"
  },
  "howTo": [
    "Add a video, or drop it on the page.",
    "Pick a resolution, or an aspect ratio with Crop to fill or Fit with bars.",
    "Resize, preview, then download."
  ],
  "faq": [
    {
      "q": "What is the difference between Crop to fill and Fit with bars?",
      "a": "Crop to fill fills the new frame and trims the edges. Fit with bars keeps the whole picture and adds black bars."
    },
    {
      "q": "Which sizes should I use for social media?",
      "a": "9:16 for stories, reels and shorts; 1:1 or 4:5 for feed posts; 16:9 for regular video sites."
    },
    {
      "q": "Will it upscale small videos?",
      "a": "No. Resolutions larger than the original are disabled, because upscaling adds file size without adding detail."
    },
    {
      "q": "How long does it take?",
      "a": "Usually much faster than the video's length on a laptop, because it uses the device's video hardware. Long or 4K videos take longer on phones."
    },
    {
      "q": "Is my video uploaded?",
      "a": "No. Resize Video runs in your browser using your device's media hardware. The file never leaves your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.compress-video",
    "media.trim-video",
    "media.convert-video",
    "media.video-editor"
  ],
  "legacySlugs": [
    "video-resizer"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
