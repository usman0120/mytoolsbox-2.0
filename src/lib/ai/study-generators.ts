// Study generators backed by server AI tasks (study.notes, study.quiz). Prompts live on the server.
import { runAiTask, streamAiTask } from "./tasks-client";

export interface StudyNotes {
  content: string;
  keyPoints: string[];
  summary: string;
}

export async function generateStudyNotes(topic: string, format: string, onText?: (text: string) => void): Promise<StudyNotes> {
  const { text } = await streamAiTask("study.notes", topic, { format }, onText ?? (() => {}));
  const section = (name: string) => text.split(new RegExp(`^##\\s*${name}\\s*$`, "im"))[1]?.split(/^##\s/m)[0]?.trim() ?? "";
  const keyPoints = section("Key points").split("\n").map((l) => l.replace(/^[-*\d.)\s]+/, "").trim()).filter(Boolean);
  return { content: text.trim(), keyPoints, summary: section("Summary") };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export async function generateQuizQuestions(topic: string, difficulty: string, count: number): Promise<QuizQuestion[]> {
  const { data } = await runAiTask<{ questions: Omit<QuizQuestion, "id">[] }>("study.quiz", topic, { difficulty, count });
  const valid = data.questions.filter((q) => q.correctIndex < q.options.length);
  if (!valid.length) throw new Error("The AI reply couldn't be turned into a quiz. Try again or rephrase the topic.");
  return valid.map((q, i) => ({ ...q, id: `q${i + 1}` }));
}
