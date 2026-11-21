import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.user-agent-parser",
  "space": "dev",
  "category": "web-seo",
  "slug": "user-agent-parser",
  "name": "User-Agent Parser",
  "tagline": "Parse User-Agent strings.",
  "keywords": [
    "user agent parser",
    "user agent",
    "browser detection",
    "ua parser"
  ],
  "synonyms": [
    "user agent",
    "browser detection",
    "ua parser"
  ],
  "jobs": [
    "browser detection",
    "os detection",
    "device type"
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
    "title": "User-Agent Parser – Identify Browser & OS",
    "description": "Parse User-Agent strings to identify browsers, operating systems, devices, and rendering engines. Free, private, no sign-up. Runs in your browser.",
    "h1": "User-Agent Parser"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. User-Agent Parser runs in your browser, so your files and text stay on your device."
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
    "dev.http-status-codes",
    "dev.mime-types",
    "dev.api-request-tester",
    "dev.color-contrast-checker"
  ],
  "legacySlugs": [
    "user-agent-parser"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
