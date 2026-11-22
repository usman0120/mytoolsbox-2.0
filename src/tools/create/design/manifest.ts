import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "create.design",
  "space": "create",
  "category": "design",
  "slug": "design",
  "name": "Design Studio",
  "tagline": "Make social posts, thumbnails, posters and certificates from templates.",
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
    "20 ready-made templates",
    "export PNG, JPG, SVG or PDF"
  ],
  "template": "editor",
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
        "image/webp",
        "image/svg+xml"
      ]
    },
    {
      "type": "pdf",
      "accept": [
        "application/pdf"
      ]
    },
    {
      "type": "design-scene",
      "accept": [
        "application/json"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Design Studio – Free Online Graphic Design Editor",
    "description": "Design social posts, thumbnails, posters and certificates with templates, text, shapes and photos. Export PNG, JPG, SVG or PDF. Free, private, no sign-up.",
    "h1": "Design Studio"
  },
  "howTo": [
    "Pick a size or a template.",
    "Edit text, add photos, shapes and colours. Everything saves automatically in this browser.",
    "Export as PNG, JPG, WebP, SVG or PDF."
  ],
  "faq": [
    {
      "q": "Is Design Studio free?",
      "a": "Yes. All templates and export formats are free, with no watermark and no account."
    },
    {
      "q": "What can I design?",
      "a": "Social posts and stories, video thumbnails, banners, posters, flyers, certificates and presentation slides, or any custom size."
    },
    {
      "q": "Are my images uploaded?",
      "a": "No. Photos you add stay in your browser and the design is drawn on your device."
    },
    {
      "q": "Will I lose my work if I close the tab?",
      "a": "No. The current design autosaves in this browser. You can also download the project file, or save it to your account when signed in."
    },
    {
      "q": "Can I remove a photo's background?",
      "a": "Yes. Select a photo and choose Remove background. The model runs on your device."
    },
    {
      "q": "Which format should I export?",
      "a": "PNG for sharp graphics and transparency, JPG for photos and small files, PDF for printing at the real paper size."
    }
  ],
  "related": [
    "media.remove-background",
    "create.diagram",
    "create.color-palette-generator",
    "create.certificate-maker"
  ],
  "legacySlugs": [
    "design-studio"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
