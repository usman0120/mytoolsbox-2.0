import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { AITextGeneratorEngine } from "@/features/tools/ai-text-generator-engine";

const mocks = vi.hoisted(() => ({ complete: vi.fn(), refresh: vi.fn() }));

vi.mock("@/lib/ai", () => ({ completeViaServer: mocks.complete }));
vi.mock("@/lib/credits/use-credits", () => ({ useCredits: () => ({ refresh: mocks.refresh }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const storageKey = "mytoolsbox-ai-chat";
const priorMessages = [
  { id: "old-user", role: "user", content: "Earlier question", timestamp: 1000 },
  { id: "old-ai", role: "assistant", content: "Earlier real reply", timestamp: 1001 },
];

function send(text = "Write a short reply") {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
}

beforeEach(() => {
  localStorage.clear();
  mocks.complete.mockReset();
  mocks.refresh.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Legacy AI text engine", () => {
  it.each([JSON.stringify(priorMessages), "{broken"])("hydrates stored data without mismatching server markup", async (raw) => {
    localStorage.setItem(storageKey, raw);
    const markup = renderToString(<AITextGeneratorEngine />);
    expect(markup).toContain("No messages yet.");
    expect(markup).not.toContain("Earlier real reply");
    expect(markup).not.toContain('role="alert"');
    const container = document.createElement("div");
    container.innerHTML = markup;
    document.body.append(container);
    const onRecoverableError = vi.fn();
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => { root = hydrateRoot(container, <AITextGeneratorEngine />, { onRecoverableError }); });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(localStorage.getItem(storageKey)).toBe(raw);
    if (raw === "{broken") expect(screen.getByRole("alert")).toHaveTextContent("Existing data is unchanged");
    else expect(screen.getByText("Earlier real reply")).toBeInTheDocument();
    act(() => root.unmount());
    container.remove();
  });

  it.each(["", "   \n", undefined])("rejects empty provider text %j without fabricating a reply", async (text) => {
    mocks.complete.mockResolvedValue({ text });
    render(<AITextGeneratorEngine />);
    send();
    expect(await screen.findByRole("alert")).toHaveTextContent("empty response");
    expect(screen.getByRole("textbox")).toHaveValue("Write a short reply");
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual([
      expect.objectContaining({ role: "user", content: "Write a short reply" }),
    ]);
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it.each([
    [401, "Authentication required", "Sign in"],
    [402, "Insufficient credits", "Insufficient credits"],
    [429, "Too many AI requests. Please wait a minute before trying again.", "Too many requests"],
    [503, "No AI providers configured on the server. Please add API keys to .env.local", "unavailable"],
  ])("reports API failure %i and retries without duplicating the user turn", async (status, detail, expected) => {
    mocks.complete.mockRejectedValueOnce(new Error(detail)).mockResolvedValueOnce({ text: "Real retry reply" });
    localStorage.setItem(storageKey, JSON.stringify(priorMessages));
    render(<AITextGeneratorEngine />);
    send();
    expect(await screen.findByRole("alert")).toHaveTextContent(String(status));
    expect(screen.getByRole("alert")).toHaveTextContent(expected);
    expect(screen.getByRole("textbox")).toHaveValue("Write a short reply");
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Real retry reply")).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(localStorage.getItem(storageKey)!)).toHaveLength(4));
    expect(mocks.complete.mock.calls[1][0].prompt).toBe(mocks.complete.mock.calls[0][0].prompt);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("reports a network rejection without generating content", async () => {
    mocks.complete.mockRejectedValue(new Error("Network unavailable"));
    render(<AITextGeneratorEngine />);
    send();
    expect(await screen.findByRole("alert")).toHaveTextContent("Network unavailable");
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toHaveLength(1);
  });

  it("appends only the actual successful response through the server-accounted request", async () => {
    mocks.complete.mockResolvedValue({ text: "  Actual provider reply  " });
    render(<AITextGeneratorEngine />);
    send();
    expect(await screen.findByText("Actual provider reply")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(mocks.complete).toHaveBeenCalledWith(expect.objectContaining({ tier: "cheap", operation: "chat_message", prompt: "Write a short reply" }));
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(JSON.parse(localStorage.getItem(storageKey)!)).toHaveLength(2));
  });

  it("does not turn a credit refresh failure into a failed generation", async () => {
    mocks.complete.mockResolvedValue({ text: "Actual reply" });
    mocks.refresh.mockRejectedValue(new Error("Balance offline"));
    render(<AITextGeneratorEngine />);
    send();
    expect(await screen.findByText("Actual reply")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue(""));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toHaveLength(2);
  });

  it("preserves previous history on mount and after new replies, including over 50 messages", async () => {
    const history = Array.from({ length: 55 }, (_, index) => ({ ...priorMessages[index % 2], id: `old-${index}` }));
    const raw = JSON.stringify(history);
    localStorage.setItem(storageKey, raw);
    mocks.complete.mockResolvedValue({ text: "New reply" });
    render(<AITextGeneratorEngine />);
    expect(localStorage.getItem(storageKey)).toBe(raw);
    send();
    expect(await screen.findByText("New reply")).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(localStorage.getItem(storageKey)!)).toHaveLength(57));
    expect(JSON.parse(localStorage.getItem(storageKey)!).slice(0, 55)).toEqual(history);
  });

  it.each(["{broken", '{"messages":[]}', '[{"role":"assistant"}]', '[{"id":"bad-date","role":"user","content":"Old text","timestamp":1e100}]'])("keeps malformed storage %s unchanged", async (raw) => {
    localStorage.setItem(storageKey, raw);
    mocks.complete.mockResolvedValue({ text: "New reply" });
    render(<AITextGeneratorEngine />);
    expect(localStorage.getItem(storageKey)).toBe(raw);
    send();
    expect(await screen.findByText("New reply")).toBeInTheDocument();
    expect(localStorage.getItem(storageKey)).toBe(raw);
  });

  it("does not send on composition Enter or Shift+Enter", () => {
    render(<AITextGeneratorEngine />);
    const input = screen.getByRole("textbox", { name: "Message" });
    fireEvent.change(input, { target: { value: "Draft" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(mocks.complete).not.toHaveBeenCalled();
    expect(input).toHaveValue("Draft");
  });

  it("retains the draft while pending and retries from the keyboard without duplicating history", async () => {
    let rejectRequest!: (error: Error) => void;
    mocks.complete.mockReturnValueOnce(new Promise((_, reject) => { rejectRequest = reject; }))
      .mockResolvedValueOnce({ text: "Keyboard retry reply" });
    render(<AITextGeneratorEngine />);
    send("Draft");
    expect(screen.getByRole("textbox")).toHaveValue("Draft");
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Clear chat" })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(mocks.complete).toHaveBeenCalledTimes(1);
    rejectRequest(new Error("Network unavailable"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Network unavailable");
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(await screen.findByText("Keyboard retry reply")).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(localStorage.getItem(storageKey)!)).toHaveLength(2));
    expect(mocks.complete.mock.calls[1][0].prompt).toBe("Draft");
  });

  it("preserves prior storage and the visible reply when saving is blocked", async () => {
    const raw = JSON.stringify(priorMessages);
    localStorage.setItem(storageKey, raw);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota exceeded"); });
    mocks.complete.mockResolvedValue({ text: "Unsaved reply" });
    render(<AITextGeneratorEngine />);
    send();
    expect(await screen.findByText("Unsaved reply")).toBeInTheDocument();
    expect(localStorage.getItem(storageKey)).toBe(raw);
    expect(screen.getByText("Earlier real reply")).toBeInTheDocument();
  });

  it("continues in memory when storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
    mocks.complete.mockResolvedValue({ text: "In-memory reply" });
    render(<AITextGeneratorEngine />);
    send();
    expect(await screen.findByText("In-memory reply")).toBeInTheDocument();
  });
});