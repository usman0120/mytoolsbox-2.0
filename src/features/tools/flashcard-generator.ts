// Flashcard Generator Core Engine
// Smart text-to-flashcard parser, Leitner 5-Box spaced repetition, Anki/Quizlet export

export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  mastered: boolean;
  leitnerBox?: LeitnerBox;
  hint?: string;
  nextReviewAt?: string; // ISO date
}

export interface FlashcardDeck {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: string;
  description?: string;
}

export interface MasteryStats {
  mastered: number;
  total: number;
  percent: number;
  byBox: Record<LeitnerBox, number>;
  dueForReview: number;
}

export const LEITNER_INTERVALS: Record<LeitnerBox, number> = {
  1: 1,   // Review next day
  2: 2,   // Review in 2 days
  3: 4,   // Review in 4 days
  4: 8,   // Review in 8 days
  5: 16,  // Review in 16 days
};

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

export function getMasteryStats(cards: Flashcard[]): MasteryStats {
  const total = cards.length;
  const mastered = cards.filter((c) => c.mastered || c.leitnerBox === 5).length;
  const now = new Date();

  const byBox: Record<LeitnerBox, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let dueForReview = 0;

  for (const c of cards) {
    const box = (c.leitnerBox ?? 1) as LeitnerBox;
    byBox[box]++;
    if (c.nextReviewAt && new Date(c.nextReviewAt) <= now) dueForReview++;
    if (!c.nextReviewAt) dueForReview++;
  }

  return {
    mastered,
    total,
    percent: total > 0 ? Math.round((mastered / total) * 100) : 0,
    byBox,
    dueForReview,
  };
}

/**
 * Promotes or demotes a card in the Leitner system
 */
export function updateLeitnerBox(card: Flashcard, correct: boolean): Flashcard {
  const currentBox = (card.leitnerBox ?? 1) as LeitnerBox;
  let newBox: LeitnerBox;

  if (correct) {
    newBox = Math.min(5, currentBox + 1) as LeitnerBox;
  } else {
    newBox = 1; // Failed → back to box 1
  }

  const daysUntilReview = LEITNER_INTERVALS[newBox];
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + daysUntilReview);

  return {
    ...card,
    leitnerBox: newBox,
    mastered: newBox === 5,
    nextReviewAt: nextReview.toISOString(),
  };
}

/**
 * Parse flashcards from plain text using multiple delimiters and patterns.
 * Supports:
 *  - "Term : Definition" or "Term | Definition" or "Term - Definition" or "Term → Definition"
 *  - "Q: question\nA: answer" multi-line Q&A blocks
 *  - Numbered or bulleted lists where alternating lines are front/back
 */
export function parseFlashcardsFromText(text: string): Flashcard[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const cards: Flashcard[] = [];

  // Q&A block parser: Q: ... / A: ...
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const qMatch = line.match(/^[Qq](?:uestion)?[:.]\s*(.+)$/);
    if (qMatch && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      const aMatch = nextLine.match(/^[Aa](?:nswer)?[:.]\s*(.+)$/);
      if (aMatch) {
        cards.push({
          id: generateCardId(),
          front: qMatch[1].trim(),
          back: aMatch[1].trim(),
          mastered: false,
          leitnerBox: 1,
        });
        i += 2;
        continue;
      }
    }

    // Single-line delimiter patterns: |, :, -, →, =>, ::
    const delimMatch = line.match(/^(.+?)\s*(?:\||\:{2}|→|=>|—)\s*(.+)$/);
    if (delimMatch) {
      cards.push({
        id: generateCardId(),
        front: delimMatch[1].trim(),
        back: delimMatch[2].trim(),
        mastered: false,
        leitnerBox: 1,
      });
      i++;
      continue;
    }

    // Colon delimiter (single) — only if it looks like "Term: Definition" not a URL
    const colonMatch = line.match(/^([^:]+):\s*(.{5,})$/);
    if (colonMatch && !colonMatch[0].includes("://")) {
      cards.push({
        id: generateCardId(),
        front: colonMatch[1].trim(),
        back: colonMatch[2].trim(),
        mastered: false,
        leitnerBox: 1,
      });
      i++;
      continue;
    }

    // Hyphen delimiter: "Term - Definition" (only when clearly separated)
    const hyphenMatch = line.match(/^([^-]{3,})\s+-\s+(.{5,})$/);
    if (hyphenMatch) {
      cards.push({
        id: generateCardId(),
        front: hyphenMatch[1].trim(),
        back: hyphenMatch[2].trim(),
        mastered: false,
        leitnerBox: 1,
      });
      i++;
      continue;
    }

    i++;
  }

  return cards;
}

/**
 * Exports flashcards to Anki-compatible TSV (tab-separated)
 */
export function exportToAnkiTSV(deck: FlashcardDeck): string {
  const header = "#separator:tab\n#html:false\n#notetype:Basic\n";
  const rows = deck.cards.map((c) => `${c.front}\t${c.back}${c.hint ? `\t${c.hint}` : ""}`);
  return header + rows.join("\n");
}

/**
 * Exports flashcards to Quizlet-compatible CSV (comma-separated)
 */
export function exportToQuizletCSV(deck: FlashcardDeck): string {
  const rows = deck.cards.map((c) => {
    const front = `"${c.front.replace(/"/g, '""')}"`;
    const back = `"${c.back.replace(/"/g, '""')}"`;
    return `${front},${back}`;
  });
  return rows.join("\n");
}

export const SAMPLE_DECKS: Record<string, FlashcardDeck> = {
  capitals: {
    id: "sample_capitals",
    title: "World Capitals",
    description: "Match countries to their capital cities",
    cards: [
      { id: "c1", front: "France", back: "Paris", mastered: false, leitnerBox: 1 },
      { id: "c2", front: "Japan", back: "Tokyo", mastered: false, leitnerBox: 1 },
      { id: "c3", front: "Brazil", back: "Brasília", mastered: false, leitnerBox: 1 },
      { id: "c4", front: "Australia", back: "Canberra", hint: "Not Sydney or Melbourne!", mastered: false, leitnerBox: 1 },
      { id: "c5", front: "Egypt", back: "Cairo", mastered: false, leitnerBox: 1 },
      { id: "c6", front: "Canada", back: "Ottawa", hint: "Not Toronto!", mastered: false, leitnerBox: 1 },
      { id: "c7", front: "India", back: "New Delhi", mastered: false, leitnerBox: 1 },
      { id: "c8", front: "Germany", back: "Berlin", mastered: false, leitnerBox: 1 },
    ],
    createdAt: new Date().toISOString(),
  },
  vocabulary: {
    id: "sample_vocab",
    title: "Advanced English Vocabulary",
    description: "Expand your vocabulary with these commonly tested words",
    cards: [
      { id: "c1", front: "Ephemeral", back: "Lasting for a very short time", mastered: false, leitnerBox: 1 },
      { id: "c2", front: "Ubiquitous", back: "Present, appearing, or found everywhere", mastered: false, leitnerBox: 1 },
      { id: "c3", front: "Pragmatic", back: "Dealing with things sensibly and realistically", mastered: false, leitnerBox: 1 },
      { id: "c4", front: "Eloquent", back: "Fluent or persuasive in speaking or writing", mastered: false, leitnerBox: 1 },
      { id: "c5", front: "Resilient", back: "Able to withstand or recover quickly from difficult conditions", mastered: false, leitnerBox: 1 },
      { id: "c6", front: "Meticulous", back: "Showing great attention to detail; very careful and precise", mastered: false, leitnerBox: 1 },
    ],
    createdAt: new Date().toISOString(),
  },
  formulas: {
    id: "sample_formulas",
    title: "Math & Physics Formulas",
    description: "Essential formulas for exams",
    cards: [
      { id: "c1", front: "Area of a circle", back: "A = πr²", hint: "r is radius", mastered: false, leitnerBox: 1 },
      { id: "c2", front: "Quadratic formula", back: "x = (−b ± √(b²−4ac)) / 2a", mastered: false, leitnerBox: 1 },
      { id: "c3", front: "Pythagorean theorem", back: "a² + b² = c²", hint: "c is hypotenuse", mastered: false, leitnerBox: 1 },
      { id: "c4", front: "Slope of a line", back: "m = (y₂ − y₁) / (x₂ − x₁)", mastered: false, leitnerBox: 1 },
      { id: "c5", front: "Compound interest formula", back: "A = P(1 + r/n)^(nt)", mastered: false, leitnerBox: 1 },
      { id: "c6", front: "Newton's Second Law", back: "F = ma (Force = mass × acceleration)", mastered: false, leitnerBox: 1 },
    ],
    createdAt: new Date().toISOString(),
  },
};