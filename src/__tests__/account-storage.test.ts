import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFavorites, getHistory, getUserProfile, removeFavorite, removeHistoryEntry, clearHistory, saveUserProfile } from "@/lib/firebase/user-service";

const mocks = vi.hoisted(() => ({ db: vi.fn(), get: vi.fn(), update: vi.fn(), set: vi.fn() }));
vi.mock("@/lib/firebase/config", () => ({ getFirebaseFirestore: mocks.db }));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal<typeof import("firebase/firestore")>(),
  doc: () => "profile-reference", getDoc: mocks.get, updateDoc: mocks.update, setDoc: mocks.set,
  deleteField: () => "delete-field",
}));
beforeEach(() => { vi.resetAllMocks(); mocks.db.mockReturnValue(null); });

describe("truthful account storage feedback", () => {
  it("reports unavailable storage instead of fake empty lists or successful mutations", async () => {
    for (const call of [() => getUserProfile("user"), () => getFavorites("user"), () => getHistory("user"),
      () => removeFavorite("user", "favorite"), () => removeHistoryEntry("user", "history"), () => clearHistory("user")]) {
      await expect(call()).rejects.toThrow("temporarily unavailable");
    }
  });
  it("removes lifecycle timestamps without sending invalid undefined values to Firestore", async () => {
    mocks.db.mockReturnValue({});
    mocks.get.mockResolvedValue({ exists: () => true, data: () => ({ status: "pending_deletion" }) });
    await saveUserProfile("user", { status: "active", deletionRequestedAt: undefined, deletionScheduledAt: undefined });
    expect(mocks.update).toHaveBeenCalledWith("profile-reference", expect.objectContaining({
      status: "active", deletionRequestedAt: "delete-field", deletionScheduledAt: "delete-field",
    }));
  });
});
