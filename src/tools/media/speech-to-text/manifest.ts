import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.speech-to-text",
  "space": "media",
  "category": "audio",
  "slug": "speech-to-text",
  "name": "Speech to Text",
  "tagline": "Convert speech to written text.",
  "keywords": [
    "speech to text",
    "voice to text",
    "transcription",
    "dictation",
    "audio to text"
  ],
  "synonyms": [
    "voice to text",
    "transcription",
    "dictation"
  ],
  "jobs": [
    "live recording",
    "file upload",
    "real-time transcription"
  ],
  "template": "file",
  "input": [
    {
      "type": "audio",
      "accept": [
        "audio/mpeg",
        "audio/wav",
        "audio/webm"
      ]
    }
  ],
  "output": [
    {
      "type": "text",
      "accept": [
        "text/plain"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Speech to Text – Voice Transcription Online",
    "description": "Convert speech to text. Record live or upload audio files - all transcription happens in your browser. Free, private, no sign-up. Runs in your browser.",
    "h1": "Speech to Text"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "What languages are supported?",
      "a": "The tool uses your browser's built-in speech recognition, which supports the languages installed on your device."
    },
    {
      "q": "Do I need an internet connection?",
      "a": "Live recording works offline in supported browsers. File upload transcription requires a modern browser."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Speech to Text runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "media.text-to-speech",
    "work.summarizer",
    "work.grammar-checker",
    "media.audio-converter"
  ],
  "legacySlugs": [
    "speech-to-text"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
