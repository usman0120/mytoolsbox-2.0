import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "media.image-to-text",
  "space": "media",
  "category": "image-convert",
  "slug": "image-to-text",
  "name": "Image to Text (OCR)",
  "tagline": "Copy text out of photos, screenshots and scans with on-device OCR.",
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
    "title": "Image to Text – Free OCR for Photos & Screenshots",
    "description": "Pull editable text out of photos, screenshots and scanned pages with OCR that runs on your device. Choose the language, then copy or download the text.",
    "h1": "Extract text from an image"
  },
  "howTo": [
    "Add a photo, screenshot or scan.",
    "Choose the text language.",
    "Copy the recognized text or download it as a .txt file."
  ],
  "faq": [
    {
      "q": "How accurate is it?",
      "a": "Clear printed text is usually recognized very well. Handwriting, low light, blur and unusual fonts reduce accuracy, so check the result."
    },
    {
      "q": "Which languages are supported?",
      "a": "English and several other languages, including Hindi. The language pack downloads the first time you use it."
    },
    {
      "q": "Is my image uploaded?",
      "a": "No. Recognition runs in your browser with Tesseract, so the image stays on your device."
    },
    {
      "q": "How can I get better results?",
      "a": "Use a sharp, well-lit image taken straight on, and crop to the text you need."
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
