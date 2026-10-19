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

export class AuthVerificationUnavailableError extends Error {
  constructor() {
    super("Authentication verification unavailable");
    this.name = "AuthVerificationUnavailableError";
  }
}

/**
 * Validates a Firebase ID token (JWT) and extracts the user info.
 */
export async function extractAuthUserFromToken(token: string): Promise<ServerAuthUser | null> {
  if (!token) return null;
  const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
  const parts = cleanToken.split(".");
  if (parts.length !== 3 || parts.some((part) => !part)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
    if (!payload || typeof payload.sub !== "string") return null;
  } catch {
    return null;
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new AuthVerificationUnavailableError();

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: cleanToken }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      if (response.status >= 500 || response.status === 429) {
        throw new AuthVerificationUnavailableError();
      }
      return null;
    }

    const data = await response.json();
    const account = Array.isArray(data?.users) && data.users.length === 1 ? data.users[0] : undefined;
    if (!account || typeof account.localId !== "string" || !account.localId || account.disabled) return null;

    if (payload.sub !== account.localId) return null;
    return {
      userId: account.localId,
      email: typeof account.email === "string" ? account.email : undefined,
      isAnonymous: payload.firebase?.sign_in_provider === "anonymous",
    };
  } catch {
    throw new AuthVerificationUnavailableError();
  }
}

/**
 * Extracts the authenticated user's Firebase UID and metadata from request cookies.
 */
export async function extractAuthUserFromCookies(cookieStore: CookieReader): Promise<ServerAuthUser | null> {
  const sessionCookie = cookieStore.get("__session")?.value;
  const uidCookie = cookieStore.get("__uid")?.value;

  if (sessionCookie) {
    const fromToken = await extractAuthUserFromToken(sessionCookie);
    if (fromToken) {
      if (uidCookie && uidCookie !== fromToken.userId) {
        return null;
      }
      return fromToken;
    }
  }

  return null;
}

/**
 * Universal extractor: checks Authorization header first, then cookies.
 */
export async function extractAuthUser(
  request?: { headers: { get: (name: string) => string | null } },
  cookieStore?: CookieReader
): Promise<ServerAuthUser | null> {
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== null) {
      const token = /^Bearer\s+(.+)$/i.exec(authHeader)?.[1]?.trim();
      if (!token) return null;
      const user = await extractAuthUserFromToken(token);
      const claimedUid = cookieStore?.get("__uid")?.value;
      if (user && claimedUid && claimedUid !== user.userId) return null;
      return user;
    }
  }

  if (cookieStore) {
    return extractAuthUserFromCookies(cookieStore);
  }

  return null;
}
