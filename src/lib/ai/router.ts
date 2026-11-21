import type { AIProvider, AIRequest, AIResponse } from "./types";
import { getDeviceId } from "./device-id";
import { getFirebaseAuth } from "@/lib/firebase";

// All AI runs on the server (src/server/providers/ai). This module is the browser client.

/** Kept for older callers: in the browser the gateway is always the provider. */
export function getAvailableProviders(): AIProvider[] {
  return typeof window !== "undefined" ? ["server"] : [];
}

export function getRecommendedProvider(_tier?: string): AIProvider | undefined {
  return getAvailableProviders()[0];
}

export async function complete(request: AIRequest): Promise<AIResponse> {
  return completeViaServer(request);
}

export async function streamComplete(request: AIRequest, onChunk: (chunk: string) => void): Promise<AIResponse> {
  const response = await completeViaServer(request);
  onChunk(response.text);
  return response;
}

// ---------------------------------------------------------------------------
// Browser client for the /api/ai gateway (quota is enforced on the server)
// ---------------------------------------------------------------------------

export interface AiQuota {
  used: number;
  limit: number;
  remaining: number;
}

export interface ServerAIResponse extends AIResponse {
  quota?: AiQuota;
}

export async function completeViaServer(request: AIRequest): Promise<ServerAIResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json", "x-device-id": getDeviceId() };
  try {
    const token = await getFirebaseAuth()?.currentUser?.getIdToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}

  const response = await fetch("/api/ai", { method: "POST", headers, body: JSON.stringify(request) });
  const data = await response.json().catch(() => ({ error: "Something went wrong. Try again." }));

  if (typeof window !== "undefined" && data?.quota) {
    window.dispatchEvent(new CustomEvent<AiQuota>("ai-quota-updated", { detail: data.quota }));
  }
  if (!response.ok) throw new Error(data.error ?? `AI request failed (${response.status})`);
  return data as ServerAIResponse;
}
