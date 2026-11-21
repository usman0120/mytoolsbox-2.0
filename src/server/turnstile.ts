import "server-only";

/** Cloudflare Turnstile bot check for anonymous AI use. Disabled until TURNSTILE_SECRET_KEY is set. */
export const turnstileEnabled = () => !!process.env.TURNSTILE_SECRET_KEY && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Anonymous users solve the (usually invisible) check from their 4th AI request of the day. */
export const TURNSTILE_AFTER = 3;

export async function verifyTurnstile(token: string | null, ip: string): Promise<boolean> {
  if (!turnstileEnabled()) return true;
  if (!token || token.length > 2048) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token, remoteip: ip }),
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
