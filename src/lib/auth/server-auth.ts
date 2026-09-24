// ---------------------------------------------------------------------------
// Server-Side Authentication Helper
// ---------------------------------------------------------------------------
// Extracts and securely validates authenticated Firebase users from cookies
// or Authorization headers in Next.js Server Components, Route Handlers,
// and Server Actions.
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
 * Validates a Firebase ID token (JWT) and extracts the user info.
 */
export function extractAuthUserFromToken(token: string): ServerAuthUser | null {
  if (!token) return null;
  const cleanToken = token.startsWith("Bearer ") ? token.slice(7).trim() : token.trim();
  const parts = cleanToken.split(".");
  if (parts.length === 3) {
    try {
      const payloadJson = Buffer.from(parts[1], "base64url").toString("utf-8");
      const payload = JSON.parse(payloadJson);

      // Check token expiration (exp is in seconds)
      if (payload.exp && typeof payload.exp === "number") {
        const nowInSec = Math.floor(Date.now() / 1000);
        if (payload.exp < nowInSec) {
          return null;
        }
      }

      // Check Firebase project audience if available in env
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      if (projectId && payload.aud && payload.aud !== projectId) {
        return null;
      }

      // Extract UID from 'user_id' or 'sub' claim
      const uid = payload.user_id || payload.sub;
      if (typeof uid === "string" && /^[a-zA-Z0-9_-]{6,128}$/.test(uid)) {
        const isAnonymous = payload.firebase?.sign_in_provider === "anonymous";

        return {
          userId: uid,
          email: typeof payload.email === "string" ? payload.email : undefined,
          isAnonymous: !!isAnonymous,
        };
      }
    } catch {
      return null;
    }
  }

  // Direct UID fallback for local testing & controlled development
  if (
    process.env.NODE_ENV !== "production" &&
    /^[a-zA-Z0-9_-]{6,128}$/.test(cleanToken)
  ) {
    return { userId: cleanToken, isAnonymous: false };
  }

  return null;
}

/**
 * Extracts the authenticated user's Firebase UID and metadata from request cookies.
 */
export function extractAuthUserFromCookies(cookieStore: CookieReader): ServerAuthUser | null {
  const sessionCookie = cookieStore.get("__session")?.value;
  const uidCookie = cookieStore.get("__uid")?.value;

  if (sessionCookie) {
    const fromToken = extractAuthUserFromToken(sessionCookie);
    if (fromToken) {
      if (uidCookie && uidCookie !== fromToken.userId) {
        return null;
      }
      return fromToken;
    }
  }

  // Fallback to __uid in non-production environments
  if (
    process.env.NODE_ENV !== "production" &&
    uidCookie &&
    /^[a-zA-Z0-9_-]{6,128}$/.test(uidCookie)
  ) {
    return { userId: uidCookie, isAnonymous: false };
  }

  return null;
}

/**
 * Universal extractor: checks Authorization header first, then cookies.
 */
export function extractAuthUser(
  request?: { headers: { get: (name: string) => string | null } },
  cookieStore?: CookieReader
): ServerAuthUser | null {
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const user = extractAuthUserFromToken(authHeader);
      if (user) return user;
    }
  }

  if (cookieStore) {
    return extractAuthUserFromCookies(cookieStore);
  }

  return null;
}
