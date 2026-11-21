import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.markdown-editor",
  "space": "dev",
  "category": "docs-diagrams",
  "slug": "markdown-editor",
  "name": "Markdown Preview",
  "tagline": "Real-time Markdown editor & preview.",
  "keywords": [
    "markdown preview",
    "markdown editor",
    "md preview",
    "markdown viewer"
  ],
  "synonyms": [
    "markdown editor",
    "md preview",
    "markdown viewer"
  ],
  "jobs": [
    "live preview",
    "syntax highlighting",
    "table of contents"
  ],
  "template": "file",
  "input": [
    {
      "type": "markdown",
      "accept": [
        "text/markdown"
      ]
    }
  ],
  "output": [
    {
      "type": "text",
      "accept": [
        "text/html"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Markdown Preview – Real-time Editor & Preview",
    "description": "Write and preview Markdown in real-time. Syntax highlighting, TOC, and export to HTML/PDF. Free, private, no sign-up. Runs in your browser. Works on any device.",
    "h1": "Markdown Preview"
  },
  "howTo": [
    "Add your file, or drop it on the page.",
    "Adjust the options if you need to.",
    "Download the result."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Markdown Preview runs in your browser, so your files and text stay on your device."
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
    "dev.json-formatter",
    "dev.diff-checker",
    "work.notepad",
    "dev.api-doc-generator"
  ],
  "legacySlugs": [
    "markdown-preview"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
