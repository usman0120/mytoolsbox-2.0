import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.video-to-gif",
  "space": "media",
  "category": "video",
  "slug": "video-to-gif",
  "name": "Video to GIF",
  "tagline": "Convert video clips to GIFs.",
  "keywords": [
    "video to gif",
    "gif maker",
    "animated gif",
    "convert video to gif"
  ],
  "synonyms": [
    "gif maker",
    "animated gif",
    "convert video to gif"
  ],
  "jobs": [
    "trim video",
    "adjust fps",
    "resize output"
  ],
  "template": "file",
  "input": [
    {
      "type": "video",
      "accept": [
        "video/mp4",
        "video/webm"
      ]
    }
  ],
  "output": [
    {
      "type": "image",
      "accept": [
        "image/gif"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Video to GIF Converter – Make Animated GIFs Online",
    "description": "Turn a video clip into an animated GIF. Trim it, resize it and add a caption before you export. Free, private, no sign-up. Runs in your browser.",
    "h1": "Video to GIF"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Video to GIF runs in your browser, so your files and text stay on your device."
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
    "media.convert-image",
    "media.compress-video",
    "media.merge-videos",
    "media.resize-video"
  ],
  "legacySlugs": [
    "video-to-gif"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
