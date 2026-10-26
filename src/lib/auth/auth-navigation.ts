export function safeReturnPath(next: string | null, origin: string): string | null {
  if (!next?.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  try {
    const target = new URL(next, origin);
    return target.origin === origin ? target.pathname + target.search + target.hash : null;
  } catch {
    return null;
  }
}
