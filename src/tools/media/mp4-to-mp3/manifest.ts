import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.mp4-to-mp3",
  "space": "media",
  "category": "audio",
  "slug": "mp4-to-mp3",
  "name": "MP4 to MP3 Converter",
  "tagline": "Convert MP4 video to MP3 audio.",
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
        "video/mp4"
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
    "title": "MP4 to MP3 Converter – Extract Audio Online",
    "description": "Convert MP4 videos to MP3 audio files. All processing happens in your browser - no uploads needed. Free, private, no sign-up. Runs in your browser.",
    "h1": "MP4 to MP3 Converter"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Is there a file size limit?",
      "a": "Since processing is done in your browser, limits depend on your device's memory. For best results, keep files under 500MB."
    },
    {
      "q": "What quality is the output MP3?",
      "a": "You can choose between standard (128kbps), high (192kbps), and premium (320kbps) quality."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. MP4 to MP3 Converter runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.audio-cutter",
    "media.audio-converter",
    "media.extract-audio",
    "media.speech-to-text"
  ],
  "legacySlugs": [
    "mp4-mp3-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
