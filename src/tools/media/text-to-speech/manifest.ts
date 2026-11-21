import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.text-to-speech",
  "space": "media",
  "category": "audio",
  "slug": "text-to-speech",
  "name": "Text to Speech",
  "tagline": "Convert text to spoken audio.",
  "keywords": [
    "text to speech",
    "tts",
    "text reader",
    "speech generator"
  ],
  "synonyms": [
    "tts",
    "text reader",
    "speech generator"
  ],
  "jobs": [
    "multiple voices",
    "speed control",
    "pitch adjustment"
  ],
  "template": "text",
  "input": [],
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
    "title": "Text to Speech – Convert Text to Audio Online",
    "description": "Convert text to natural-sounding speech. Multiple voices, speed control, and MP3 download. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Text to Speech"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Text to Speech runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    },
    {
      "q": "Does it work on my phone?",
      "a": "Yes. It works in any modern browser on phones, tablets and computers."
    },
    {
      "q": "Does it work offline?",
      "a": "Once the page has loaded, the tool keeps working without an internet connection."
    }
  ],
  "related": [
    "work.word-counter",
    "media.audio-converter",
    "media.audio-cutter",
    "media.extract-audio"
  ],
  "legacySlugs": [
    "text-to-speech"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
