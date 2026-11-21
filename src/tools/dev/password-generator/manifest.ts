import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.password-generator",
  "space": "dev",
  "category": "generators",
  "slug": "password-generator",
  "name": "Password Generator",
  "tagline": "Generate strong secure passwords.",
  "keywords": [
    "password generator",
    "strong password",
    "random password",
    "security"
  ],
  "synonyms": [
    "strong password",
    "random password",
    "security"
  ],
  "jobs": [
    "customizable length",
    "character sets",
    "strength meter"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Password Generator – Strong Random Passwords",
    "description": "Generate strong, secure passwords instantly. Customize length and character types. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Password Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Are generated passwords stored?",
      "a": "No. Passwords are generated entirely in your browser and never stored or transmitted."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Password Generator runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    },
    {
      "q": "Does it work on my phone?",
      "a": "Yes. It works in any modern browser on phones, tablets and computers."
    }
  ],
  "related": [
    "dev.base64-encoder",
    "dev.url-encoder",
    "dev.ai-regex-builder",
    "dev.ai-sql-assistant"
  ],
  "legacySlugs": [
    "password-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
