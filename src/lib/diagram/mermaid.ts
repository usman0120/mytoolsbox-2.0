"use client";
// Mermaid rendering with strict security and DOMPurify (blueprint section 15). Loaded on demand.

let seq = 0;
let lastTheme: string | null = null;

async function mermaid(dark: boolean) {
  const m = (await import("mermaid")).default;
  const theme = dark ? "dark" : "default";
  if (theme !== lastTheme) {
    m.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme,
      // Plain SVG text labels: foreignObject HTML would taint the canvas and break PNG export.
      htmlLabels: false,
      flowchart: { htmlLabels: false },
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
    });
    lastTheme = theme;
  }
  return m;
}

export type MermaidResult = { svg: string; error?: undefined } | { svg?: undefined; error: string };

export async function renderMermaid(code: string, dark: boolean): Promise<MermaidResult> {
  if (!code.trim()) return { error: "Write or generate a diagram to see it here." };
  const m = await mermaid(dark);
  try {
    await m.parse(code);
  } catch (e) {
    return { error: cleanError(e) };
  }
  try {
    const { svg } = await m.render(`mmd-${++seq}`, code);
    const DOMPurify = (await import("dompurify")).default;
    return { svg: DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true, html: true }, ADD_TAGS: ["foreignObject"] }) };
  } catch (e) {
    return { error: cleanError(e) };
  }
}

/** Returns a parse error message, or null if the code is valid. */
export async function checkMermaid(code: string): Promise<string | null> {
  const m = await mermaid(lastTheme === "dark");
  try {
    await m.parse(code);
    return null;
  } catch (e) {
    return cleanError(e);
  }
}

function cleanError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.split("\n").filter(Boolean).slice(0, 3).join("\n").slice(0, 400) || "This diagram has a syntax error.";
}

/** Rasterises an SVG string to PNG at `scale`, on a solid background. */
export async function svgToPng(svg: string, scale = 2, background = "#ffffff"): Promise<Blob> {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const el = doc.documentElement;
  const vb = (el.getAttribute("viewBox") ?? "0 0 800 600").split(/[\s,]+/).map(Number);
  const w = Math.max(1, Math.ceil(vb[2])), h = Math.max(1, Math.ceil(vb[3]));
  el.setAttribute("width", String(w));
  el.setAttribute("height", String(h));
  el.removeAttribute("style");
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(el))}`;
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Couldn't draw the diagram."));
    img.src = src;
  });
  const c = document.createElement("canvas");
  c.width = w * scale;
  c.height = h * scale;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export isn't available for this diagram. Use SVG."))), "image/png"));
}
