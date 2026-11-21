import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.cron-builder",
  "space": "dev",
  "category": "generators",
  "slug": "cron-builder",
  "name": "Cron Expression Helper",
  "tagline": "Validate & explain cron expressions.",
  "keywords": [
    "cron helper",
    "cron expression",
    "crontab",
    "cron validator"
  ],
  "synonyms": [
    "cron expression",
    "crontab",
    "cron validator"
  ],
  "jobs": [
    "validate cron",
    "human-readable description",
    "next 5 runs"
  ],
  "template": "text",
  "input": [],
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
    "title": "Cron Expression Helper – Validate & Explain Cron",
    "description": "Validate, explain, and preview cron expressions. See next execution times and get descriptions. Free, private, no sign-up. Runs in your browser.",
    "h1": "Cron Expression Helper"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Cron Expression Helper runs in your browser, so your files and text stay on your device."
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
    "dev.timestamp-converter",
    "dev.regex-tester",
    "dev.ai-regex-builder",
    "dev.ai-sql-assistant"
  ],
  "legacySlugs": [
    "cron-helper"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
