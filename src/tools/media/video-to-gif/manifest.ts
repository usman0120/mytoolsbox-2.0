import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.video-to-gif",
  "space": "media",
  "category": "video",
  "slug": "video-to-gif",
  "name": "Video to GIF",
  "tagline": "Turn a short clip into an animated GIF, with trimming and captions.",
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
    "title": "Video to GIF Converter – Trim, Caption & Resize",
    "description": "Turn MP4, WebM or MOV clips into animated GIFs. Trim the part you want, set the frame rate and size, and add a caption. Free, private, nothing uploaded.",
    "h1": "Convert video to GIF"
  },
  "howTo": [
    "Add a short video clip.",
    "Trim it, set frame rate and width, and add a caption if you like.",
    "Create the GIF, check the size and download it."
  ],
  "faq": [
    {
      "q": "How do I keep the GIF small?",
      "a": "Keep it short (a few seconds), use a lower frame rate such as 10–12 fps and a width around 480 px. GIFs grow quickly with length and size."
    },
    {
      "q": "Is there a length limit?",
      "a": "There's no fixed limit, but long clips make very large GIFs and take longer on phones. Trim to the moment you need."
    },
    {
      "q": "Are my videos uploaded?",
      "a": "No. Conversion runs in your browser."
    },
    {
      "q": "Will the GIF have sound?",
      "a": "No. The GIF format doesn't support audio."
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
