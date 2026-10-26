const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/user-not-found": "Incorrect email or password. Please try again.",
  "auth/wrong-password": "Incorrect email or password. Please try again.",
  "auth/email-already-in-use": "This email is already registered. Sign in instead, or reset your password.",
  "auth/credential-already-in-use": "This account already exists. Choose Sign in to switch to it. Guest favorites and history are not transferred.",
  "auth/weak-password": "Choose a stronger password with at least 6 characters.",
  "auth/password-does-not-meet-requirements": "This password does not meet the account security requirements. Use a longer password with letters, numbers, and symbols.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes before trying again.",
  "auth/network-request-failed": "Connection failed. Check your internet connection and try again.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled. You can try again or use email.",
  "auth/cancelled-popup-request": "Another sign-in is already in progress. Please wait.",
  "auth/popup-blocked": "Your browser blocked the sign-in window. Allow popups for this site or use email.",
  "auth/account-exists-with-different-credential": "This email uses another sign-in method. Try the method you originally used.",
  "auth/user-disabled": "This account has been disabled. Contact support if you need help.",
  "auth/operation-not-allowed": "This sign-in method is currently unavailable. Try another method or contact support.",
  "auth/unauthorized-domain": "Sign-in is not configured for this domain. Please contact support.",
  "auth/requires-recent-login": "Please sign in again before making this change.",
};

export function getAuthErrorMessage(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : undefined;
  const message = error instanceof Error ? error.message : "";
  const match = code ?? message.match(/auth\/[\w-]+/)?.[0];
  if (match && AUTH_ERRORS[match]) return AUTH_ERRORS[match];
  if (message === "Auth not available") return "Sign-in is temporarily unavailable. Please try again later.";
  return "We couldn’t complete that request. Please try again.";
}
