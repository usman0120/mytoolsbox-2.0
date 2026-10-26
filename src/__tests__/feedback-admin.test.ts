import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, GET, PATCH, POST } from "@/app/api/feedback/route";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(), submit: vi.fn(), read: vi.fn(), update: vi.fn(), remove: vi.fn(),
  firestore: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/firebase/config", () => ({ getFirebaseFirestore: mocks.firestore }));
vi.mock("@/lib/firebase/user-service", () => ({
  submitFeedback: mocks.submit, getFeedback: mocks.read,
  updateFeedbackStatus: mocks.update, deleteFeedback: mocks.remove,
}));

const fetchMock = vi.fn();
const cookieStore = (token?: string) => ({ get: (name: string) => name === "__session" && token ? { value: token } : undefined });
const account = (attributes: Record<string, unknown>) => ({ ok: true, json: async () => ({ users: [{ localId: "verified-id", ...attributes }] }) });
const request = (method: string, body?: unknown) => new NextRequest("http://localhost/api/feedback?id=message-id", {
  method, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "test-public-key");
  vi.stubEnv("ADMIN_EMAILS", "admin@example.com");
  vi.stubGlobal("fetch", fetchMock);
  mocks.cookies.mockResolvedValue(cookieStore("cookie-token"));
  mocks.firestore.mockReturnValue({});
  fetchMock.mockResolvedValue(account({ email: "akbarali69048@gmail.com", emailVerified: true }));
  mocks.read.mockResolvedValue([]);
  mocks.submit.mockResolvedValue("message-id");
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("feedback privileged access", () => {
  it.each([GET, PATCH, DELETE])("rejects a missing cookie before storage access", async (handler) => {
    mocks.cookies.mockResolvedValue(cookieStore());
    expect((await handler(request("GET"))).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mocks.firestore).not.toHaveBeenCalled();
    expect(mocks.read).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it.each([GET, PATCH, DELETE])("rejects forged, non-admin, and unverifiable identities before storage access", async (handler) => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 400 });
    expect((await handler(request("GET"))).status).toBe(401);
    fetchMock.mockResolvedValueOnce(account({ email: "user@example.com", emailVerified: true }));
    expect((await handler(request("GET"))).status).toBe(403);
    fetchMock.mockRejectedValueOnce(new Error("Provider offline"));
    const unavailable = await handler(request("GET"));
    expect(unavailable.status).toBe(503);
    expect(await unavailable.json()).toEqual({ error: "Authentication unavailable" });
    expect(mocks.firestore).not.toHaveBeenCalled();
    expect(mocks.read).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it.each([GET, PATCH, DELETE])("reports unconfigured or failed storage initialization without empty data or success", async (handler) => {
    mocks.firestore.mockReturnValueOnce(null);
    const unavailable = await handler(request("PATCH", { id: "message-id", status: "resolved" }));
    expect(unavailable.status).toBe(503);
    expect(await unavailable.json()).toEqual({ error: "Feedback storage unavailable" });
    mocks.firestore.mockImplementationOnce(() => { throw new Error("Initialization failed"); });
    expect((await handler(request("PATCH", { id: "message-id", status: "resolved" }))).status).toBe(503);
    expect(mocks.read).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it("reads feedback using a verified session cookie", async () => {
    mocks.read.mockResolvedValue([{ id: "message-id", message: "Actual feedback" }]);
    const response = await GET(request("GET"));
    expect(await response.json()).toEqual({ feedback: [{ id: "message-id", message: "Actual feedback" }] });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("accounts:lookup"), expect.objectContaining({ body: JSON.stringify({ idToken: "cookie-token" }) }));
  });

  it("updates and deletes only after provider verification", async () => {
    expect((await PATCH(request("PATCH", { id: "message-id", status: "resolved" }))).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith("message-id", "resolved");
    expect((await DELETE(request("DELETE"))).status).toBe(200);
    expect(mocks.remove).toHaveBeenCalledWith("message-id");
  });

  it("rejects invalid privileged mutation inputs", async () => {
    expect((await PATCH(request("PATCH", { id: "message-id", status: "invented" }))).status).toBe(400);
    expect((await DELETE(new NextRequest("http://localhost/api/feedback", { method: "DELETE" }))).status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it.each([GET, PATCH, DELETE])("reports storage failure without a fabricated success", async (handler) => {
    mocks.read.mockRejectedValue(new Error("Storage unavailable"));
    mocks.update.mockRejectedValue(new Error("Storage unavailable"));
    mocks.remove.mockRejectedValue(new Error("Storage unavailable"));
    expect((await handler(request("PATCH", { id: "message-id", status: "resolved" }))).status).toBe(500);
  });
});

describe("public feedback submission", () => {
  it("accepts anonymous submissions without cookies or identity verification", async () => {
    mocks.cookies.mockResolvedValue(cookieStore());
    const response = await POST(request("POST", { type: "bug", message: "  Actual report  " }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, id: "message-id" });
    expect(mocks.submit).toHaveBeenCalledWith({ type: "bug", message: "Actual report", name: "Anonymous", email: "" });
    expect(mocks.cookies).not.toHaveBeenCalled();
    expect(mocks.firestore).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([{ type: "bug", message: " " }, { type: "invalid", message: "Report" }])("preserves public validation", async (body) => {
    expect((await POST(request("POST", body))).status).toBe(400);
    expect(mocks.submit).not.toHaveBeenCalled();
  });
});
