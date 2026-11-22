import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.flashcards",
  "space": "study",
  "category": "exam-prep",
  "slug": "flashcards",
  "name": "Flashcards",
  "tagline": "Flashcards with spaced repetition, decks and AI cards from notes.",
  "keywords": [
    "flashcards",
    "flashcard maker",
    "spaced repetition",
    "online flashcards",
    "study cards"
  ],
  "synonyms": [
    "flashcards",
    "study cards",
    "digital flashcards"
  ],
  "jobs": [
    "spaced repetition review",
    "cards from notes with AI",
    "import and export CSV"
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
    "title": "Flashcards with Spaced Repetition – Free Online",
    "description": "Make flashcard decks, paste lists or import CSV, or create cards from notes with AI, then study with spaced repetition that shows cards right before you forget.",
    "h1": "Flashcards"
  },
  "howTo": [
    "Create a deck and add cards: type them, paste a list, import a CSV or make them from notes with AI.",
    "Study: show the answer, then rate it Again, Hard, Good or Easy.",
    "Come back when cards are due; the app schedules each card for you."
  ],
  "faq": [
    {
      "q": "How does spaced repetition work?",
      "a": "Each time you rate a card, its next review moves further away if you knew it and comes back soon if you didn't. It uses the SM-2 method, the basis of most flashcard apps."
    },
    {
      "q": "Where are my cards saved?",
      "a": "In this browser on this device. Export a CSV to back them up or move them to another device."
    },
    {
      "q": "Can I import cards from another app?",
      "a": "Yes. Import a CSV with the front in the first column and the back in the second, or paste lines like term - definition."
    },
    {
      "q": "Are there keyboard shortcuts?",
      "a": "Space shows the answer; 1, 2, 3 and 4 rate it Again, Hard, Good and Easy."
    },
    {
      "q": "Is it free?",
      "a": "Yes. No sign-up and no limits."
    }
  ],
  "related": [
    "study.quiz-maker",
    "study.periodic-table",
    "ai.notes-generator",
    "study.pomodoro-timer"
  ],
  "legacySlugs": [
    "flashcard-creator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
