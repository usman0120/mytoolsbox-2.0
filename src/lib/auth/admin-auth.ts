interface CookieReader {
  get: (name: string) => { value: string } | undefined;
}

export async function checkAdminAccess(
  request: { headers: { get: (name: string) => string | null } },
  cookies: CookieReader,
): Promise<401 | 403 | 503 | null> {
  const authorization = request.headers.get("authorization");
  const token = authorization
    ? (/^Bearer\s+(.+)$/i.exec(authorization)?.[1]?.trim() ?? "")
    : cookies.get("__session")?.value;
  if (!token) return 401;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return 503;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) return response.status >= 500 ? 503 : 401;

    const data = await response.json();
    const account = data.users?.length === 1 ? data.users[0] : undefined;
    if (!account || typeof account.localId !== "string" || !account.localId || account.disabled) return 401;

    const claimedUid = cookies.get("__uid")?.value;
    if (claimedUid && claimedUid !== account.localId) return 401;

    let adminClaim = false;
    if (typeof account.customAttributes === "string") {
      try {
        adminClaim = JSON.parse(account.customAttributes)?.admin === true;
      } catch {
        return 403;
      }
    }
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    const allowedEmail = account.emailVerified === true
      && typeof account.email === "string"
      && adminEmails.includes(account.email.toLowerCase());
    return adminClaim || allowedEmail ? null : 403;
  } catch {
    return 503;
  }
}