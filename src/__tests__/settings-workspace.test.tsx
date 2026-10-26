import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SettingsPageClient } from "@/app/settings/page-client";

const mocks = vi.hoisted(() => ({
  auth: { user: { uid: "user-one", email: "one@example.com", emailVerified: true, isAnonymous: false, providerData: [{ providerId: "password" }] }, loading: false, logOut: vi.fn() },
  params: new URLSearchParams(), profile: vi.fn(), favorites: vi.fn(), history: vi.fn(), remove: vi.fn(), replace: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ useAuth: () => mocks.auth }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, push: vi.fn() }), useSearchParams: () => mocks.params }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "system", setTheme: vi.fn() }) }));
vi.mock("@/lib/i18n", () => ({ useI18n: () => ({ t: (key: string) => key, localizePath: (path: string) => path }) }));
vi.mock("@/components/auth/signin-dialog", () => ({ SignInDialog: () => null }));
vi.mock("@/lib/firebase/user-service", () => ({
  getUserProfile: mocks.profile, getFavorites: mocks.favorites, getHistory: mocks.history, removeFavorite: mocks.remove,
  clearHistory: vi.fn(), removeHistoryEntry: vi.fn(), scheduleAccountDeletion: vi.fn(), cancelAccountDeletion: vi.fn(), disableAccount: vi.fn(), reactivateAccount: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() } }));
const favorite = { id: "favorite-1", toolId: "word-counter", toolName: "Private favorite", toolSlug: "word-counter", category: "writing", addedAt: 1 };

beforeEach(() => {
  vi.resetAllMocks();
  mocks.params = new URLSearchParams();
  mocks.auth.user = { uid: "user-one", email: "one@example.com", emailVerified: true, isAnonymous: false, providerData: [{ providerId: "password" }] };
  mocks.profile.mockResolvedValue(null); mocks.favorites.mockResolvedValue([]); mocks.history.mockResolvedValue([]);
});
afterEach(cleanup);

describe("unified settings workspace", () => {
  it("contains only account, history, and favorites tabs and no profile fields or UID", async () => {
    render(<SettingsPageClient />);
    await screen.findByText("one@example.com");
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.queryByRole("tab", { name: /profile/i })).not.toBeInTheDocument();
    expect(screen.queryByText("user-one")).not.toBeInTheDocument();
    expect(mocks.favorites).not.toHaveBeenCalled();
    expect(mocks.history).not.toHaveBeenCalled();
  });
  it("shows a retryable failure, not a false empty favorites list", async () => {
    mocks.params = new URLSearchParams("tab=favorites");
    mocks.favorites.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([favorite]);
    render(<SettingsPageClient />);
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn’t load your favorites");
    expect(screen.queryByText("No Saved Favorites")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry favorites" }));
    expect(await screen.findByText("Private favorite")).toBeInTheDocument();
  });
  it("keeps history accessible if account information fails", async () => {
    mocks.params = new URLSearchParams("tab=history");
    mocks.profile.mockRejectedValue(new Error("offline"));
    render(<SettingsPageClient />);
    expect(await screen.findByText("No Activity Yet")).toBeInTheDocument();
  });
  it("clears private lists immediately on account changes and ignores late results", async () => {
    mocks.params = new URLSearchParams("tab=favorites");
    mocks.favorites.mockResolvedValueOnce([favorite]);
    const view = render(<SettingsPageClient />);
    await screen.findByText("Private favorite");
    let finish!: (value: typeof favorite[]) => void;
    mocks.favorites.mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
    mocks.auth.user = { ...mocks.auth.user, uid: "user-two", email: "two@example.com" };
    view.rerender(<SettingsPageClient />);
    expect(screen.queryByText("Private favorite")).not.toBeInTheDocument();
    await act(async () => {});
    mocks.auth.user = { ...mocks.auth.user, uid: "user-three", email: "three@example.com" };
    mocks.favorites.mockResolvedValue([]);
    view.rerender(<SettingsPageClient />);
    await act(async () => { finish([favorite]); });
    expect(screen.queryByText("Private favorite")).not.toBeInTheDocument();
  });
});
