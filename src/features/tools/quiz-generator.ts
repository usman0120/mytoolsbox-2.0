// Quiz Generator utility functions

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: string;
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

export function calculateScore(questions: QuizQuestion[], answers: (number | null)[]): { score: number; total: number; percent: number } {
  const total = questions.length;
  let score = 0;
  for (let i = 0; i < total; i++) {
    if (answers[i] === questions[i].correctIndex) score++;
  }
  return { score, total, percent: Math.round((score / total) * 100) };
}

export const SAMPLE_QUIZZES: Record<string, Quiz> = {
  math: {
    id: "sample_math",
    title: "Basic Mathematics Quiz",
    questions: [
      { id: "q1", question: "What is 15% of 200?", options: ["25", "30", "35", "40"], correctIndex: 1, explanation: "15% = 0.15, so 0.15 × 200 = 30" },
      { id: "q2", question: "What is the square root of 144?", options: ["10", "11", "12", "14"], correctIndex: 2, explanation: "12 × 12 = 144" },
      { id: "q3", question: "Solve: 3x + 7 = 22", options: ["x = 3", "x = 5", "x = 7", "x = 15"], correctIndex: 1, explanation: "3x = 15, so x = 5" },
      { id: "q4", question: "What is the area of a circle with radius 5? (π ≈ 3.14)", options: ["31.4", "78.5", "15.7", "25"], correctIndex: 1, explanation: "Area = πr² = 3.14 × 25 = 78.5" },
      { id: "q5", question: "What is 2³ × 2²?", options: ["2⁵", "2⁶", "4⁵", "32"], correctIndex: 0, explanation: "2³ × 2² = 2⁵ = 32" },
    ],
    createdAt: new Date().toISOString(),
  },
  science: {
    id: "sample_science",
    title: "General Science Quiz",
    questions: [
      { id: "q1", question: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], correctIndex: 0 },
      { id: "q2", question: "What planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correctIndex: 2 },
      { id: "q3", question: "What is the speed of light approximately?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], correctIndex: 0 },
      { id: "q4", question: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctIndex: 2 },
      { id: "q5", question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], correctIndex: 2 },
    ],
    createdAt: new Date().toISOString(),
  },
  history: {
    id: "sample_history",
    title: "World History Quiz",
    questions: [
      { id: "q1", question: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correctIndex: 2 },
      { id: "q2", question: "Who was the first President of the United States?", options: ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"], correctIndex: 1 },
      { id: "q3", question: "The Renaissance began in which country?", options: ["France", "England", "Italy", "Spain"], correctIndex: 2 },
      { id: "q4", question: "What ancient civilization built the pyramids?", options: ["Roman", "Greek", "Egyptian", "Persian"], correctIndex: 2 },
      { id: "q5", question: "Who painted the Mona Lisa?", options: ["Michelangelo", "Raphael", "Donatello", "Leonardo da Vinci"], correctIndex: 3 },
    ],
    createdAt: new Date().toISOString(),
  },
};