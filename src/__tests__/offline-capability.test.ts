import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  canWorkOffline,
  useOnlineStatus,
  useOfflineCapable,
  useOfflineQueue,
} from "@/hooks/use-offline";

// ---------------------------------------------------------------------------
// canWorkOffline — pure function tests
// ---------------------------------------------------------------------------

describe("canWorkOffline", () => {
  it("returns true for calculator paths", () => {
    expect(canWorkOffline("/tools/calculator")).toBe(true);
    expect(canWorkOffline("/tools/calculator/scientific")).toBe(true);
    expect(canWorkOffline("/calculators/mortgage")).toBe(true);
  });

  it("returns true for JSON tools", () => {
    expect(canWorkOffline("/tools/json")).toBe(true);
    expect(canWorkOffline("/tools/json-formatter")).toBe(true);
  });

  it("returns true for text tools", () => {
    expect(canWorkOffline("/tools/text")).toBe(true);
    expect(canWorkOffline("/tools/text-diff")).toBe(true);
  });

  it("returns true for QR code tools", () => {
    expect(canWorkOffline("/tools/qr")).toBe(true);
    expect(canWorkOffline("/tools/qr-generator")).toBe(true);
  });

  it("returns true for unit converters", () => {
    expect(canWorkOffline("/tools/unit-converter")).toBe(true);
    expect(canWorkOffline("/converters/length")).toBe(true);
  });

  it("returns true for color tools", () => {
    expect(canWorkOffline("/tools/color")).toBe(true);
    expect(canWorkOffline("/tools/color-picker")).toBe(true);
  });

  it("returns true for base64 tools", () => {
    expect(canWorkOffline("/tools/base64")).toBe(true);
  });

  it("returns true for regex tools", () => {
    expect(canWorkOffline("/tools/regex")).toBe(true);
    expect(canWorkOffline("/tools/regex-tester")).toBe(true);
  });

  it("returns true for markdown tools", () => {
    expect(canWorkOffline("/tools/markdown")).toBe(true);
    expect(canWorkOffline("/tools/markdown-preview")).toBe(true);
  });

  it("returns true for diff tools", () => {
    expect(canWorkOffline("/tools/diff")).toBe(true);
  });

  it("returns false for AI-dependent paths", () => {
    expect(canWorkOffline("/tools/ai-chat")).toBe(false);
    expect(canWorkOffline("/tools/image-generator")).toBe(false);
    expect(canWorkOffline("/ai/chat")).toBe(false);
  });

  it("returns false for account/settings paths", () => {
    expect(canWorkOffline("/account")).toBe(false);
    expect(canWorkOffline("/settings")).toBe(false);
    expect(canWorkOffline("/dashboard")).toBe(false);
  });

  it("returns false for search", () => {
    expect(canWorkOffline("/search")).toBe(false);
  });

  it("returns false for empty path", () => {
    expect(canWorkOffline("")).toBe(false);
  });

  it("returns false for root path", () => {
    expect(canWorkOffline("/")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// useOnlineStatus — requires jsdom navigator.onLine mocking
// ---------------------------------------------------------------------------

describe("useOnlineStatus", () => {
  let onlineSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    onlineSpy = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });

  afterEach(() => {
    onlineSpy.mockRestore();
  });

  it("reports online when navigator.onLine is true", () => {
    onlineSpy.mockReturnValue(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it("reports offline when navigator.onLine is false", () => {
    onlineSpy.mockReturnValue(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.isOnline).toBe(false);
  });

  it("transitions from online to offline via event", () => {
    onlineSpy.mockReturnValue(true);
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOnline).toBe(true);

    // Simulate going offline
    act(() => {
      onlineSpy.mockReturnValue(false);
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOnline).toBe(true);
  });

  it("transitions from offline to online via event", () => {
    onlineSpy.mockReturnValue(false);
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOnline).toBe(true); // initial wasOnline is true

    // Simulate going online
    act(() => {
      onlineSpy.mockReturnValue(true);
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOnline).toBe(false); // was online before? no, was offline
  });

  it("updates lastChecked on status change", () => {
    onlineSpy.mockReturnValue(true);
    const { result } = renderHook(() => useOnlineStatus());

    const before = result.current.lastChecked;

    act(() => {
      onlineSpy.mockReturnValue(false);
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.lastChecked).toBeGreaterThanOrEqual(before);
  });
});

// ---------------------------------------------------------------------------
// useOfflineCapable
// ---------------------------------------------------------------------------

describe("useOfflineCapable", () => {
  let onlineSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    onlineSpy = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });

  afterEach(() => {
    onlineSpy.mockRestore();
  });

  it("returns capable=true with no message when online", () => {
    onlineSpy.mockReturnValue(true);
    const { result } = renderHook(
      (pathname: string) => useOfflineCapable(pathname),
      { initialProps: "/tools/calculator" }
    );

    expect(result.current.isOfflineCapable).toBe(true);
    expect(result.current.offlineMessage).toBeNull();
  });

  it("returns capable=true with info message when offline but tool works offline", () => {
    onlineSpy.mockReturnValue(false);
    const { result } = renderHook(
      (pathname: string) => useOfflineCapable(pathname),
      { initialProps: "/tools/calculator" }
    );

    expect(result.current.isOfflineCapable).toBe(true);
    expect(result.current.offlineMessage).toContain("still works locally");
  });

  it("returns capable=false with warning when offline and tool needs internet", () => {
    onlineSpy.mockReturnValue(false);
    const { result } = renderHook(
      (pathname: string) => useOfflineCapable(pathname),
      { initialProps: "/ai/chat" }
    );

    expect(result.current.isOfflineCapable).toBe(false);
    expect(result.current.offlineMessage).toContain("internet connection");
  });
});

// ---------------------------------------------------------------------------
// useOfflineQueue
// ---------------------------------------------------------------------------

describe("useOfflineQueue", () => {
  let onlineSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    onlineSpy = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });

  afterEach(() => {
    onlineSpy.mockRestore();
  });

  it("starts with empty queue", () => {
    const { result } = renderHook(() => useOfflineQueue());

    expect(result.current.queue).toHaveLength(0);
    expect(result.current.queueSize).toBe(0);
  });

  it("enqueues actions", () => {
    const { result } = renderHook(() => useOfflineQueue());

    act(() => {
      result.current.enqueue({
        id: "1",
        action: async () => {},
        description: "Save settings",
        createdAt: Date.now(),
      });
    });

    expect(result.current.queueSize).toBe(1);
    expect(result.current.queue[0].description).toBe("Save settings");
  });

  it("dequeues actions by id", () => {
    const { result } = renderHook(() => useOfflineQueue());

    act(() => {
      result.current.enqueue({
        id: "1",
        action: async () => {},
        description: "Action 1",
        createdAt: Date.now(),
      });
      result.current.enqueue({
        id: "2",
        action: async () => {},
        description: "Action 2",
        createdAt: Date.now(),
      });
    });

    expect(result.current.queueSize).toBe(2);

    act(() => {
      result.current.dequeue("1");
    });

    expect(result.current.queueSize).toBe(1);
    expect(result.current.queue[0].id).toBe("2");
  });

  it("clears entire queue", () => {
    const { result } = renderHook(() => useOfflineQueue());

    act(() => {
      result.current.enqueue({
        id: "1",
        action: async () => {},
        description: "Action 1",
        createdAt: Date.now(),
      });
      result.current.enqueue({
        id: "2",
        action: async () => {},
        description: "Action 2",
        createdAt: Date.now(),
      });
    });

    act(() => {
      result.current.clearQueue();
    });

    expect(result.current.queueSize).toBe(0);
  });

  it("replays queue when coming back online", async () => {
    onlineSpy.mockReturnValue(false);

    const action1 = vi.fn().mockResolvedValue(undefined);
    const action2 = vi.fn().mockResolvedValue(undefined);

    const { result, rerender } = renderHook(() => useOfflineQueue());

    // Enqueue while offline
    act(() => {
      result.current.enqueue({
        id: "1",
        action: action1,
        description: "Action 1",
        createdAt: Date.now(),
      });
      result.current.enqueue({
        id: "2",
        action: action2,
        description: "Action 2",
        createdAt: Date.now(),
      });
    });

    expect(result.current.queueSize).toBe(2);

    // Come back online
    act(() => {
      onlineSpy.mockReturnValue(true);
      window.dispatchEvent(new Event("online"));
    });

    // Wait for async replay
    await vi.waitFor(() => {
      expect(action1).toHaveBeenCalled();
      expect(action2).toHaveBeenCalled();
    });
  });

  it("keeps failed actions in queue for retry", async () => {
    onlineSpy.mockReturnValue(false);

    const failingAction = vi.fn().mockRejectedValue(new Error("Network error"));
    const successAction = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useOfflineQueue());

    act(() => {
      result.current.enqueue({
        id: "fail-1",
        action: failingAction,
        description: "Failing action",
        createdAt: Date.now(),
      });
      result.current.enqueue({
        id: "ok-1",
        action: successAction,
        description: "Success action",
        createdAt: Date.now(),
      });
    });

    // Come back online
    act(() => {
      onlineSpy.mockReturnValue(true);
      window.dispatchEvent(new Event("online"));
    });

    await vi.waitFor(() => {
      expect(failingAction).toHaveBeenCalled();
      expect(successAction).toHaveBeenCalled();
    });

    // Failing action should still be in queue
    expect(result.current.queue.some((q) => q.id === "fail-1")).toBe(true);
    // Success action should be removed
    expect(result.current.queue.some((q) => q.id === "ok-1")).toBe(false);
  });
});