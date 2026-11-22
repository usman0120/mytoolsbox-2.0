import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.speech-to-text",
  "space": "media",
  "category": "audio",
  "slug": "speech-to-text",
  "name": "Speech to Text",
  "tagline": "Transcribe recordings and videos on your device, with subtitles.",
  "keywords": [
    "speech to text",
    "transcribe audio",
    "audio to text",
    "video to text",
    "transcription",
    "voice to text",
    "srt subtitles",
    "whisper"
  ],
  "synonyms": [
    "transcribe audio",
    "audio to text",
    "voice to text"
  ],
  "jobs": [
    "transcribe a recording",
    "subtitles as SRT or VTT",
    "translate speech to English"
  ],
  "template": "file",
  "input": [
    {
      "type": "audio",
      "accept": [
        "audio/mpeg",
        "audio/mp4",
        "audio/wav",
        "audio/ogg",
        "audio/webm"
      ]
    },
    {
      "type": "video",
      "accept": [
        "video/mp4",
        "video/quicktime",
        "video/webm"
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
    "title": "Speech to Text – Transcribe Audio and Video, Free, Private",
    "description": "Transcribe voice notes, lectures, meetings and videos in 25+ languages with Whisper on your device. Export TXT, SRT or VTT. Free, no upload, no sign-up.",
    "h1": "Speech to Text"
  },
  "howTo": [
    "Add an audio or video file, or record from your microphone.",
    "Choose the spoken language (or detect it) and Fast or Accurate.",
    "Transcribe, edit the text, then copy it or download TXT, SRT or VTT."
  ],
  "faq": [
    {
      "q": "Is my recording uploaded?",
      "a": "No. Transcription runs with the Whisper model inside your browser. The audio never leaves your device."
    },
    {
      "q": "Which languages are supported?",
      "a": "Whisper understands about 100 languages. The list covers the most common; choose Detect automatically for others. Accurate gives better results for non-English speech."
    },
    {
      "q": "Why does it download a model?",
      "a": "The speech model (41 MB for Fast, 77 MB for Accurate) downloads once and is kept by your browser, so later transcriptions start immediately and work offline."
    },
    {
      "q": "How long does it take?",
      "a": "On a laptop, roughly a few minutes per hour of audio with Fast, longer with Accurate. Phones are slower."
    },
    {
      "q": "Can I make subtitles?",
      "a": "Yes. Download SRT or VTT files with timestamps for video players and editors."
    },
    {
      "q": "Can it translate?",
      "a": "Turn on Translate to English to get an English transcript of speech in another language."
    },
    {
      "q": "Is it free?",
      "a": "Yes. No sign-up, no limits."
    }
  ],
  "related": [
    "media.extract-audio",
    "media.text-to-speech",
    "media.audio-converter",
    "media.mp4-to-mp3"
  ],
  "legacySlugs": [
    "speech-to-text"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
