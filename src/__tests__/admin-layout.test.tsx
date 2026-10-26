import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminLayout from "@/app/admin/layout";

const mocks = vi.hoisted(() => ({ access: vi.fn(), cookies: vi.fn() }));
vi.mock("@/lib/auth/admin-auth", () => ({ checkAdminAccess: mocks.access }));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); } }));
beforeEach(() => { vi.resetAllMocks(); mocks.cookies.mockResolvedValue({}); });

describe("server admin route boundary", () => {
  it("requires provider verification before rendering children", async () => {
    mocks.access.mockResolvedValue(null);
    expect(await AdminLayout({ children: "private dashboard" })).toBe("private dashboard");
    expect(mocks.access).toHaveBeenCalledOnce();
  });
  it.each([[401, "signin=true"], [403, "/access-denied"]])("redirects denied identity %i without rendering children", async (status, target) => {
    mocks.access.mockResolvedValue(status);
    await expect(AdminLayout({ children: "private dashboard" })).rejects.toThrow(String(target));
  });
  it("fails closed when Firebase cannot verify identity", async () => {
    mocks.access.mockResolvedValue(503);
    await expect(AdminLayout({ children: "private dashboard" })).rejects.toThrow("temporarily unavailable");
  });
});
