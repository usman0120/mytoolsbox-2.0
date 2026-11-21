import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.audio-cutter",
  "space": "media",
  "category": "audio",
  "slug": "audio-cutter",
  "name": "Audio Cutter",
  "tagline": "Cut and trim audio files online.",
  "keywords": [
    "audio cutter",
    "trim audio",
    "cut audio",
    "audio trimmer",
    "mp3 cutter"
  ],
  "synonyms": [
    "trim audio",
    "cut audio",
    "audio trimmer"
  ],
  "jobs": [
    "visual waveform editor",
    "precise trimming",
    "multiple format support"
  ],
  "template": "file",
  "input": [
    {
      "type": "audio",
      "accept": [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg"
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
    "title": "Audio Cutter – Trim Audio Files Online",
    "description": "Cut and trim audio files online. Visual waveform editor with precise controls. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Audio Cutter"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "What audio formats are supported?",
      "a": "You can import MP3, WAV, and OGG files. Export as MP3 or WAV."
    },
    {
      "q": "Can I add fade effects?",
      "a": "Yes! You can add fade-in and fade-out effects to your trimmed audio."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Audio Cutter runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.mp4-to-mp3",
    "media.audio-converter",
    "media.extract-audio",
    "media.speech-to-text"
  ],
  "legacySlugs": [
    "audio-cutter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
