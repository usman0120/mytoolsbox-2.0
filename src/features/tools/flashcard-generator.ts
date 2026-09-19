// Flashcard Generator utility functions

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  mastered: boolean;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: string;
}

export function generateDeckId(): string {
  return `deck_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateCardId(): string {
  return `card_${Math.random().toString(36).slice(2, 10)}`;
}

export function shuffleCards(cards: Flashcard[]): Flashcard[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getMasteryStats(cards: Flashcard[]): { mastered: number; total: number; percent: number } {
  const total = cards.length;
  const mastered = cards.filter(c => c.mastered).length;
  return { mastered, total, percent: total > 0 ? Math.round((mastered / total) * 100) : 0 };
}

export function parseFlashcardsFromText(text: string): Flashcard[] {
  const lines = text.trim().split("\n").filter(l => l.trim());
  const cards: Flashcard[] = [];

  for (const line of lines) {
    // Support formats: "front | back" or "front : back" or "front - back"
    const match = line.match(/^(.+?)\s*[|:\-]\s*(.+)$/);
    if (match) {
      cards.push({
        id: generateCardId(),
        front: match[1].trim(),
        back: match[2].trim(),
        mastered: false,
      });
    }
  }
  return cards;
}

export const SAMPLE_DECKS: Record<string, FlashcardDeck> = {
  capitals: {
    id: "sample_capitals",
    title: "World Capitals",
    cards: [
      { id: "c1", front: "France", back: "Paris", mastered: false },
      { id: "c2", front: "Japan", back: "Tokyo", mastered: false },
      { id: "c3", front: "Brazil", back: "Brasília", mastered: false },
      { id: "c4", front: "Australia", back: "Canberra", mastered: false },
      { id: "c5", front: "Egypt", back: "Cairo", mastered: false },
      { id: "c6", front: "Canada", back: "Ottawa", mastered: false },
      { id: "c7", front: "India", back: "New Delhi", mastered: false },
      { id: "c8", front: "Germany", back: "Berlin", mastered: false },
    ],
    createdAt: new Date().toISOString(),
  },
  vocabulary: {
    id: "sample_vocab",
    title: "English Vocabulary",
    cards: [
      { id: "c1", front: "Ephemeral", back: "Lasting for a very short time", mastered: false },
      { id: "c2", front: "Ubiquitous", back: "Present, appearing, or found everywhere", mastered: false },
      { id: "c3", front: "Pragmatic", back: "Dealing with things sensibly and realistically", mastered: false },
      { id: "c4", front: "Eloquent", back: "Fluent or persuasive in speaking or writing", mastered: false },
      { id: "c5", front: "Resilient", back: "Able to withstand or recover quickly from difficult conditions", mastered: false },
      { id: "c6", front: "Meticulous", back: "Showing great attention to detail; very careful and precise", mastered: false },
    ],
    createdAt: new Date().toISOString(),
  },
  formulas: {
    id: "sample_formulas",
    title: "Math Formulas",
    cards: [
      { id: "c1", front: "Area of a circle", back: "πr²", mastered: false },
      { id: "c2", front: "Quadratic formula", back: "x = (-b ± √(b²-4ac)) / 2a", mastered: false },
      { id: "c3", front: "Pythagorean theorem", back: "a² + b² = c²", mastered: false },
      { id: "c4", front: "Slope of a line", back: "m = (y₂ - y₁) / (x₂ - x₁)", mastered: false },
      { id: "c5", front: "Compound interest", back: "A = P(1 + r/n)^(nt)", mastered: false },
      { id: "c6", front: "Derivative of x^n", back: "nx^(n-1)", mastered: false },
    ],
    createdAt: new Date().toISOString(),
  },
};