"use client";

// Browser client for server-side AI tasks (/api/ai/{task}). Prompts and models live on the server.
import { getFirebaseAuth } from "@/lib/firebase";
import { getDeviceId } from "./device-id";
import type { AiQuota } from "./router";

export type AiTaskId = "ask.intent" | "math.solve" | "math.read" | "farm.advise" | "farm.photo" | "ocr.read" | "project.ideas" | "study.notes" | "study.quiz" | "diagram.mermaid";

export class AiTaskError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
  }
}

async function headers(): Promise<Record<string, string>> {
  const h: Record<string, string> = { "Content-Type": "application/json", "x-device-id": getDeviceId() };
  try {
    const token = await getFirebaseAuth()?.currentUser?.getIdToken();
    if (token) h.Authorization = `Bearer ${token}`;
  } catch {}
  return h;
}

const announce = (quota: AiQuota | undefined) => {
  if (quota) window.dispatchEvent(new CustomEvent<AiQuota>("ai-quota-updated", { detail: quota }));
};

/** Loads Cloudflare Turnstile on demand and returns a token from an invisible widget. */
async function turnstileToken(): Promise<string | null> {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  type Turnstile = { render: (el: HTMLElement, opts: Record<string, unknown>) => string; remove: (id: string) => void };
  const w = window as unknown as { turnstile?: Turnstile };
  if (!w.turnstile) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new AiTaskError("Couldn't load the human check. Check your connection."));
      document.head.appendChild(s);
    });
  }
  return new Promise((resolve) => {
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;bottom:88px;right:16px;z-index:60";
    document.body.appendChild(host);
    const id = w.turnstile!.render(host, {
      sitekey: siteKey,
      appearance: "interaction-only",
      callback: (token: string) => {
        w.turnstile!.remove(id);
        host.remove();
        resolve(token);
      },
      "error-callback": () => {
        host.remove();
        resolve(null);
      },
    });
  });
}

async function post(task: AiTaskId, input: string, options: Record<string, string | number>, signal?: AbortSignal, image?: string): Promise<Response> {
  const send = async (turnstileTokenValue?: string) =>
    fetch(`/api/ai/${task}`, { method: "POST", headers: await headers(), body: JSON.stringify({ input, options, image, turnstileToken: turnstileTokenValue }), signal });
  let res = await send();
  if (res.status === 403) {
    const body = await res.clone().json().catch(() => ({}));
    if (body.code === "TURNSTILE_REQUIRED") {
      const token = await turnstileToken();
      if (token) res = await send(token);
    }
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Something went wrong. Try again." }));
    announce(body.quota);
    throw new AiTaskError(body.error ?? `AI request failed (${res.status})`, body.code);
  }
  return res;
}

/** Runs a JSON task and returns the validated data. */
export async function runAiTask<T>(task: AiTaskId, input: string, options: Record<string, string | number> = {}, image?: string): Promise<{ data: T; note?: string; cached: boolean }> {
  const res = await post(task, input, options, undefined, image);
  const body = (await res.json()) as { data: T; note?: string; cached: boolean; quota?: AiQuota };
  announce(body.quota);
  return body;
}

/** Streams a Markdown task; `onText` receives the full text so far. Returns the final text. */
export async function streamAiTask(
  task: AiTaskId,
  input: string,
  options: Record<string, string | number>,
  onText: (text: string) => void,
  signal?: AbortSignal,
  image?: string,
): Promise<{ text: string; note?: string; cached: boolean }> {
  const res = await post(task, input, options, signal, image);
  try {
    announce(JSON.parse(res.headers.get("X-Quota") ?? "null") ?? undefined);
  } catch {}
  const note = res.headers.get("X-AI-Note");
  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += value;
    onText(text);
  }
  if (!text.trim()) throw new AiTaskError("The AI returned an empty answer. Try again.");
  return { text, note: note ? decodeURIComponent(note) : undefined, cached: res.headers.get("X-AI-Cached") === "1" };
}

/** Downsizes a photo to at most `max` px on its longest side and returns a JPEG data URL for vision tasks. */
export async function imageForAi(file: Blob, max = 1280): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
