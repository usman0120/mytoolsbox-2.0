import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.convert-video",
  "space": "media",
  "category": "video",
  "slug": "convert-video",
  "name": "Convert Video",
  "tagline": "Convert MOV, MKV and WebM to MP4, or MP4 to WebM.",
  "keywords": [
    "convert video",
    "mov to mp4",
    "mkv to mp4",
    "webm to mp4",
    "mp4 to webm",
    "video converter"
  ],
  "synonyms": [
    "mov to mp4",
    "mkv to mp4",
    "webm to mp4"
  ],
  "jobs": [
    "convert video",
    "mov to mp4",
    "mkv to mp4"
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
    "title": "Video Converter – MOV, MKV, WebM to MP4 and Back, Free",
    "description": "Convert MOV, MKV and WebM videos to MP4 that plays everywhere, or MP4 to WebM for the web. Change resolution too. Free, private, runs on your device.",
    "h1": "Convert Video"
  },
  "howTo": [
    "Add a video, or drop it on the page.",
    "Choose MP4 or WebM, and optionally a lower resolution.",
    "Convert, preview, then download."
  ],
  "faq": [
    {
      "q": "Which format should I choose?",
      "a": "MP4 (H.264) plays on almost every phone, computer and website. WebM is often smaller and suits web pages."
    },
    {
      "q": "Can it convert iPhone MOV videos?",
      "a": "Yes. MOV files from phones convert to MP4. HEVC (H.265) videos need a browser that can decode HEVC, such as Safari, Chrome or Edge on most devices."
    },
    {
      "q": "How long does it take?",
      "a": "Usually much faster than the video's length on a laptop, because it uses the device's video hardware. Long or 4K videos take longer on phones."
    },
    {
      "q": "Is my video uploaded?",
      "a": "No. Convert Video runs in your browser using your device's media hardware. The file never leaves your device."
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
    "media.trim-video"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
