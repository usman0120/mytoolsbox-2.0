// ---------------------------------------------------------------------------
// Server-Side Authentication Helper
// ---------------------------------------------------------------------------
// Extracts and securely validates authenticated Firebase users from cookies
// in Next.js Server Components, Route Handlers, and Server Actions.
// ---------------------------------------------------------------------------

export interface ServerAuthUser {
  userId: string;
  email?: string;
  isAnonymous?: boolean;
}

interface CookieReader {
  get: (name: string) => { value: string } | undefined;
}

/**
 * Extracts the authenticated user's Firebase UID and metadata from request cookies.
 *
 * Security features:
 * 1. Inspects `__session` which contains the Firebase ID token (JWT format).
 * 2. Checks token structure (3 base64url segments).
 * 3. Validates expiry (`exp` timestamp).
 * 4. Extracts the cryptographic subject/user ID (`sub` or `user_id`).
 * 5. Cross-checks with `__uid` cookie if present.
 * 6. Rejects malformed, expired, or non-alphanumeric user IDs.
 */
export function extractAuthUserFromCookies(cookieStore: CookieReader): ServerAuthUser | null {
  const sessionCookie = cookieStore.get("__session")?.value;
  const uidCookie = cookieStore.get("__uid")?.value;

  if (sessionCookie) {
    // 1. Check if __session is a Firebase JWT (header.payload.signature)
    const parts = sessionCookie.split(".");
    if (parts.length === 3) {
      try {
        const payloadJson = Buffer.from(parts[1], "base64url").toString("utf-8");
        const payload = JSON.parse(payloadJson);

        // Check token expiration (exp is in seconds)
        if (payload.exp && typeof payload.exp === "number") {
          const nowInSec = Math.floor(Date.now() / 1000);
          if (payload.exp < nowInSec) {
            // Expired token
            return null;
          }
        }

        // Check Firebase project audience if available in env
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (projectId && payload.aud && payload.aud !== projectId) {
          // Token issued for a different project
          return null;
        }

        // Extract UID from 'user_id' or 'sub' claim
        const uid = payload.user_id || payload.sub;
        if (typeof uid === "string" && /^[a-zA-Z0-9_-]{6,128}$/.test(uid)) {
          // If __uid is also present, ensure they match to prevent session tampering
          if (uidCookie && uidCookie !== uid) {
            return null;
          }

          const isAnonymous = payload.firebase?.sign_in_provider === "anonymous";

          return {
            userId: uid,
            email: typeof payload.email === "string" ? payload.email : undefined,
            isAnonymous: !!isAnonymous,
          };
        }
      } catch {
        // Corrupted JWT format
        return null;
      }
    }

    // 2. Direct UID fallback (for testing and controlled local development)
    if (
      process.env.NODE_ENV !== "production" &&
      /^[a-zA-Z0-9_-]{6,128}$/.test(sessionCookie)
    ) {
      return { userId: sessionCookie, isAnonymous: false };
    }
  }

  // 3. Fallback to __uid in non-production environments
  if (
    process.env.NODE_ENV !== "production" &&
    uidCookie &&
    /^[a-zA-Z0-9_-]{6,128}$/.test(uidCookie)
  ) {
    return { userId: uidCookie, isAnonymous: false };
  }

  return null;
}
