import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.screen-recorder",
  "space": "media",
  "category": "video",
  "slug": "screen-recorder",
  "name": "Screen Recorder",
  "tagline": "Record screen in browser.",
  "keywords": [
    "screen recorder",
    "record screen",
    "screen capture",
    "browser recorder"
  ],
  "synonyms": [
    "record screen",
    "screen capture",
    "browser recorder"
  ],
  "jobs": [
    "screen/tab/window",
    "audio recording",
    "no install"
  ],
  "template": "text",
  "input": [],
  "output": [
    {
      "type": "video",
      "accept": [
        "video/webm",
        "video/mp4"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Screen Recorder – Record Screen in Browser",
    "description": "Record your screen, tab, or window. No installation needed. Export as WebM or MP4. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Screen Recorder"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Screen Recorder runs in your browser, so your files and text stay on your device."
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
    "media.video-to-gif",
    "media.video-editor",
    "media.compress-video",
    "media.merge-videos"
  ],
  "legacySlugs": [
    "screen-recorder"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
