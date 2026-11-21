import "server-only";
import { z } from "zod";
import { PROMPTS, type PromptId } from "@/ai-apps/prompts";
import type { AIModelTier } from "@/lib/ai/types";

/** A task bundles prompt, model tier, output format, limits and cost (blueprint section 13). */
export interface AiTaskPreset {
  id: string;
  prompt: PromptId;
  tier: AIModelTier;
  /** Preferred provider (blueprint routing plan); the others remain fallbacks. */
  provider?: "gemini" | "groq";
  output: "markdown" | "json";
  schema?: z.ZodType;
  maxInputChars: number;
  maxTokens: number;
  temperature: number;
  /** Quota units charged per successful request. */
  cost: number;
  /** Accepts one image (data URL) for vision models. */
  acceptsImage?: boolean;
  /** Adds a disclaimer line under the answer. */
  safety?: "health" | "agri" | "general";
  /** Builds the user message from the input and validated options. */
  build: (input: string, options: Record<string, string>) => string;
}

const wrap = (input: string) => `<input>\n${input}\n</input>`;
const opt = (o: Record<string, string>, key: string, allowed: string[], fallback: string) => (allowed.includes(o[key]) ? o[key] : fallback);

export const mathAnswerSchema = z.object({
  answer: z.string().min(1),
  steps: z.array(z.string()).min(1).max(20),
  explanation: z.string().default(""),
  topic: z.string().default("Maths"),
  verify: z
    .object({ equation: z.string().min(3), variable: z.string().regex(/^[a-z]$/i), values: z.array(z.number()).min(1).max(6) })
    .nullable()
    .default(null),
});

export const projectIdeaSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  estimatedTime: z.string().default(""),
  skills: z.array(z.string()).min(1),
  features: z.array(z.string()).min(3),
  techStack: z.object({ frontend: z.string().optional(), backend: z.string().optional(), database: z.string().optional(), deployment: z.string().optional() }),
  architecture: z.string().default(""),
  milestones: z.array(z.object({ title: z.string(), tasks: z.array(z.string()).min(1) })).min(2),
  stretchFeatures: z.array(z.string()).default([]),
});

export const mathReadSchema = z.object({ problem: z.string(), confidence: z.enum(["high", "medium", "low"]).default("medium") });

export const quizSchema = z.object({
  questions: z
    .array(z.object({ question: z.string().min(3), options: z.array(z.string()).min(2).max(6), correctIndex: z.number().int().min(0), explanation: z.string().default("") }))
    .min(1)
    .max(20),
});

const TASKS: AiTaskPreset[] = [
  {
    id: "math.solve",
    prompt: "math.solve@4",
    tier: "cheap",
    output: "json",
    schema: mathAnswerSchema,
    maxInputChars: 2000,
    maxTokens: 2500,
    temperature: 0.1,
    cost: 1,
    build: (input) => `Solve this problem.\n${wrap(input)}`,
  },
  {
    id: "math.read",
    prompt: "math.read@1",
    tier: "vision",
    output: "json",
    schema: mathReadSchema,
    acceptsImage: true,
    maxInputChars: 200,
    maxTokens: 400,
    temperature: 0,
    cost: 1,
    build: () => "Transcribe the maths problem in this photo.",
  },
  {
    id: "farm.photo",
    prompt: "farm.photo@1",
    tier: "vision",
    output: "markdown",
    acceptsImage: true,
    maxInputChars: 500,
    maxTokens: 1200,
    temperature: 0.3,
    cost: 2,
    safety: "agri",
    build: (input, o) => {
      const crop = o.crop ? `Crop: ${o.crop.slice(0, 60)}\n` : "";
      return `${crop}Farmer's note about the photo:\n${wrap(input || "No note")}`;
    },
  },
  {
    id: "farm.advise",
    prompt: "farm.advise@2",
    tier: "cheap",
    output: "markdown",
    maxInputChars: 3000,
    maxTokens: 1400,
    temperature: 0.3,
    cost: 1,
    safety: "agri",
    build: (input, o) => {
      const crop = o.crop ? `Crop: ${o.crop.slice(0, 60)}\n` : "";
      const region = o.region ? `Region: ${o.region.slice(0, 60)}\n` : "";
      return `${crop}${region}Question:\n${wrap(input)}`;
    },
  },
  {
    id: "project.ideas",
    provider: "groq",
    prompt: "project.ideas@3",
    tier: "cheap",
    output: "json",
    schema: projectIdeaSchema,
    maxInputChars: 1500,
    maxTokens: 3000,
    temperature: 0.8,
    cost: 1,
    build: (input, o) =>
      [
        `Skill level: ${opt(o, "level", ["beginner", "intermediate", "advanced"], "intermediate")}`,
        `Time available: ${opt(o, "time", ["1-week", "2-weeks", "1-month", "3-months"], "2-weeks").replace("-", " ")}`,
        `Project type: ${opt(o, "type", ["web", "mobile", "api", "cli", "data", "game", "extension", "fullstack"], "web")}`,
        `Interests and constraints:\n${wrap(input || "None given")}`,
      ].join("\n"),
  },
  {
    id: "study.notes",
    provider: "groq",
    prompt: "study.notes@1",
    tier: "cheap",
    output: "markdown",
    maxInputChars: 4000,
    maxTokens: 2000,
    temperature: 0.4,
    cost: 1,
    build: (input, o) => {
      const format = opt(o, "format", ["bullet", "outline", "summary", "detailed"], "bullet");
      const how: Record<string, string> = {
        bullet: "concise bullet points grouped under short headings",
        outline: "a numbered, hierarchical outline",
        summary: "a short summary of three or four paragraphs",
        detailed: "detailed notes with headings, explanations and a worked example where it helps",
      };
      return `Write ${how[format]} about this topic.\n${wrap(input)}`;
    },
  },
  {
    id: "study.quiz",
    provider: "groq",
    prompt: "study.quiz@1",
    tier: "cheap",
    output: "json",
    schema: quizSchema,
    maxInputChars: 1000,
    maxTokens: 3000,
    temperature: 0.5,
    cost: 1,
    build: (input, o) => {
      const n = Math.min(Math.max(Number(o.count) || 10, 3), 20);
      const level = opt(o, "difficulty", ["Easy", "Medium", "Hard", "Mixed"], "Medium");
      return `Write ${n} ${level.toLowerCase()} questions about this topic.\n${wrap(input)}`;
    },
  },
];

export function getTask(id: string): AiTaskPreset | undefined {
  return TASKS.find((t) => t.id === id);
}

export function taskSystem(task: AiTaskPreset): string {
  return PROMPTS[task.prompt];
}

export const SAFETY_NOTES: Record<NonNullable<AiTaskPreset["safety"]>, string> = {
  agri: "General guidance only. Check product labels and local regulations, and ask your local agriculture extension office before spraying.",
  health: "Educational information, not medical advice. Talk to a qualified professional about your situation.",
  general: "AI can make mistakes. Check important information.",
};
