import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { checkAdminAccess } from "@/lib/auth/admin-auth";
import { GET, POST } from "@/app/api/admin/route";

const mocks = vi.hoisted(() => ({ cookies: vi.fn(), unblock: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/payments/abuse", () => ({
  getAbuseStats: () => ({ blocked: 0 }), getBlockedIPs: () => [], unblockIP: mocks.unblock,
}));

const cookieStore = (token?: string, uid?: string) => ({
  get: (name: string) => {
    const value = name === "__session" ? token : name === "__uid" ? uid : undefined;
    return value ? { value } : undefined;
  },
});
const request = () => new NextRequest("http://localhost/api/admin");
const fetchMock = vi.fn();
const accountResponse = (account: Record<string, unknown>) => ({ ok: true, json: async () => ({ users: [account] }) });

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "test-public-key");
  vi.stubEnv("ADMIN_EMAILS", "admin@example.com");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  mocks.unblock.mockReset();
  mocks.cookies.mockResolvedValue(cookieStore("test-token"));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("verified admin access", () => {
  it("rejects missing identity without a network request", async () => {
    expect(await checkAdminAccess(request(), cookieStore())).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects forged tokens reported invalid by Firebase", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400 });
    expect(await checkAdminAccess(request(), cookieStore("forged"))).toBe(401);
  });
  it("rejects a verified ordinary user", async () => {
    fetchMock.mockResolvedValue(accountResponse({ localId: "user-id", email: "user@example.com", emailVerified: true }));
    expect(await checkAdminAccess(request(), cookieStore("valid"))).toBe(403);
  });
  it("requires email verification for the allowlist", async () => {
    fetchMock.mockResolvedValue(accountResponse({ localId: "user-id", email: "akbarali69048@gmail.com", emailVerified: false }));
    expect(await checkAdminAccess(request(), cookieStore("valid"))).toBe(403);
  });
  it("accepts only the designated verified email", async () => {
    fetchMock.mockResolvedValue(accountResponse({ localId: "admin-id", email: "AKBARALI69048@gmail.com", emailVerified: true }));
    expect(await checkAdminAccess(request(), cookieStore("valid"))).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("accounts:lookup"), expect.objectContaining({ cache: "no-store", body: JSON.stringify({ idToken: "valid" }) }));
  });
  it("does not grant access through a custom admin claim", async () => {
    fetchMock.mockResolvedValue(accountResponse({ localId: "admin-id", customAttributes: '{"admin":true}' }));
    expect(await checkAdminAccess(request(), cookieStore("valid"))).toBe(403);
  });
  it("does not grant access to other environment-allowlisted accounts", async () => {
    fetchMock.mockResolvedValue(accountResponse({ localId: "admin-id", email: "admin@example.com", emailVerified: true, customAttributes: '{"admin":true}' }));
    expect(await checkAdminAccess(request(), cookieStore("valid"))).toBe(403);
  });
  it("rejects disabled accounts and UID mismatches", async () => {
    fetchMock.mockResolvedValueOnce(accountResponse({ localId: "admin-id", disabled: true, customAttributes: '{"admin":true}' }));
    expect(await checkAdminAccess(request(), cookieStore("valid"))).toBe(401);
    fetchMock.mockResolvedValueOnce(accountResponse({ localId: "admin-id", customAttributes: '{"admin":true}' }));
    expect(await checkAdminAccess(request(), cookieStore("valid", "other-id"))).toBe(401);
  });
  it("fails closed when verification is unavailable or malformed", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network"));
    expect(await checkAdminAccess(request(), cookieStore("valid"))).toBe(503);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ users: [] }) });
    expect(await checkAdminAccess(request(), cookieStore("valid"))).toBe(401);
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "");
    expect(await checkAdminAccess(request(), cookieStore("valid"))).toBe(503);
  });
  it("does not fall back to cookies after an invalid Authorization header", async () => {
    const invalidHeader = new NextRequest("http://localhost/api/admin", { headers: { authorization: "Basic invalid" } });
    expect(await checkAdminAccess(invalidHeader, cookieStore("valid"))).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("does not fall back to cookies after an empty Authorization header", async () => {
    const emptyHeader = new NextRequest("http://localhost/api/admin", { headers: { authorization: "" } });
    expect(await checkAdminAccess(emptyHeader, cookieStore("valid"))).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("guards stats and mutations before reading or changing privileged data", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400 });
    expect((await GET(request())).status).toBe(401);
    const mutation = new NextRequest("http://localhost/api/admin", { method: "POST", body: JSON.stringify({ action: "unblock", ip: "127.0.0.1" }) });
    expect((await POST(mutation)).status).toBe(401);
    expect(mocks.unblock).not.toHaveBeenCalled();
  });
});
