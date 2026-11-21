import { z } from "zod";
import { completeViaServer } from "@/lib/ai/router";

const resumeContent = z.object({
  summary: z.string().trim().min(1).max(4000),
  skills: z.array(z.string().trim().min(1).max(300)).max(100),
  experience: z.array(z.string().trim().min(1).max(4000)).max(100),
  education: z.array(z.string().trim().min(1).max(2000)).max(50),
});

export async function generateResumeContent(input: Record<string, string>) {
  const response = await completeViaServer({
    tier: "cheap",
    maxTokens: 4000,
    temperature: 0.3,
    promptKey: "resume",
    prompt: JSON.stringify(input),
  });
  try {
    return resumeContent.parse(JSON.parse(response.text.trim()));
  } catch {
    throw new Error("The AI provider returned an invalid resume. Your previous resume has not been replaced.");
  }
}

export function escapeResumeText(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}