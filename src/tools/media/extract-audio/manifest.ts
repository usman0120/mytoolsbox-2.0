import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.extract-audio",
  "space": "media",
  "category": "audio",
  "slug": "extract-audio",
  "name": "Extract Audio from Video",
  "tagline": "Pull audio from video files.",
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
        "video/webm",
        "video/quicktime"
      ]
    }
  ],
  "output": [
    {
      "type": "audio",
      "accept": [
        "audio/mpeg",
        "audio/wav"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Audio Extractor – Extract Audio from Video Online",
    "description": "Extract audio tracks from video files. Save as MP3 or WAV - all processing in your browser. Free, private, no sign-up. Runs in your browser.",
    "h1": "Extract Audio from Video"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "What video formats are supported?",
      "a": "You can extract audio from MP4, WebM, and MOV video files."
    },
    {
      "q": "Can I choose the output format?",
      "a": "Yes! Export as MP3 (compressed) or WAV (lossless)."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Extract Audio from Video runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.mp4-to-mp3",
    "media.audio-converter",
    "media.audio-cutter",
    "media.speech-to-text"
  ],
  "legacySlugs": [
    "extract-audio-from-video"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
