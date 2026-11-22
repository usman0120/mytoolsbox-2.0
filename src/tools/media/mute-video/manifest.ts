import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.mute-video",
  "space": "media",
  "category": "video",
  "slug": "mute-video",
  "name": "Mute Video",
  "tagline": "Remove the sound from a video and keep the picture.",
  "keywords": [
    "mute video",
    "remove audio from video",
    "silent video",
    "remove sound from video"
  ],
  "synonyms": [
    "remove audio from video",
    "silent video",
    "remove sound from video"
  ],
  "jobs": [
    "mute video",
    "remove audio from video",
    "silent video"
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
    "title": "Mute Video – Remove Sound from a Video, Free and Private",
    "description": "Remove the audio track from MP4, MOV and WebM videos and keep the picture at full quality. Trim it too if you like. Free, private, runs on your device.",
    "h1": "Mute Video"
  },
  "howTo": [
    "Add a video, or drop it on the page.",
    "Trim the start and end if you need to.",
    "Remove the sound, preview, then download."
  ],
  "faq": [
    {
      "q": "Does it change the picture quality?",
      "a": "No visible change. The video is saved at Best quality without its sound track."
    },
    {
      "q": "Can I keep only part of the video?",
      "a": "Yes. Use the trim slider before removing the sound."
    },
    {
      "q": "Is my video uploaded?",
      "a": "No. Mute Video runs in your browser using your device's media hardware. The file never leaves your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.trim-video",
    "media.extract-audio",
    "media.compress-video",
    "media.video-to-gif"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
