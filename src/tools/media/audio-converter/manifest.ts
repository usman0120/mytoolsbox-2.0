import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.audio-converter",
  "space": "media",
  "category": "audio",
  "slug": "audio-converter",
  "name": "Audio Converter",
  "tagline": "Convert between WAV and MP3 formats.",
  "keywords": [
    "audio converter",
    "wav to mp3",
    "mp3 to wav",
    "audio format converter"
  ],
  "synonyms": [
    "wav to mp3",
    "mp3 to wav",
    "audio format converter"
  ],
  "jobs": [
    "wav to mp3 conversion",
    "mp3 to wav conversion",
    "quality presets"
  ],
  "template": "file",
  "input": [
    {
      "type": "audio",
      "accept": [
        "audio/mpeg",
        "audio/wav"
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
    "title": "Audio Converter – WAV to MP3 & MP3 to WAV",
    "description": "Convert audio files between WAV and MP3 formats. Bidirectional conversion with quality controls. Free, private, no sign-up. Runs in your browser.",
    "h1": "Audio Converter"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Which direction can I convert?",
      "a": "You can convert both ways: WAV to MP3 and MP3 to WAV."
    },
    {
      "q": "Is there quality loss?",
      "a": "Converting to MP3 involves compression. WAV is lossless. Choose the quality that fits your needs."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Audio Converter runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.mp4-to-mp3",
    "media.audio-cutter",
    "media.extract-audio",
    "media.speech-to-text"
  ],
  "legacySlugs": [
    "audio-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
