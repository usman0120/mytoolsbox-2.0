import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.compress-video",
  "space": "media",
  "category": "video",
  "slug": "compress-video",
  "name": "Video Compressor",
  "tagline": "Make videos smaller for email and messaging, or hit an exact file size.",
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
    "title": "Compress Video – Reduce MP4 Size to a Target MB, Free",
    "description": "Compress MP4, MOV and WebM videos to a smaller size or an exact target like 10 MB. Runs on your device's video hardware. Free, private, no upload.",
    "h1": "Compress Video"
  },
  "howTo": [
    "Add a video, or drop it on the page.",
    "Choose a quality, or switch to Target size and enter the size in MB.",
    "Compress, compare the size, then download."
  ],
  "faq": [
    {
      "q": "How small can it get?",
      "a": "Most phone videos shrink by 50–80% at Balanced quality. With Target size you choose the size, and the quality adjusts to fit it."
    },
    {
      "q": "Which formats work?",
      "a": "Open MP4, MOV, WebM and MKV. Save as MP4 (plays everywhere) or WebM."
    },
    {
      "q": "How long does it take?",
      "a": "Usually much faster than the video's length on a laptop, because it uses the device's video hardware. Long or 4K videos take longer on phones."
    },
    {
      "q": "Can I cut the video too?",
      "a": "Yes. Set the start and end with the trim slider before compressing, which also makes the file smaller."
    },
    {
      "q": "Is my video uploaded?",
      "a": "No. Compress Video runs in your browser using your device's media hardware. The file never leaves your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.trim-video",
    "media.resize-video",
    "media.convert-video",
    "media.video-to-gif"
  ],
  "legacySlugs": [
    "video-compressor"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
