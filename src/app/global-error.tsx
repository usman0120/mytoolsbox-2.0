"use client";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="en-US"><body style={{ margin: 0, background: "#f7faf8", color: "#153e2d", fontFamily: "system-ui, sans-serif" }}>
    <title>Something went wrong | MyToolsBox</title>
    <main style={{ maxWidth: 520, margin: "12vh auto", padding: 32, textAlign: "center" }}>
      {/* A native image keeps this fallback independent of the failed layout. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="MyToolsBox" width={55} height={60} />
      <h1>Let’s get you back on track</h1>
      <p style={{ lineHeight: 1.8 }}>The page couldn’t load. Try again, or return home. If the problem continues, contact support.</p>
      <button onClick={retry} style={{ padding: "12px 24px", borderRadius: 12, background: "#153e2d", color: "white", border: 0, cursor: "pointer" }}>Try again</button>
      {/* Full navigation intentionally bypasses a potentially broken router. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" style={{ display: "inline-block", margin: 16, color: "inherit" }}>Return home</a>
      {error.digest && <p style={{ fontSize: 12 }}>Error reference: {error.digest}</p>}
    </main>
  </body></html>;
}
