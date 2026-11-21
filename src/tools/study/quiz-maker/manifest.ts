import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.quiz-maker",
  "space": "study",
  "category": "exam-prep",
  "slug": "quiz-maker",
  "name": "Quiz Maker",
  "tagline": "Quiz editor, notes generation & optional AI assistance.",
  "keywords": [
    "quiz maker",
    "test creator",
    "online quiz",
    "exam maker",
    "quiz generator"
  ],
  "synonyms": [
    "test creator",
    "online quiz",
    "exam maker"
  ],
  "jobs": [
    "multiple choice",
    "true/false",
    "question points"
  ],
  "template": "editor",
  "input": [],
  "output": [
    {
      "type": "json",
      "accept": [
        "application/json"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Quiz Maker – Create Interactive Quizzes",
    "description": "Create interactive quizzes with multiple question types. Add images, set timers, and share. Free, private, no sign-up. Runs in your browser.",
    "h1": "Quiz Maker"
  },
  "howTo": [
    "Start from a template or a blank page.",
    "Edit the content and layout.",
    "Export or save your work."
  ],
  "faq": [
    {
      "q": "How do I create questions?",
      "a": "Write multiple-choice or true/false questions, generate questions locally from definitions and Q: / A: notes, or use optional account-based AI assistance."
    },
    {
      "q": "How do I share my quiz?",
      "a": "Download the quiz as JSON. A hosted share-link feature is not currently provided."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Quiz Maker runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "study.study-planner",
    "study.citation-generator",
    "study.flashcards",
    "study.equation-solver"
  ],
  "legacySlugs": [
    "quiz-maker"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
