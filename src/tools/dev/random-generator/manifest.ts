import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.random-generator",
  "space": "dev",
  "category": "generators",
  "slug": "random-generator",
  "name": "Random Generator",
  "tagline": "Generate random numbers & strings.",
  "keywords": [
    "random generator",
    "random number",
    "uuid",
    "dice roller"
  ],
  "synonyms": [
    "random number",
    "uuid",
    "dice roller"
  ],
  "jobs": [
    "random numbers",
    "uuid v4",
    "random colors"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Random Generator – Numbers, UUIDs, Colors & More",
    "description": "Generate random numbers, UUIDs, colors, names and picks from a list, one at a time or in bulk. Free, private, no sign-up. Runs in your browser.",
    "h1": "Random Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Random Generator runs in your browser, so your files and text stay on your device."
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
    "dev.password-generator",
    "dev.uuid-generator",
    "dev.ai-regex-builder",
    "dev.ai-sql-assistant"
  ],
  "legacySlugs": [
    "random-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
