import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(), checkCredits: vi.fn(), deductCredits: vi.fn(), summary: vi.fn(),
  complete: vi.fn(), fetchConversations: vi.fn(), saveConversation: vi.fn(),
  updateConversation: vi.fn(), deleteConversation: vi.fn(), deleteAllConversations: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/credits", () => ({ checkCredits: mocks.checkCredits, deductCredits: mocks.deductCredits, getUserCreditSummary: mocks.summary }));
vi.mock("@/lib/ai", () => ({ complete: mocks.complete, getAvailableProviders: () => ["openai"], getRecommendedProvider: () => "openai" }));
vi.mock("@/lib/payments/abuse", () => ({ checkAbuse: () => ({ allowed: true }) }));
vi.mock("@/features/ai/chat-persistence", () => ({
  fetchConversations: mocks.fetchConversations, saveConversation: mocks.saveConversation,
  updateConversation: mocks.updateConversation, deleteConversation: mocks.deleteConversation,
  deleteAllConversations: mocks.deleteAllConversations,
}));

const token = (uid = "verified_user_123", provider = "password") => {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: uid, exp: Math.floor(Date.now() / 1000) + 3600, firebase: { sign_in_provider: provider } })).toString("base64url");
  return `${header}.${payload}.mock_signature`;
};
const cookieStore = (session?: string, uid?: string) => ({
  get: (name: string) => {
    const value = name === "__session" ? session : name === "__uid" ? uid : undefined;
    return value === undefined ? undefined : { value };
  },
});
const fetchMock = vi.fn();
const accountResponse = () => ({ ok: true, json: async () => ({ users: [{ localId: "verified_user_123" }] }) });
const routes = ["completion", "chat", "credits", "conversation list", "conversation mutation"] as const;
type Route = typeof routes[number];
let requestNumber = 0;

async function callRoute(route: Route, authorization?: string, mutation: { action: string; conversation?: { id: string; title: string } } = { action: "clear" }) {
  requestNumber += 1;
  const method = route === "credits" || route === "conversation list" ? "GET" : "POST";
  const request = new NextRequest("http://localhost/api/ai", {
    method,
    headers: { "Content-Type": "application/json", "x-real-ip": `test-ip-${requestNumber}`, ...(authorization === undefined ? {} : { authorization }) },
    ...(method === "POST" ? { body: JSON.stringify({ prompt: "Test prompt", messages: [{ role: "user", content: "Test message" }], ...mutation }) } : {}),
  });
  switch (route) {
    case "completion": return (await import("@/app/api/ai/route")).POST(request);
    case "chat": return (await import("@/app/api/ai/chat/route")).POST(request);
    case "credits": return (await import("@/app/api/ai/credits/route")).GET(request);
    case "conversation list": return (await import("@/app/api/ai/conversations/route")).GET(request);
    case "conversation mutation": return (await import("@/app/api/ai/conversations/route")).POST(request);
  }
}

function expectNoProtectedWork() {
  for (const mock of [mocks.checkCredits, mocks.deductCredits, mocks.summary, mocks.complete, mocks.fetchConversations, mocks.saveConversation, mocks.updateConversation, mocks.deleteConversation, mocks.deleteAllConversations]) {
    expect(mock).not.toHaveBeenCalled();
  }
  for (const [url] of fetchMock.mock.calls) {
    expect(url).toContain("identitytoolkit.googleapis.com/v1/accounts:lookup");
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockReset();
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "test-public-key");
  for (const name of ["OPENAI_API_KEY", "GEMINI_API_KEY", "NEXT_PUBLIC_GEMINI_API_KEY", "GROQ_API_KEY", "NEXT_PUBLIC_GROQ_API_KEY", "CLAUDE_API_KEY", "DEEPSEEK_API_KEY", "MISTRAL_API_KEY"]) {
    vi.stubEnv(name, name === "OPENAI_API_KEY" ? "test-provider-key" : "");
  }
  vi.stubGlobal("fetch", fetchMock);
  mocks.cookies.mockResolvedValue(cookieStore(token()));
  mocks.checkCredits.mockResolvedValue({ allowed: true, remaining: 1000, required: 10 });
  mocks.deductCredits.mockResolvedValue({ remaining: 990, used: 10 });
  mocks.summary.mockResolvedValue({ remaining: 990, total: 1000, used: 10, tier: "free_account", periodStart: "start", periodEnd: "end", daysRemaining: 29 });
  mocks.fetchConversations.mockResolvedValue([]);
  mocks.complete.mockResolvedValue({ text: "Mock answer", provider: "openai", model: "mock-model" });
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("shared API verified authentication", () => {
  it.each(routes)("blocks forged JWTs before protected work: %s", async (route) => {
    mocks.cookies.mockResolvedValue(cookieStore(token("victim_user_123"), "victim_user_123"));
    fetchMock.mockResolvedValue({ ok: false, status: 400 });
    expect((await callRoute(route)).status).toBe(401);
    expectNoProtectedWork();
  });

  it.each(routes)("blocks UID-only cookies without verification requests: %s", async (route) => {
    mocks.cookies.mockResolvedValue(cookieStore(undefined, "victim_user_123"));
    expect((await callRoute(route)).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
    expectNoProtectedWork();
  });

  it.each(routes)("fails closed truthfully when Firebase configuration is missing: %s", async (route) => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "");
    const response = await callRoute(route);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: "Authentication verification unavailable" });
    expect(fetchMock).not.toHaveBeenCalled();
    expectNoProtectedWork();
  });

  it.each(routes)("fails closed when Firebase is unreachable: %s", async (route) => {
    fetchMock.mockRejectedValue(new Error("network"));
    expect((await callRoute(route)).status).toBe(503);
    expectNoProtectedWork();
  });

  it.each(routes)("rejects mismatching UID cookies: %s", async (route) => {
    mocks.cookies.mockResolvedValue(cookieStore(token(), "victim_user_123"));
    fetchMock.mockResolvedValue(accountResponse());
    expect((await callRoute(route)).status).toBe(401);
    expectNoProtectedWork();
  });

  it.each(["completion", "credits", "conversation list", "conversation mutation"] as const)("accepts Bearer identity with verified UID: %s", async (route) => {
    mocks.cookies.mockResolvedValue(cookieStore());
    fetchMock.mockResolvedValueOnce(accountResponse());
    mocks.checkCredits.mockResolvedValue({ allowed: false, remaining: 0, required: 10 });
    const bearerToken = token();
    expect((await callRoute(route, `bEaReR ${bearerToken}`)).status).toBe(route === "completion" ? 402 : 200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ idToken: bearerToken });
  });

  it.each(["completion", "credits", "conversation list", "conversation mutation"] as const)("does not downgrade invalid Authorization to a valid cookie: %s", async (route) => {
    expect((await callRoute(route, "Basic invalid")).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
    expectNoProtectedWork();
  });

  it.each(["completion", "chat"] as const)("retains anonymous AI rejection: %s", async (route) => {
    mocks.cookies.mockResolvedValue(cookieStore(token("verified_user_123", "anonymous")));
    fetchMock.mockResolvedValue(accountResponse());
    expect((await callRoute(route)).status).toBe(401);
    expectNoProtectedWork();
  });

  it.each(["completion", "chat"] as const)("preserves credit checks and deduction on verified success: %s", async (route) => {
    fetchMock.mockResolvedValueOnce(accountResponse());
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: "Mock answer" } }], usage: {} }) });
    const response = await callRoute(route);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ text: "Mock answer", creditsRemaining: 990 });
    expect(mocks.checkCredits).toHaveBeenCalledWith("verified_user_123", route === "chat" ? "chat_message" : "simple_rewrite");
    expect(mocks.deductCredits).toHaveBeenCalledWith("verified_user_123", route === "chat" ? "chat_message" : "simple_rewrite");
    expect(mocks.deductCredits.mock.invocationCallOrder[0]).toBeGreaterThan(mocks.checkCredits.mock.invocationCallOrder[0]);
  });

  it.each(["completion", "chat"] as const)("does not deduct or invoke providers on insufficient credits: %s", async (route) => {
    fetchMock.mockResolvedValueOnce(accountResponse());
    mocks.checkCredits.mockResolvedValue({ allowed: false, remaining: 0, required: 10 });
    expect((await callRoute(route)).status).toBe(402);
    expect(mocks.deductCredits).not.toHaveBeenCalled();
    expect(mocks.complete).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(["completion", "chat"] as const)("does not deduct credits after provider failure: %s", async (route) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      fetchMock.mockResolvedValueOnce(accountResponse());
      fetchMock.mockResolvedValueOnce({ ok: false, status: 503, text: async () => "Mock provider unavailable" });
      mocks.complete.mockRejectedValueOnce(new Error("Mock provider unavailable"));
      expect((await callRoute(route)).status).toBe(route === "completion" ? 502 : 500);
      expect(mocks.checkCredits).toHaveBeenCalledWith("verified_user_123", route === "chat" ? "chat_message" : "simple_rewrite");
      expect(mocks.deductCredits).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it("keeps the credit response and anonymous credit access unchanged", async () => {
    mocks.cookies.mockResolvedValue(cookieStore(token("verified_user_123", "anonymous")));
    fetchMock.mockResolvedValueOnce(accountResponse());
    const response = await callRoute("credits");
    expect(response.status).toBe(200);
    expect(mocks.summary).toHaveBeenCalledWith("verified_user_123");
    expect(await response.json()).toEqual({ remaining: 990, total: 1000, used: 10, tier: "free_account", periodStart: "start", periodEnd: "end", daysRemaining: 29 });
  });

  it("uses the verified UID for conversation reads and all mutations", async () => {
    mocks.cookies.mockResolvedValue(cookieStore(token("verified_user_123", "anonymous")));
    fetchMock.mockResolvedValue(accountResponse());
    expect((await callRoute("conversation list")).status).toBe(200);
    expect(mocks.fetchConversations).toHaveBeenCalledWith("verified_user_123");
    const conversation = { id: "existing-conversation", title: "Existing title" };
    for (const action of ["save", "update", "delete", "clear"]) {
      expect((await callRoute("conversation mutation", undefined, { action, conversation })).status).toBe(200);
    }
    expect(mocks.saveConversation).toHaveBeenCalledWith("verified_user_123", conversation);
    expect(mocks.updateConversation).toHaveBeenCalledWith("verified_user_123", conversation.id, conversation);
    expect(mocks.deleteConversation).toHaveBeenCalledWith("verified_user_123", conversation.id);
    expect(mocks.deleteAllConversations).toHaveBeenCalledWith("verified_user_123");
  });
});