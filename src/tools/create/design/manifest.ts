import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "create.design",
  "space": "create",
  "category": "design",
  "slug": "design",
  "name": "Design Studio",
  "tagline": "Design social posts, posters and slides.",
  "keywords": [
    "online design tool",
    "graphic design",
    "social media post maker",
    "poster maker",
    "thumbnail maker",
    "design templates"
  ],
  "synonyms": [
    "graphic design",
    "social media post maker",
    "poster maker"
  ],
  "jobs": [
    "layered canvas editor",
    "ready-made templates",
    "social media sizes"
  ],
  "template": "file",
  "input": [
    {
      "type": "image",
      "accept": [
        "image/jpeg",
        "image/png",
        "image/svg+xml"
      ]
    }
  ],
  "output": [
    {
      "type": "image",
      "accept": [
        "image/png",
        "image/jpeg",
        "image/svg+xml"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Online Design Studio – Social Posts, Posters & Slides",
    "description": "Design social media posts, posters, thumbnails and slides online. Templates, text and shapes, export to PNG or PDF. Free, private, no sign-up.",
    "h1": "Design Studio"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Is the Design Studio free?",
      "a": "Yes. Every template and export format is free, with no watermark and no account required."
    },
    {
      "q": "What can I design?",
      "a": "Social media posts, stories, YouTube thumbnails, posters, flyers, certificates and simple presentation slides."
    },
    {
      "q": "Are my images uploaded?",
      "a": "No. Images you add stay in your browser and the design is rendered on your device."
    },
    {
      "q": "Which export formats are supported?",
      "a": "PNG, JPG, SVG and PDF. PNG keeps transparent backgrounds."
    }
  ],
  "related": [
    "create.color-palette-generator",
    "media.resize-image",
    "media.crop-image",
    "media.compress-image"
  ],
  "legacySlugs": [
    "design-studio"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
