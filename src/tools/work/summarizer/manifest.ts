import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.summarizer",
  "space": "work",
  "category": "text",
  "slug": "summarizer",
  "name": "Text Summarizer",
  "tagline": "Create concise text summaries.",
  "keywords": [
    "text summarizer",
    "summarize text",
    "article summarizer",
    "text summary",
    "condense text"
  ],
  "synonyms": [
    "summarize text",
    "article summarizer",
    "text summary"
  ],
  "jobs": [
    "extractive summarization",
    "adjustable length",
    "sentence scoring"
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
    "title": "Text Summarizer – Summarize Articles & Documents",
    "description": "Summarize long texts into concise summaries. AI-powered extractive summarization in your browser. Free, private, no sign-up. Runs in your browser.",
    "h1": "Text Summarizer"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "How does the summarizer work?",
      "a": "It uses extractive summarization, scoring sentences by word frequency and position to identify the most important content."
    },
    {
      "q": "Is there a text length limit?",
      "a": "For best results, texts between 500-10,000 words work best. Very short texts may not summarize well."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Text Summarizer runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "work.paraphraser",
    "work.grammar-checker",
    "work.word-counter",
    "work.case-converter"
  ],
  "legacySlugs": [
    "text-summarizer"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
