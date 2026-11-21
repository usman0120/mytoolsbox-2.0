import { runAiTask } from "../tasks-client";
import { verifySolutions, type VerifyResult } from "@/lib/math/verify";

// Math Solver: the AI writes the steps (server task "math.solve"); claimed roots are then
// substituted back into the equation locally, so a wrong answer is flagged, not trusted.

export interface MathSolverInput {
  problem: string;
}

export interface MathSolverOutput {
  solution: string;
  steps: string[];
  explanation: string;
  topic: string;
  verified: VerifyResult;
}

interface MathTaskData {
  answer: string;
  steps: string[];
  explanation: string;
  topic: string;
  verify: { equation: string; variable: string; values: number[] } | null;
}

export async function solveMath(input: MathSolverInput): Promise<MathSolverOutput> {
  const { data } = await runAiTask<MathTaskData>("math.solve", input.problem);
  const verified = data.verify ? verifySolutions(data.verify.equation, data.verify.variable, data.verify.values) : "unchecked";
  return { solution: data.answer, steps: data.steps, explanation: data.explanation, topic: data.topic, verified };
}
