import { createElement } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIImageGeneratorEngine } from "@/features/tools/ai-image-generator-engine";
import { AppPageClient } from "@/app/apps/[slug]/page-client";
import { getAppBySlug } from "@/content/apps/registry";
import { addHistoryEntry, isFavorited } from "@/lib/firebase/user-service";

const auth = vi.hoisted(() => ({ user: { uid: "test-user" } as { uid: string } | null }));
vi.mock("@/lib/auth/auth-context", () => ({ useAuth: () => auth }));
vi.mock("@/lib/auth", () => ({ useAuth: () => auth }));
vi.mock("@/lib/i18n", () => ({ useI18n: () => ({ t: (key: string) => key, localizePath: (path: string) => path, getToolName: (_slug: string, name: string) => name }) }));
vi.mock("@/features/app-engine", () => ({ AppEngine: () => createElement("div", null, "App workspace") }));
vi.mock("@/lib/firebase/user-service", () => ({ addHistoryEntry: vi.fn(), isFavorited: vi.fn(), addFavorite: vi.fn(), getFavorites: vi.fn(), removeFavorite: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/components/auth/signin-dialog", () => ({ SignInDialog: ({ open }: { open: boolean }) => open ? createElement("div", { role: "dialog" }, "Sign in") : null }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));
beforeEach(() => {
  vi.resetAllMocks(); auth.user = { uid: "test-user" };
  vi.mocked(addHistoryEntry).mockResolvedValue(undefined); vi.mocked(isFavorited).mockResolvedValue(false);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("image provider failures", () => {
  it("reports access failures honestly and includes the selected style in the request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 403 }); vi.stubGlobal("fetch", fetchMock);
    render(createElement(AIImageGeneratorEngine));
    fireEvent.change(screen.getByLabelText("Describe the image you want"), { target: { value: "A mountain lake" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Style" }), { target: { value: "watercolor" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate Image" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Image provider failed (403)");
    expect(decodeURIComponent(fetchMock.mock.calls[0][0])).toContain("Visual style: Watercolor");
    expect(screen.queryByRole("img")).not.toBeInTheDocument(); expect(screen.queryByRole("button", { name: "Download" })).not.toBeInTheDocument();
  });
  it("rejects non-image responses without manufacturing a fallback image", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(["Provider error"], { type: "text/plain" }) }));
    render(createElement(AIImageGeneratorEngine));
    fireEvent.change(screen.getByLabelText("Describe the image you want"), { target: { value: "A mountain lake" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate Image" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("did not return an image"); expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
describe("app identity integration", () => {
  it("records history once per account/app identity across rerenders", async () => {
    const first = getAppBySlug("research-assistant")!; const second = getAppBySlug("ai-notes-generator")!;
    const view = render(createElement(AppPageClient, { app: first }));
    await waitFor(() => expect(addHistoryEntry).toHaveBeenCalledTimes(1));
    view.rerender(createElement(AppPageClient, { app: { ...first } })); expect(addHistoryEntry).toHaveBeenCalledTimes(1);
    view.rerender(createElement(AppPageClient, { app: second })); await waitFor(() => expect(addHistoryEntry).toHaveBeenCalledTimes(2));
    auth.user = { uid: "second-user" }; view.rerender(createElement(AppPageClient, { app: second }));
    await waitFor(() => expect(addHistoryEntry).toHaveBeenCalledTimes(3));
    expect(addHistoryEntry).toHaveBeenLastCalledWith("second-user", expect.objectContaining({ toolId: second.id, productType: "app", action: "viewed" }));
  });
  it("does not expose a previous account's favorite after sign-out", async () => {
    vi.mocked(isFavorited).mockResolvedValue(true); const app = getAppBySlug("research-assistant")!;
    const view = render(createElement(AppPageClient, { app }));
    await waitFor(() => expect(screen.getByRole("button", { name: "fav_remove" })).toHaveAttribute("aria-pressed", "true"));
    auth.user = null; view.rerender(createElement(AppPageClient, { app }));
    expect(screen.getByRole("button", { name: "action_favorite" })).toHaveAttribute("aria-pressed", "false"); expect(addHistoryEntry).toHaveBeenCalledTimes(1);
  });
});
