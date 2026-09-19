import { aiService } from "./base";

// ---------------------------------------------------------------------------
// Math Solver
// ---------------------------------------------------------------------------

export interface MathSolverInput {
  problem: string;
  subject?: "algebra" | "calculus" | "geometry" | "statistics" | "trigonometry" | "general";
  showSteps?: boolean;
}

export interface MathSolverOutput {
  solution: string;
  steps: string[];
  explanation: string;
}

const MATH_SYSTEM_PROMPT = `You are an expert math tutor. Solve math problems step-by-step.
Return your response as a JSON object with:
- "solution": the final answer
- "steps": an array of step-by-step working (each step is a string)
- "explanation": a plain-English explanation of the approach

Be precise. Use LaTeX notation for formulas (e.g. $x^2 + y^2 = z^2$).`;

export async function solveMath(input: MathSolverInput): Promise<MathSolverOutput> {
  const subjectHint = input.subject ? ` (${input.subject})` : "";
  const stepsHint = input.showSteps ? " Show every step in detail." : "";

  const response = await aiService(
    MATH_SYSTEM_PROMPT,
    `Solve this math problem${subjectHint}: ${input.problem}${stepsHint}`,
    { tier: "reasoning", temperature: 0.1 }
  );

  try {
    // Try to parse structured JSON
    const parsed = JSON.parse(response.text);
    return {
      solution: parsed.solution ?? response.text,
      steps: parsed.steps ?? [],
      explanation: parsed.explanation ?? "",
    };
  } catch {
    // Fallback: return raw text as solution
    return {
      solution: response.text,
      steps: [],
      explanation: "",
    };
  }
}