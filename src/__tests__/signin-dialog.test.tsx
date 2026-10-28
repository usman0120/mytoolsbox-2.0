import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SignInDialog } from "@/components/auth/signin-dialog";

const mocks = vi.hoisted(() => ({
  email: vi.fn(), signup: vi.fn(), google: vi.fn(), guest: vi.fn(), reset: vi.fn(), upgrade: vi.fn(),
  close: vi.fn(), refresh: vi.fn(), push: vi.fn(), replace: vi.fn(), anonymous: false,
}));
vi.mock("@/lib/auth", () => ({ useAuth: () => ({
  isAnonymous: mocks.anonymous, signInWithEmail: mocks.email, signUpWithEmail: mocks.signup,
  signInWithGoogle: mocks.google, signInAsGuest: mocks.guest, resetPassword: mocks.reset,
  upgradeGuestToEmail: mocks.upgrade, upgradeGuestToGoogle: mocks.upgrade,
}) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh, push: mocks.push, replace: mocks.replace }), useSearchParams: () => new URLSearchParams() }));
vi.mock("@/lib/ui-copy", () => ({ UI_COPY: { t: (key: string) => ({ auth_signin: "Sign in", auth_signup: "Sign up", auth_guest: "Continue as guest", auth_forgot_pwd: "Forgot password?" })[key] ?? key } }));
vi.mock("@/components/common/brand-logo", () => ({ BrandLogo: () => <span>MyToolsBox</span> }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));
const submit = () => fireEvent.submit(document.querySelector("form")!);

beforeEach(() => { vi.resetAllMocks(); mocks.anonymous = false; });
afterEach(cleanup);

describe("sign-in dialog feedback", () => {
  it("has an accessible title and validates before contacting Firebase", async () => {
    render(<SignInDialog open onOpenChange={mocks.close} />);
    expect(await screen.findByRole("dialog", { name: "Welcome back" })).toBeInTheDocument();
    submit();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveFocus();
    expect(mocks.email).not.toHaveBeenCalled();
  });
  it("keeps entered data and shows actionable inline provider errors", async () => {
    mocks.email.mockRejectedValue({ code: "auth/invalid-credential" });
    render(<SignInDialog open onOpenChange={mocks.close} />);
    fireEvent.change(await screen.findByLabelText("Email address"), { target: { value: " person@example.com " } });
    fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: "password" } });
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect email or password");
    expect(mocks.email).toHaveBeenCalledWith("person@example.com", "password");
    expect((screen.getByLabelText("Email address") as HTMLInputElement).value.trim()).toBe("person@example.com");
    expect(mocks.close).not.toHaveBeenCalled();
  });
  it("prevents duplicate submissions and labels the pending action", async () => {
    let finish!: () => void;
    mocks.email.mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
    render(<SignInDialog open onOpenChange={mocks.close} />);
    fireEvent.change(await screen.findByLabelText("Email address"), { target: { value: "person@example.com" } });
    fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: "password" } });
    submit(); submit();
    expect(mocks.email).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
    await act(async () => { finish(); });
    expect(mocks.close).toHaveBeenCalledWith(false);
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
  it("confirms signup passwords and preserves the guest identity on upgrade", async () => {
    mocks.anonymous = true;
    mocks.upgrade.mockResolvedValue(undefined);
    render(<SignInDialog open onOpenChange={mocks.close} />);
    fireEvent.click(await screen.findByRole("button", { name: "Sign up" }));
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: "password" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "different" } });
    submit();
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(mocks.upgrade).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "password" } });
    await act(async () => { submit(); });
    expect(mocks.upgrade).toHaveBeenCalledWith("new@example.com", "password");
    expect(mocks.signup).not.toHaveBeenCalled();
  });
  it("does not reveal whether a password-reset account exists", async () => {
    mocks.reset.mockRejectedValue({ code: "auth/user-not-found" });
    render(<SignInDialog open onOpenChange={mocks.close} />);
    fireEvent.click(await screen.findByRole("button", { name: "Forgot password?" }));
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "missing@example.com" } });
    submit();
    expect(await screen.findByText(/If an account exists/)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("allows guests to sign into an existing Google account instead of always linking", async () => {
    mocks.anonymous = true;
    mocks.google.mockResolvedValue(undefined);
    render(<SignInDialog open onOpenChange={mocks.close} />);
    fireEvent.click(await screen.findByRole("button", { name: "Continue with Google" }));
    await act(async () => {});
    expect(mocks.google).toHaveBeenCalledOnce();
    expect(mocks.upgrade).not.toHaveBeenCalled();
  });
});
