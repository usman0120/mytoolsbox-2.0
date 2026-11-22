import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.extract-audio",
  "space": "media",
  "category": "audio",
  "slug": "extract-audio",
  "name": "Extract Audio from Video",
  "tagline": "Save the sound of a video as MP3, M4A, WAV or Ogg.",
  "keywords": [
    "extract audio",
    "video to audio",
    "audio extractor",
    "pull audio from video"
  ],
  "synonyms": [
    "video to audio",
    "audio extractor",
    "pull audio from video"
  ],
  "jobs": [
    "audio extraction",
    "mp3/wav output",
    "quality settings"
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
      "type": "audio",
      "accept": [
        "audio/mpeg",
        "audio/mp4",
        "audio/wav",
        "audio/ogg"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Extract Audio from Video – MP3, M4A, WAV, Free",
    "description": "Extract the audio from MP4, MOV, WebM or MKV videos and save it as MP3, M4A, WAV or Ogg. Trim it first if you like. Free, private, runs on your device.",
    "h1": "Extract Audio from Video"
  },
  "howTo": [
    "Add a video, or drop it on the page.",
    "Choose the audio format and quality. Trim the start and end if needed.",
    "Extract, listen, then download."
  ],
  "faq": [
    {
      "q": "Which format should I choose?",
      "a": "MP3 plays everywhere. M4A (AAC) is smaller at the same quality. WAV is lossless but large. Ogg suits web apps."
    },
    {
      "q": "Which videos work?",
      "a": "MP4, MOV, WebM and MKV videos with a sound track."
    },
    {
      "q": "What audio quality should I pick?",
      "a": "128 kbps is plenty for speech and podcasts; 192 kbps or higher for music."
    },
    {
      "q": "Is my video uploaded?",
      "a": "No. Extract Audio runs in your browser using your device's media hardware. The file never leaves your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.mp4-to-mp3",
    "media.speech-to-text",
    "media.audio-cutter",
    "media.audio-converter"
  ],
  "legacySlugs": [
    "extract-audio-from-video"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
