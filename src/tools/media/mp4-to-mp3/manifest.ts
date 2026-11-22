import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.mp4-to-mp3",
  "space": "media",
  "category": "audio",
  "slug": "mp4-to-mp3",
  "name": "MP4 to MP3 Converter",
  "tagline": "Turn an MP4 video into an MP3 file.",
  "keywords": [
    "mp4 to mp3",
    "extract audio",
    "video to audio",
    "mp4 converter",
    "audio extractor"
  ],
  "synonyms": [
    "extract audio",
    "video to audio",
    "mp4 converter"
  ],
  "jobs": [
    "mp4 to mp3 conversion",
    "client-side processing",
    "adjustable quality"
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
        "audio/mpeg"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "MP4 to MP3 Converter – Free, Private, No Upload",
    "description": "Convert MP4 videos to MP3 audio at 128 to 320 kbps. Also works with MOV, WebM and MKV. Trim before saving. Free, private, runs on your device.",
    "h1": "MP4 to MP3 Converter"
  },
  "howTo": [
    "Add an MP4 video, or drop it on the page.",
    "Pick the MP3 quality and trim if needed.",
    "Convert, listen, then download the MP3."
  ],
  "faq": [
    {
      "q": "Is there a file size limit?",
      "a": "No fixed limit. Very long videos depend on your device's memory; on phones keep them under about 300 MB."
    },
    {
      "q": "What MP3 quality should I choose?",
      "a": "128 kbps for speech, 192 kbps for music, 320 kbps for the highest quality."
    },
    {
      "q": "Does it work with other video formats?",
      "a": "Yes. MOV, WebM and MKV videos work too, and M4A audio."
    },
    {
      "q": "Is my video uploaded?",
      "a": "No. MP4 to MP3 runs in your browser using your device's media hardware. The file never leaves your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.extract-audio",
    "media.audio-cutter",
    "media.audio-converter",
    "media.speech-to-text"
  ],
  "legacySlugs": [
    "mp4-mp3-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
