import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminPageClient } from "@/app/admin/page-client";

const mocks = vi.hoisted(() => ({
  auth: { user: { uid: "admin-id", email: "akbarali69048@gmail.com", emailVerified: true } as { uid: string; email?: string; emailVerified?: boolean } | null, loading: false },
  push: vi.fn(), success: vi.fn(), error: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ useAuth: () => mocks.auth }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("sonner", () => ({ toast: { success: mocks.success, error: mocks.error } }));

const fetchMock = vi.fn();
const response = (data: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => data });
const security = {
  abuse: { blockedIPs: 2, tempBlockedIPs: 1, highSuspicionIPs: 3, activeRateLimitEntries: 4, activeTokens: 5 },
  blockedIPs: ["192.0.2.1"],
};
const feedbackItem = {
  id: "report /1", type: "bug", status: "new", message: "Actual submitted report",
  name: "Reporter", email: "reporter@example.com", createdAt: 1000, updatedAt: 1000,
};
const tab = (name: string) => fireEvent.click(screen.getByRole("tab", { name }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.user = { uid: "admin-id", email: "akbarali69048@gmail.com", emailVerified: true };
  mocks.auth.loading = false;
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation(async (url: string) => url.startsWith("/api/admin") ? response(security) : response({ feedback: [feedbackItem] }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("truthful admin dashboard", () => {
  it("rejects the former test UID bypass without fetching private data", () => {
    mocks.auth.user = { uid: "admin-id" };
    render(<AdminPageClient />);
    expect(screen.getByRole("alert")).toHaveTextContent("not authorized");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects the administrator email until it is verified", () => {
    mocks.auth.user = { uid: "admin-id", email: "akbarali69048@gmail.com", emailVerified: false };
    render(<AdminPageClient />);
    expect(screen.getByRole("alert")).toHaveTextContent("not authorized");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("shows unavailable metric sections without fabricated numbers", async () => {
    render(<AdminPageClient />);
    expect(await screen.findByText("Active Tokens")).toBeInTheDocument();
    expect(screen.getByText(/Usage totals and trends unavailable/)).toBeInTheDocument();
    tab("Tools");
    expect(screen.getByText(/Tool usage and ratings unavailable/)).toBeInTheDocument();
    expect(screen.queryByText("Grammar Checker")).not.toBeInTheDocument();
    tab("Users");
    expect(screen.getByText(/User totals and management unavailable/)).toBeInTheDocument();
    tab("Subscriptions");
    expect(screen.getByText(/Subscription totals and revenue unavailable/)).toBeInTheDocument();
    expect(screen.queryByText(/1,248|8,942|12%|MRR/)).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith("/api/admin?section=abuse", expect.objectContaining({ credentials: "same-origin", cache: "no-store" }));
  });

  it.each([401, 403, 404, 500, 503])("shows HTTP %i failures instead of zero metrics or empty feedback", async (status) => {
    fetchMock.mockResolvedValue(response({}, status));
    render(<AdminPageClient />);
    const expected = status === 401 ? /Sign in again/ : status === 403 ? /not authorized/ : status === 404 ? /Endpoint not found/ : status === 503 ? /Service unavailable/ : /request failed/;
    expect(await screen.findByRole("alert")).toHaveTextContent(expected);
    expect(screen.queryByText("Active Tokens")).not.toBeInTheDocument();
    tab("Abuse & Security");
    expect(screen.queryByText("No IPs currently blocked.")).not.toBeInTheDocument();
    tab("Feedback");
    expect(await screen.findByRole("alert")).toHaveTextContent(expected);
    expect(screen.queryByText("No feedback submissions yet.")).not.toBeInTheDocument();
  });

  it("reports network errors and retries real security data", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network offline"));
    render(<AdminPageClient />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Network offline");
    fireEvent.click(screen.getByRole("button", { name: "Refresh security" }));
    expect(await screen.findByText("Active Tokens")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each([{}, { abuse: {}, blockedIPs: [] }])("rejects malformed successful responses", async (data) => {
    fetchMock.mockResolvedValue(response(data));
    render(<AdminPageClient />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid server response");
    tab("Feedback");
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid server response");
    expect(screen.queryByText("No feedback submissions yet.")).not.toBeInTheDocument();
  });

  it("shows empty states only after valid empty server results", async () => {
    fetchMock.mockImplementation(async (url: string) => url.startsWith("/api/admin") ? response({ abuse: { ...security.abuse, blockedIPs: 0, tempBlockedIPs: 0 }, blockedIPs: [] }) : response({ feedback: [] }));
    render(<AdminPageClient />);
    await screen.findByText("Active Tokens");
    tab("Abuse & Security");
    expect(screen.getByText("No IPs currently blocked.")).toBeInTheDocument();
    tab("Feedback");
    expect(await screen.findByText("No feedback submissions yet.")).toBeInTheDocument();
  });

  it("removes previously loaded feedback on refresh failure without calling it empty", async () => {
    render(<AdminPageClient />);
    tab("Feedback");
    await screen.findByText("Actual submitted report");
    fetchMock.mockResolvedValue(response({}, 403));
    fireEvent.click(screen.getByRole("button", { name: "Refresh feedback" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("not authorized");
    expect(screen.queryByText("Actual submitted report")).not.toBeInTheDocument();
    expect(screen.queryByText("No feedback submissions yet.")).not.toBeInTheDocument();
  });

  it("unblocks using the real action and refreshes server security data", async () => {
    render(<AdminPageClient />);
    await screen.findByText("Active Tokens");
    tab("Abuse & Security");
    fetchMock.mockImplementation(async (_url: string, init?: RequestInit) => init?.method === "POST" ? response({ success: true }) : response({ ...security, blockedIPs: [] }));
    fireEvent.click(screen.getByRole("button", { name: "Unblock" }));
    expect(await screen.findByText("No IPs currently blocked.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/admin", expect.objectContaining({ method: "POST", credentials: "same-origin", body: JSON.stringify({ action: "unblock", ip: "192.0.2.1" }) }));
    expect(mocks.success).toHaveBeenCalledWith("IP unblocked");
  });

  it("reports a failed unblock without success or refresh", async () => {
    render(<AdminPageClient />);
    await screen.findByText("Active Tokens");
    tab("Abuse & Security");
    fetchMock.mockResolvedValue(response({}, 500));
    fireEvent.click(screen.getByRole("button", { name: "Unblock" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Security request failed (500)");
    expect(screen.getByText("192.0.2.1")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it("updates status and deletes only after confirmed server success", async () => {
    render(<AdminPageClient />);
    tab("Feedback");
    await screen.findByText("Actual submitted report");
    fetchMock.mockResolvedValue(response({ success: true }));
    fireEvent.click(screen.getByRole("button", { name: "Investigate" }));
    expect(await screen.findByText("investigating")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/feedback", expect.objectContaining({ method: "PATCH", body: JSON.stringify({ id: feedbackItem.id, status: "investigating" }) }));
    fireEvent.click(screen.getByRole("button", { name: "Resolve" }));
    expect(await screen.findByText("resolved")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(await screen.findByText("closed")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("No feedback submissions yet.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/feedback?id=report%20%2F1", expect.objectContaining({ method: "DELETE" }));
  });

  it.each(["Resolve", "Delete"])("preserves feedback on a failed %s action", async (action) => {
    render(<AdminPageClient />);
    tab("Feedback");
    await screen.findByText("Actual submitted report");
    fetchMock.mockResolvedValue(response({}, 500));
    fireEvent.click(screen.getByRole("button", { name: action }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Feedback request failed (500)");
    expect(screen.getByText("Actual submitted report")).toBeInTheDocument();
    expect(screen.getByText("new")).toBeInTheDocument();
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it("rejects a malformed successful mutation response", async () => {
    render(<AdminPageClient />);
    tab("Feedback");
    await screen.findByText("Actual submitted report");
    fetchMock.mockResolvedValue(response({}));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid server response");
    expect(screen.getByText("Actual submitted report")).toBeInTheDocument();
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it("clears privileged feedback when an action loses authorization", async () => {
    render(<AdminPageClient />);
    tab("Feedback");
    await screen.findByText("Actual submitted report");
    fetchMock.mockResolvedValue(response({}, 403));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(screen.queryByText("Actual submitted report")).not.toBeInTheDocument());
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it("disables duplicate actions while waiting for the server", async () => {
    render(<AdminPageClient />);
    tab("Feedback");
    await screen.findByText("Actual submitted report");
    let finish!: (value: ReturnType<typeof response>) => void;
    fetchMock.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    fireEvent.click(screen.getByRole("button", { name: "Resolve" }));
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    await act(async () => { finish(response({ success: true })); });
    expect(await screen.findByText("resolved")).toBeInTheDocument();
  });

  it("does not fetch privileged data while signed out or loading", () => {
    mocks.auth.loading = true;
    const view = render(<AdminPageClient />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading account");
    expect(fetchMock).not.toHaveBeenCalled();
    mocks.auth.loading = false;
    mocks.auth.user = null;
    view.rerender(<AdminPageClient />);
    expect(mocks.push).toHaveBeenCalledWith("/?signin=true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("discards privileged results on identity change, including late responses", async () => {
    let finish!: (value: ReturnType<typeof response>) => void;
    fetchMock.mockImplementation(async (url: string) => url.startsWith("/api/admin") ? response(security) : new Promise((resolve) => { finish = resolve; }));
    const view = render(<AdminPageClient />);
    await screen.findByText("Active Tokens");
    mocks.auth.user = { uid: "other-user" };
    fetchMock.mockResolvedValue(response({}, 403));
    view.rerender(<AdminPageClient />);
    expect(await screen.findByRole("alert")).toHaveTextContent("not authorized");
    await act(async () => { finish(response({ feedback: [feedbackItem] })); });
    // After identity change, the admin dashboard is replaced by the Access Restricted card.
    // The late feedback response should never be rendered: verify data is discarded.
    expect(screen.queryByText("Actual submitted report")).not.toBeInTheDocument();
  });
});
