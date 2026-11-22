import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.audio-converter",
  "space": "media",
  "category": "audio",
  "slug": "audio-converter",
  "name": "Audio Converter",
  "tagline": "Convert between MP3, M4A, WAV and Ogg.",
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
    "title": "Audio Converter – MP3, M4A, WAV, Ogg, Free and Private",
    "description": "Convert audio between MP3, M4A (AAC), WAV and Ogg (Opus), with quality control and trimming. Free, no sign-up, and the file never leaves your device.",
    "h1": "Audio Converter"
  },
  "howTo": [
    "Add an audio file, or drop it on the page.",
    "Choose the output format and quality. Trim if needed.",
    "Convert, listen, then download."
  ],
  "faq": [
    {
      "q": "Which formats can I open?",
      "a": "MP3, M4A, AAC, WAV, Ogg, Opus and FLAC, as supported by your browser."
    },
    {
      "q": "Is there quality loss?",
      "a": "Converting to MP3, M4A or Ogg compresses the audio. WAV is lossless. Converting a compressed file to WAV does not restore lost detail."
    },
    {
      "q": "Which format is smallest?",
      "a": "Ogg (Opus) and M4A (AAC) are smaller than MP3 at the same quality."
    },
    {
      "q": "Is my audio uploaded?",
      "a": "No. Conversion runs in your browser and the file never leaves your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.audio-cutter",
    "media.mp4-to-mp3",
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
