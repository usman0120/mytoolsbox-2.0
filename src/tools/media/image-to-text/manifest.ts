import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.image-to-text",
  "space": "media",
  "category": "image-convert",
  "slug": "image-to-text",
  "name": "Image to Text OCR",
  "tagline": "Extract text from images with OCR.",
  "keywords": [
    "ocr",
    "image to text",
    "extract text from image",
    "optical character recognition",
    "text scanner",
    "photo to text"
  ],
  "synonyms": [
    "image to text",
    "extract text from image",
    "optical character recognition"
  ],
  "jobs": [
    "multi-language ocr",
    "handwriting recognition",
    "batch processing"
  ],
  "template": "ai",
  "input": [],
  "output": [
    {
      "type": "text",
      "accept": [
        "text/plain"
      ]
    }
  ],
  "engine": "ai",
  "aiTask": "general",
  "seo": {
    "title": "Image to Text OCR – Extract Text from Images Online",
    "description": "Extract text from images and PDFs with free OCR. Supports multiple languages, handwriting, and exports to TXT, DOCX, or PDF. Works on any device.",
    "h1": "Image to Text OCR"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "Does it support handwriting?",
      "a": "Yes! The OCR engine can recognize both printed text and handwriting in multiple languages."
    },
    {
      "q": "What languages are supported?",
      "a": "English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Hindi, and 50+ more languages."
    },
    {
      "q": "Where is my text sent?",
      "a": "Image to Text OCR sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
    },
    {
      "q": "Is it free?",
      "a": "Yes. AI features are free within a daily allowance: 10 requests a day without an account and 40 when you sign in."
    }
  ],
  "related": [
    "media.convert-image",
    "work.word-counter",
    "media.add-text-to-image",
    "media.audio-converter"
  ],
  "legacySlugs": [
    "image-to-text-ocr"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
