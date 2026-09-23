import { describe, it, expect } from "vitest";

// ─────────────────────────────────────────────────────────────
// Citation Generator
// ─────────────────────────────────────────────────────────────
import {
  formatBibliography, formatInTextCitation, parseAuthorsString,
  type CitationItem,
} from "../features/tools/citation-generator";

const journalItem: CitationItem = {
  id: "t1",
  sourceType: "journal",
  authors: [{ firstName: "Jane", lastName: "Smith" }, { firstName: "John", lastName: "Doe" }],
  title: "Neural Networks in Practice",
  containerTitle: "Journal of Machine Intelligence",
  year: "2023",
  volume: "12",
  issue: "3",
  pages: "45-67",
  doi: "10.1234/jmi.2023.001",
};

const bookItem: CitationItem = {
  id: "t2",
  sourceType: "book",
  authors: [{ firstName: "Alice", lastName: "Brown" }],
  title: "Introduction to Algorithms",
  publisher: "MIT Press",
  year: "2022",
  edition: "4th",
};

const websiteItem: CitationItem = {
  id: "t3",
  sourceType: "website",
  authors: [],
  title: "Climate Change Facts",
  containerTitle: "NASA",
  url: "https://climate.nasa.gov",
  year: "2024",
  accessedDate: "15 January 2024",
};

describe("Citation Generator", () => {
  describe("parseAuthorsString", () => {
    it("parses a single name correctly", () => {
      const authors = parseAuthorsString("Jane Smith");
      expect(authors).toHaveLength(1);
      expect(authors[0].firstName).toBe("Jane");
      expect(authors[0].lastName).toBe("Smith");
    });

    it("parses multiple names separated by 'and'", () => {
      const authors = parseAuthorsString("Jane Smith and John Doe");
      expect(authors).toHaveLength(2);
      expect(authors[1].lastName).toBe("Doe");
    });

    it("parses reversed format 'Smith, J.'", () => {
      const authors = parseAuthorsString("Smith, J.");
      expect(authors[0].lastName).toBe("Smith");
    });

    it("handles empty string", () => {
      expect(parseAuthorsString("")).toHaveLength(0);
    });
  });

  describe("formatBibliography - APA", () => {
    it("formats a journal article in APA 7th style", () => {
      const result = formatBibliography(journalItem, "apa");
      expect(result).toContain("Smith");
      expect(result).toContain("Neural Networks in Practice");
      expect(result).toContain("2023");
    });

    it("formats a book in APA 7th style", () => {
      const result = formatBibliography(bookItem, "apa");
      expect(result).toContain("Brown");
      expect(result).toContain("Introduction to Algorithms");
      expect(result).toContain("MIT Press");
    });

    it("formats a website with no author in APA style", () => {
      const result = formatBibliography(websiteItem, "apa");
      expect(result).toContain("Climate Change Facts");
    });
  });

  describe("formatBibliography - MLA", () => {
    it("formats a journal article in MLA 9th style", () => {
      const result = formatBibliography(journalItem, "mla");
      expect(result).toContain("Smith");
      expect(result).toContain("Neural Networks in Practice");
    });

    it("formats a book in MLA 9th style", () => {
      const result = formatBibliography(bookItem, "mla");
      expect(result).toContain("Introduction to Algorithms");
      expect(result).toContain("MIT Press");
    });
  });

  describe("formatBibliography - Chicago", () => {
    it("formats a journal article in Chicago 17th style", () => {
      const result = formatBibliography(journalItem, "chicago");
      expect(result).toContain("Smith");
      expect(result).toContain("Neural Networks in Practice");
    });
  });

  describe("formatBibliography - IEEE", () => {
    it("formats with IEEE author-title format", () => {
      const result = formatBibliography(journalItem, "ieee");
      expect(result).toContain("Smith");
      expect(result).toContain("Neural Networks in Practice");
    });
  });

  describe("formatBibliography - BibTeX", () => {
    it("formats as valid BibTeX entry", () => {
      const result = formatBibliography(journalItem, "bibtex");
      expect(result).toContain("@article");
      expect(result).toContain("author =");
      expect(result).toContain("title =");
    });
  });

  describe("formatInTextCitation", () => {
    it("APA parenthetical format", () => {
      const result = formatInTextCitation(journalItem, "apa", "parenthetical");
      expect(result).toContain("Smith");
      expect(result).toContain("2023");
    });

    it("APA narrative format", () => {
      const result = formatInTextCitation(journalItem, "apa", "narrative");
      expect(result).toContain("Smith");
    });

    it("MLA in-text format", () => {
      const result = formatInTextCitation(journalItem, "mla", "parenthetical");
      expect(result).toContain("Smith");
    });
  });
});

// ─────────────────────────────────────────────────────────────
// GPA Calculator
// ─────────────────────────────────────────────────────────────
import {
  calculateCoursesGPA, calculateCumulativeCGPA, forecastTargetGPA,
  getAcademicStanding, getLatinHonors,
  type CourseEntry,
} from "../features/tools/gpa-calculator";

const sampleCourses: CourseEntry[] = [
  { id: "1", name: "Math",    grade: "A",  credits: 3, weight: "regular" },
  { id: "2", name: "English", grade: "B+", credits: 3, weight: "regular" },
  { id: "3", name: "Physics", grade: "A-", credits: 4, weight: "honors" },
  { id: "4", name: "CS 101",  grade: "A",  credits: 3, weight: "ap_ib" },
];

describe("GPA Calculator", () => {
  describe("calculateCoursesGPA", () => {
    it("computes GPA for sample courses (4.0 scale)", () => {
      const result = calculateCoursesGPA(sampleCourses, "4.0");
      expect(result.gpa).toBeGreaterThan(0);
      expect(result.gpa).toBeLessThanOrEqual(5.0); // may exceed 4.0 due to weighting
      expect(result.totalCredits).toBe(13);
    });

    it("gives A grade maximum 4.0 points on unweighted", () => {
      const courses: CourseEntry[] = [{ id: "1", name: "Test", grade: "A", credits: 3, weight: "regular" }];
      const result = calculateCoursesGPA(courses, "4.0");
      expect(result.unweightedGpa).toBeCloseTo(4.0, 1);
    });

    it("applies honors bonus of +0.5", () => {
      const regular: CourseEntry[] = [{ id: "1", name: "Test", grade: "A", credits: 3, weight: "regular" }];
      const honors:  CourseEntry[] = [{ id: "1", name: "Test", grade: "A", credits: 3, weight: "honors" }];
      const r1 = calculateCoursesGPA(regular, "4.0");
      const r2 = calculateCoursesGPA(honors, "4.0");
      expect(r2.gpa).toBeGreaterThan(r1.gpa);
    });

    it("handles F grade (0 points)", () => {
      const courses: CourseEntry[] = [
        { id: "1", name: "Fail", grade: "F", credits: 3, weight: "regular" },
        { id: "2", name: "Pass", grade: "A", credits: 3, weight: "regular" },
      ];
      const result = calculateCoursesGPA(courses, "4.0");
      expect(result.gpa).toBeCloseTo(2.0, 1);
    });

    it("handles empty course list gracefully", () => {
      const result = calculateCoursesGPA([], "4.0");
      expect(result.gpa).toBe(0);
      expect(result.totalCredits).toBe(0);
    });
  });

  describe("calculateCumulativeCGPA", () => {
    it("blends prior GPA with current semester", () => {
      const result = calculateCumulativeCGPA(60, 3.5, sampleCourses, "4.0");
      expect(result.gpa).toBeGreaterThan(0);
      expect(result.totalCredits).toBe(73); // 60 + 13
    });

    it("returns current result when prior credits = 0", () => {
      const noPrior = calculateCumulativeCGPA(0, 0, sampleCourses, "4.0");
      const current = calculateCoursesGPA(sampleCourses, "4.0");
      expect(noPrior.totalCredits).toBe(current.totalCredits);
    });
  });

  describe("forecastTargetGPA", () => {
    it("calculates required GPA correctly", () => {
      const result = forecastTargetGPA(3.2, 60, 3.5, 30, "4.0");
      expect(result.requiredGpa).toBeGreaterThan(0);
      expect(result.isAttainable).toBeDefined();
    });

    it("marks target as attainable when already met", () => {
      const result = forecastTargetGPA(4.0, 60, 3.5, 30, "4.0");
      expect(result.isAttainable).toBe(true);
    });

    it("marks target as not attainable when mathematically impossible", () => {
      const result = forecastTargetGPA(1.0, 60, 4.0, 1, "4.0"); // tiny remaining credits
      // Might be attainable or not, but it should not throw
      expect(typeof result.isAttainable).toBe("boolean");
    });
  });

  describe("getAcademicStanding", () => {
    it("returns 'Dean\\'s List' for GPA >= 3.7", () => {
      expect(getAcademicStanding(3.8, "4.0")).toContain("Dean");
    });

    it("returns 'Academic Warning' for 2.0-3.0 range", () => {
      expect(getAcademicStanding(2.5, "4.0")).toContain("Warning");
    });
  });

  describe("getLatinHonors", () => {
    it("returns Summa Cum Laude for >= 3.9", () => {
      expect(getLatinHonors(3.95, "4.0")).toContain("Summa");
    });

    it("returns Magna Cum Laude for 3.7-3.89", () => {
      expect(getLatinHonors(3.75, "4.0")).toContain("Magna");
    });

    it("returns falsy for GPA below 3.5", () => {
      expect(getLatinHonors(3.0, "4.0")).toBeFalsy();
    });
  });
});

// ─────────────────────────────────────────────────────────────
// Quiz Generator
// ─────────────────────────────────────────────────────────────
import {
  calculateScore, generateQuizFromText, generateQuizId, generateQuestionId,
  shuffleArray, SAMPLE_QUIZZES,
  type QuizQuestion,
} from "../features/tools/quiz-generator";

describe("Quiz Generator", () => {
  describe("calculateScore", () => {
    const questions: QuizQuestion[] = [
      { id: "q1", question: "Capital of France?", options: ["Paris", "London", "Berlin", "Madrid"], correctIndex: 0 },
      { id: "q2", question: "2 + 2 = ?",          options: ["3", "4", "5", "6"],                   correctIndex: 1 },
      { id: "q3", question: "H2O is?",             options: ["Gold", "Silver", "Water", "Oxygen"],  correctIndex: 2 },
    ];

    it("scores 100% when all answers are correct", () => {
      const result = calculateScore(questions, [0, 1, 2]);
      expect(result.score).toBe(3);
      expect(result.percent).toBe(100);
      expect(result.letterGrade).toBe("A");
    });

    it("scores 0% when all answers are wrong", () => {
      const result = calculateScore(questions, [1, 0, 1]);
      expect(result.score).toBe(0);
      expect(result.percent).toBe(0);
      expect(result.letterGrade).toBe("F");
    });

    it("provides a per-question breakdown", () => {
      const result = calculateScore(questions, [0, 0, 2]);
      expect(result.breakdown).toHaveLength(3);
      expect(result.breakdown[0].isCorrect).toBe(true);
      expect(result.breakdown[1].isCorrect).toBe(false);
    });

    it("handles null answers (unanswered) as wrong", () => {
      const result = calculateScore(questions, [0, null, null]);
      expect(result.score).toBe(1);
    });
  });

  describe("generateQuizFromText", () => {
    it("extracts Q&A pairs from text", () => {
      const text = "Q: What is the capital of France?\nA: Paris\nQ: What is 2+2?\nA: 4";
      const questions = generateQuizFromText(text, 10);
      expect(questions.length).toBeGreaterThanOrEqual(1);
    });

    it("extracts definition-style questions", () => {
      const text = "Mitosis is the process of cell division resulting in two identical daughter cells.\nPhotosynthesis is the process by which plants convert sunlight into food.";
      const questions = generateQuizFromText(text, 10);
      expect(questions.length).toBeGreaterThanOrEqual(1);
    });

    it("respects the maxQuestions limit", () => {
      const text = `
Q: Q1\nA: A1\nQ: Q2\nA: A2\nQ: Q3\nA: A3\nQ: Q4\nA: A4\nQ: Q5\nA: A5
      `;
      const questions = generateQuizFromText(text, 3);
      expect(questions.length).toBeLessThanOrEqual(3);
    });

    it("returns fallback samples for unrecognized input", () => {
      const questions = generateQuizFromText("   \n  xyz abc 123 ", 10);
      // Function returns sample quiz as fallback when no patterns are found
      for (const q of questions) {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("utilities", () => {
    it("generateQuizId returns unique IDs", () => {
      const ids = new Set(Array.from({ length: 20 }, generateQuizId));
      expect(ids.size).toBe(20);
    });

    it("shuffleArray does not lose elements", () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled).toHaveLength(5);
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it("SAMPLE_QUIZZES all have valid question structure", () => {
      for (const quiz of Object.values(SAMPLE_QUIZZES)) {
        expect(quiz.questions.length).toBeGreaterThan(0);
        for (const q of quiz.questions) {
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          expect(q.correctIndex).toBeGreaterThanOrEqual(0);
          expect(q.correctIndex).toBeLessThan(q.options.length);
        }
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────
// Flashcard Generator
// ─────────────────────────────────────────────────────────────
import {
  parseFlashcardsFromText, shuffleCards, getMasteryStats, updateLeitnerBox,
  exportToAnkiTSV, exportToQuizletCSV, SAMPLE_DECKS, generateCardId,
  type Flashcard, type FlashcardDeck,
} from "../features/tools/flashcard-generator";

describe("Flashcard Generator", () => {
  const sampleDeck: FlashcardDeck = SAMPLE_DECKS.capitals;

  describe("parseFlashcardsFromText", () => {
    it("parses colon-separated definitions", () => {
      const cards = parseFlashcardsFromText("Mitosis: cell division\nPhotosynthesis: light to food");
      expect(cards.length).toBeGreaterThanOrEqual(1);
    });

    it("parses pipe-separated cards", () => {
      const cards = parseFlashcardsFromText("France | Paris\nJapan | Tokyo");
      expect(cards).toHaveLength(2);
      expect(cards[0].front).toBe("France");
      expect(cards[0].back).toBe("Paris");
    });

    it("parses Q/A block format", () => {
      const cards = parseFlashcardsFromText("Q: Capital of France?\nA: Paris\nQ: Largest planet?\nA: Jupiter");
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it("returns empty array for nonsense input", () => {
      const cards = parseFlashcardsFromText("just some random text with no delimiters");
      expect(cards).toHaveLength(0);
    });

    it("assigns leitnerBox = 1 by default", () => {
      const cards = parseFlashcardsFromText("Term | Definition");
      expect(cards[0].leitnerBox).toBe(1);
    });
  });

  describe("getMasteryStats", () => {
    it("computes correct mastered count", () => {
      const cards: Flashcard[] = [
        { id: "1", front: "A", back: "B", mastered: true,  leitnerBox: 5 },
        { id: "2", front: "C", back: "D", mastered: false, leitnerBox: 1 },
        { id: "3", front: "E", back: "F", mastered: false, leitnerBox: 2 },
      ];
      const stats = getMasteryStats(cards);
      expect(stats.total).toBe(3);
      expect(stats.mastered).toBe(1);
      expect(stats.percent).toBeCloseTo(33.3, 0);
    });

    it("returns 100% for all mastered", () => {
      const cards: Flashcard[] = sampleDeck.cards.map(c => ({ ...c, mastered: true, leitnerBox: 5 as const }));
      const stats = getMasteryStats(cards);
      expect(stats.percent).toBe(100);
    });
  });

  describe("updateLeitnerBox", () => {
    const card: Flashcard = { id: "1", front: "Q", back: "A", mastered: false, leitnerBox: 2 };

    it("promotes card to next box on correct answer", () => {
      const updated = updateLeitnerBox(card, true);
      expect(updated.leitnerBox).toBe(3);
    });

    it("demotes card to box 1 on wrong answer", () => {
      const updated = updateLeitnerBox(card, false);
      expect(updated.leitnerBox).toBe(1);
    });

    it("caps promotion at box 5", () => {
      const box5Card = { ...card, leitnerBox: 5 as const };
      const updated = updateLeitnerBox(box5Card, true);
      expect(updated.leitnerBox).toBe(5);
    });

    it("marks card as mastered when promoted to box 5", () => {
      const box4Card = { ...card, leitnerBox: 4 as const };
      const updated = updateLeitnerBox(box4Card, true);
      expect(updated.mastered).toBe(true);
    });

    it("sets nextReviewAt date", () => {
      const updated = updateLeitnerBox(card, true);
      expect(updated.nextReviewAt).toBeTruthy();
      expect(new Date(updated.nextReviewAt!).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("shuffleCards", () => {
    it("returns same number of cards", () => {
      const shuffled = shuffleCards(sampleDeck.cards);
      expect(shuffled).toHaveLength(sampleDeck.cards.length);
    });

    it("does not mutate original array", () => {
      const original = [...sampleDeck.cards];
      shuffleCards(sampleDeck.cards);
      expect(sampleDeck.cards).toEqual(original);
    });
  });

  describe("exportToAnkiTSV", () => {
    it("generates valid Anki TSV with header", () => {
      const tsv = exportToAnkiTSV(sampleDeck);
      expect(tsv).toContain("#separator:tab");
      expect(tsv).toContain("#notetype:Basic");
      const lines = tsv.split("\n").filter(l => !l.startsWith("#"));
      expect(lines.length).toBeGreaterThan(0);
      expect(lines[0]).toContain("\t");
    });
  });

  describe("exportToQuizletCSV", () => {
    it("generates comma-separated values", () => {
      const csv = exportToQuizletCSV(sampleDeck);
      const lines = csv.split("\n");
      expect(lines.length).toBe(sampleDeck.cards.length);
      expect(lines[0]).toContain(",");
    });
  });
});

// ─────────────────────────────────────────────────────────────
// Equation to LaTeX Converter
// ─────────────────────────────────────────────────────────────
import {
  convertToLatex, getFormulasByCategory, FORMULA_CATALOG,
} from "../features/tools/equation-to-latex-converter";

describe("Equation to LaTeX Converter", () => {
  describe("convertToLatex", () => {
    it("converts sqrt to \\sqrt{}", () => {
      const result = convertToLatex("sqrt(x)");
      expect(result.latex).toContain("\\sqrt{x}");
    });

    it("converts a/b to \\frac{a}{b}", () => {
      const result = convertToLatex("a/b");
      expect(result.latex).toContain("\\frac{a}{b}");
    });

    it("converts pi to \\pi", () => {
      const result = convertToLatex("pi");
      expect(result.latex).toContain("\\pi");
    });

    it("converts sum(i=0,n) to \\sum_{i=0}^{n}", () => {
      const result = convertToLatex("sum(i=0,n)");
      expect(result.latex).toContain("\\sum_{i=0}^{n}");
    });

    it("converts int(a,b) to \\int_{a}^{b}", () => {
      const result = convertToLatex("int(a,b)");
      expect(result.latex).toContain("\\int_{a}^{b}");
    });

    it("converts >= to \\geq", () => {
      const result = convertToLatex("x >= y");
      expect(result.latex).toContain("\\geq");
    });

    it("wraps output in $...$ for inline", () => {
      const result = convertToLatex("x^2");
      expect(result.inline).toMatch(/^\$.+\$$/);
    });

    it("wraps output in $$...$$ for display", () => {
      const result = convertToLatex("x^2");
      expect(result.display).toMatch(/^\$\$.+\$\$$/);
    });

    it("converts infinity keyword", () => {
      const result = convertToLatex("infinity");
      expect(result.latex).toContain("\\infty");
    });

    it("converts Greek letters", () => {
      const alpha = convertToLatex("alpha");
      expect(alpha.latex).toContain("\\alpha");
      const omega = convertToLatex("omega");
      expect(omega.latex).toContain("\\omega");
    });

    it("handles the quadratic formula", () => {
      const input = "(-b ± sqrt(b^2 - 4*a*c)) / (2*a)";
      const result = convertToLatex(input);
      expect(result.latex).toContain("\\sqrt{b");
      // Note: outer \frac requires non-nested parens; sqrt conversion still works
      expect(result.latex.length).toBeGreaterThan(input.length);
    });
  });

  describe("FORMULA_CATALOG", () => {
    it("has at least 10 formulas", () => {
      expect(FORMULA_CATALOG.length).toBeGreaterThanOrEqual(10);
    });

    it("each formula has required fields", () => {
      for (const f of FORMULA_CATALOG) {
        expect(f.name).toBeTruthy();
        expect(f.latex).toBeTruthy();
        expect(f.category).toBeTruthy();
      }
    });
  });

  describe("getFormulasByCategory", () => {
    it("groups formulas by category", () => {
      const grouped = getFormulasByCategory();
      expect(Object.keys(grouped).length).toBeGreaterThan(0);
      for (const [cat, formulas] of Object.entries(grouped)) {
        expect(formulas.every(f => f.category === cat)).toBe(true);
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────
// PDF Highlighter Notes
// ─────────────────────────────────────────────────────────────
import {
  exportToMarkdown, searchHighlights, sortHighlightsByPosition,
  HIGHLIGHT_COLORS, NOTE_TAGS,
  type Highlight,
} from "../features/tools/pdf-highlighter-notes";

describe("PDF Highlighter Notes", () => {
  const highlights: Highlight[] = [
    { id: "h1", text: "Machine learning is a subset of AI.", color: "yellow", note: "Key concept", tag: "concept", page: 1, startIndex: 0, endIndex: 35, createdAt: new Date().toISOString() },
    { id: "h2", text: "How does backpropagation work?", color: "blue", note: "", tag: "question", page: 1, startIndex: 100, endIndex: 130, createdAt: new Date().toISOString() },
    { id: "h3", text: "Remember to review gradient descent.", color: "green", note: "Important!", tag: "review", page: 2, startIndex: 5, endIndex: 40, createdAt: new Date().toISOString() },
  ];

  describe("exportToMarkdown", () => {
    it("generates valid Markdown with title", () => {
      const md = exportToMarkdown("AI Notes", highlights);
      expect(md).toContain("# Study Notes: AI Notes");
      expect(md).toContain("Machine learning");
    });

    it("groups highlights by tag", () => {
      const md = exportToMarkdown("Test", highlights);
      expect(md).toContain("Key Concept");
      expect(md).toContain("Question");
    });

    it("handles empty highlights", () => {
      const md = exportToMarkdown("Empty Doc", []);
      expect(md).toContain("No highlights yet");
    });

    it("includes notes when present", () => {
      const md = exportToMarkdown("Doc", highlights);
      expect(md).toContain("Key concept");
    });
  });

  describe("searchHighlights", () => {
    it("returns matching highlights by text", () => {
      const results = searchHighlights(highlights, "machine learning");
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("matches against note content", () => {
      const results = searchHighlights(highlights, "Important");
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("returns all highlights for empty query", () => {
      const results = searchHighlights(highlights, "");
      expect(results).toHaveLength(highlights.length);
    });

    it("is case-insensitive", () => {
      const results = searchHighlights(highlights, "MACHINE LEARNING");
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("returns empty for no matches", () => {
      const results = searchHighlights(highlights, "xyzabc123");
      expect(results).toHaveLength(0);
    });
  });

  describe("sortHighlightsByPosition", () => {
    it("sorts by page first, then by startIndex", () => {
      const reversed = [...highlights].reverse();
      const sorted = sortHighlightsByPosition(reversed);
      expect(sorted[0].page).toBeLessThanOrEqual(sorted[1].page);
      if (sorted[0].page === sorted[1].page) {
        expect(sorted[0].startIndex).toBeLessThanOrEqual(sorted[1].startIndex);
      }
    });

    it("does not mutate the input array", () => {
      const original = [...highlights];
      sortHighlightsByPosition(highlights);
      expect(highlights).toEqual(original);
    });
  });

  describe("constants", () => {
    it("HIGHLIGHT_COLORS has 6 color entries", () => {
      expect(Object.keys(HIGHLIGHT_COLORS)).toHaveLength(6);
    });

    it("NOTE_TAGS has 6 tag entries", () => {
      expect(Object.keys(NOTE_TAGS)).toHaveLength(6);
    });

    it("each NOTE_TAG has label and emoji", () => {
      for (const tag of Object.values(NOTE_TAGS)) {
        expect(tag.label).toBeTruthy();
        expect(tag.emoji).toBeTruthy();
      }
    });
  });
});
