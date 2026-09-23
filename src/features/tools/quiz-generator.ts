// Quiz Generator Core Engine & Heuristic Parser

export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  difficulty?: QuestionDifficulty;
  category?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: string;
  timeLimitMinutes?: number;
}

export interface QuizEvaluation {
  score: number;
  total: number;
  percent: number;
  letterGrade: "A" | "B" | "C" | "D" | "F";
  timeTakenSeconds?: number;
  breakdown: Array<{
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
}

export function generateQuizId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateQuestionId(): string {
  return `q_${Math.random().toString(36).slice(2, 10)}`;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateScore(
  questions: QuizQuestion[],
  answers: (number | null)[],
  timeTakenSeconds?: number
): QuizEvaluation {
  const total = questions.length;
  let score = 0;

  const breakdown = questions.map((q, idx) => {
    const userChoice = answers[idx];
    const isCorrect = userChoice === q.correctIndex;
    if (isCorrect) score++;

    return {
      questionId: q.id,
      question: q.question,
      userAnswer: userChoice !== null && userChoice !== undefined ? q.options[userChoice] || "No answer" : "Skipped",
      correctAnswer: q.options[q.correctIndex] || "N/A",
      isCorrect,
      explanation: q.explanation,
    };
  });

  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  let letterGrade: "A" | "B" | "C" | "D" | "F" = "F";
  if (percent >= 90) letterGrade = "A";
  else if (percent >= 80) letterGrade = "B";
  else if (percent >= 70) letterGrade = "C";
  else if (percent >= 60) letterGrade = "D";

  return {
    score,
    total,
    percent,
    letterGrade,
    timeTakenSeconds,
    breakdown,
  };
}

/**
 * Text-to-Quiz generator: extracts questions, definitions, facts, and dates from text notes
 */
export function generateQuizFromText(text: string, maxQuestions: number = 5): QuizQuestion[] {
  const sentences = text
    .split(/(?<=[.?!])\s+(?=[A-Z0-9])|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const questions: QuizQuestion[] = [];
  const allTerms: string[] = [];

  // Patterns for definitions: "X is ...", "X refers to ...", "X means ..."
  const definitionRegex = /^([A-Z][a-zA-Z0-9\s]{1,30})\s+(?:is|are|refers to|means|represents)\s+(.+)$/i;
  // Year/Date pattern: "... in 1945 ..." or "... on July 4, 1776 ..."
  const yearRegex = /(?:in|during|by|around)\s+([12][0-9]{3})/i;

  const parsedItems: Array<{ term: string; definition: string; raw: string }> = [];

  for (const sentence of sentences) {
    const defMatch = sentence.match(definitionRegex);
    if (defMatch) {
      const term = defMatch[1].trim();
      const def = defMatch[2].trim().replace(/[.]+$/, "");
      if (term.length > 2 && def.length > 10) {
        parsedItems.push({ term, definition: def, raw: sentence });
        allTerms.push(term);
      }
    }
  }

  // Generate Definition questions
  for (const item of parsedItems) {
    if (questions.length >= maxQuestions) break;

    // Distractors from other terms or standard distractors
    const pool = allTerms.filter((t) => t.toLowerCase() !== item.term.toLowerCase());
    const fallbackDistractors = [
      "Dynamic Allocation",
      "Linear Regression",
      "Photosynthesis",
      "Asynchronous Execution",
      "Entropy",
      "Equilibrium",
    ];

    const distractors = shuffleArray([...pool, ...fallbackDistractors])
      .filter((d) => d.toLowerCase() !== item.term.toLowerCase())
      .slice(0, 3);

    const options = shuffleArray([item.term, ...distractors]);
    const correctIndex = options.indexOf(item.term);

    questions.push({
      id: generateQuestionId(),
      question: `Which term is described by: "${item.definition}"?`,
      options,
      correctIndex,
      explanation: `${item.term} is defined as ${item.definition}.`,
      difficulty: "medium",
      category: "Definitions",
    });
  }

  // If we still need more questions, look for sentences with dates or numbers
  if (questions.length < maxQuestions) {
    for (const sentence of sentences) {
      if (questions.length >= maxQuestions) break;
      const yearMatch = sentence.match(yearRegex);
      if (yearMatch) {
        const year = parseInt(yearMatch[1], 10);
        const distractors = [String(year - 1), String(year + 1), String(year + 5)];
        const options = shuffleArray([String(year), ...distractors]);
        const correctIndex = options.indexOf(String(year));

        const prompt = sentence.replace(yearMatch[1], "______");

        questions.push({
          id: generateQuestionId(),
          question: `Complete the statement: "${prompt}"`,
          options,
          correctIndex,
          explanation: sentence,
          difficulty: "hard",
          category: "History & Dates",
        });
      }
    }
  }

  // Fallback: if text had no recognizable patterns, generate questions from sample
  if (questions.length === 0) {
    return SAMPLE_QUIZZES.science.questions.slice(0, maxQuestions);
  }

  return questions.slice(0, maxQuestions);
}

export const SAMPLE_QUIZZES: Record<string, Quiz> = {
  math: {
    id: "sample_math",
    title: "Basic Mathematics Quiz",
    timeLimitMinutes: 5,
    questions: [
      { id: "q1", question: "What is 15% of 200?", options: ["25", "30", "35", "40"], correctIndex: 1, explanation: "15% = 0.15, so 0.15 × 200 = 30", difficulty: "easy" },
      { id: "q2", question: "What is the square root of 144?", options: ["10", "11", "12", "14"], correctIndex: 2, explanation: "12 × 12 = 144", difficulty: "easy" },
      { id: "q3", question: "Solve: 3x + 7 = 22", options: ["x = 3", "x = 5", "x = 7", "x = 15"], correctIndex: 1, explanation: "3x = 15, so x = 5", difficulty: "medium" },
      { id: "q4", question: "What is the area of a circle with radius 5? (π ≈ 3.14)", options: ["31.4", "78.5", "15.7", "25"], correctIndex: 1, explanation: "Area = πr² = 3.14 × 25 = 78.5", difficulty: "medium" },
      { id: "q5", question: "What is 2³ × 2²?", options: ["2⁵ (32)", "2⁶ (64)", "4⁵ (1024)", "16"], correctIndex: 0, explanation: "2³ × 2² = 2⁵ = 32", difficulty: "hard" },
    ],
    createdAt: new Date().toISOString(),
  },
  science: {
    id: "sample_science",
    title: "General Science Quiz",
    timeLimitMinutes: 5,
    questions: [
      { id: "q1", question: "What is the chemical formula for water?", options: ["H2O", "CO2", "NaCl", "O2"], correctIndex: 0, explanation: "Two hydrogen atoms bonded to one oxygen atom", difficulty: "easy" },
      { id: "q2", question: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correctIndex: 2, explanation: "Mars appears red due to iron oxide on its surface", difficulty: "easy" },
      { id: "q3", question: "What is the approximate speed of light in a vacuum?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], correctIndex: 0, explanation: "Approximately 299,792 km/s", difficulty: "medium" },
      { id: "q4", question: "What gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctIndex: 2, explanation: "Plants convert CO2 and sunlight into glucose and oxygen", difficulty: "easy" },
      { id: "q5", question: "What organelle is known as the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], correctIndex: 2, explanation: "Mitochondria generate most of the chemical energy needed by the cell (ATP)", difficulty: "easy" },
    ],
    createdAt: new Date().toISOString(),
  },
  history: {
    id: "sample_history",
    title: "World History Quiz",
    timeLimitMinutes: 5,
    questions: [
      { id: "q1", question: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correctIndex: 2, explanation: "WWII concluded in September 1945", difficulty: "easy" },
      { id: "q2", question: "Who was the first President of the United States?", options: ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"], correctIndex: 1, explanation: "George Washington served from 1789 to 1797", difficulty: "easy" },
      { id: "q3", question: "The Renaissance began in which European country?", options: ["France", "England", "Italy", "Spain"], correctIndex: 2, explanation: "The Renaissance originated in Florence, Italy in the 14th century", difficulty: "medium" },
      { id: "q4", question: "What ancient civilization constructed the Great Pyramids of Giza?", options: ["Roman", "Greek", "Egyptian", "Babylonian"], correctIndex: 2, explanation: "Constructed during Egypt's Old Kingdom era", difficulty: "easy" },
      { id: "q5", question: "Who painted the Mona Lisa and The Last Supper?", options: ["Michelangelo", "Raphael", "Donatello", "Leonardo da Vinci"], correctIndex: 3, explanation: "Leonardo da Vinci painted both masterpieces during the Italian High Renaissance", difficulty: "easy" },
    ],
    createdAt: new Date().toISOString(),
  },
};