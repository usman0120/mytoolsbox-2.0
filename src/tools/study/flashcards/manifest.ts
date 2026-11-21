import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.flashcards",
  "space": "study",
  "category": "exam-prep",
  "slug": "flashcards",
  "name": "Flashcard Creator",
  "tagline": "Create and study with flashcards.",
  "keywords": [
    "flashcard creator",
    "flashcards",
    "study cards",
    "digital flashcards",
    "make flashcards"
  ],
  "synonyms": [
    "flashcards",
    "study cards",
    "digital flashcards"
  ],
  "jobs": [
    "card creation",
    "study mode",
    "flip animation"
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
    "title": "Flashcard Creator – Make Digital Flashcards Online",
    "description": "Create and study with digital flashcards. Study mode with flip animation, shuffle, and export. Free, private, no sign-up. Runs in your browser.",
    "h1": "Flashcard Creator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Can I export my flashcards?",
      "a": "Yes! Export your flashcards as a tab-separated text file for use in other apps."
    },
    {
      "q": "How many cards can I create?",
      "a": "There's no hard limit. Create as many flashcards as you need for your studies."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Flashcard Creator runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "study.quiz-maker",
    "study.study-timer",
    "study.citation-generator",
    "study.equation-solver"
  ],
  "legacySlugs": [
    "flashcard-creator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
