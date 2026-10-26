// This is deliberately a single identity, not a configurable role/allowlist.
export const ADMIN_EMAIL = "akbarali69048@gmail.com";

export function isAdminIdentity(account: {
  email?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
} | null | undefined): boolean {
  return !!account && !account.isAnonymous && account.emailVerified === true
    && account.email?.toLowerCase() === ADMIN_EMAIL;
}
