// Transcript → subtitle files. Pure functions.

export interface Segment {
  start: number;
  end: number;
  text: string;
}

function stamp(s: number, sep: "," | ".") {
  const ms = Math.max(0, Math.round(s * 1000));
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const sec = Math.floor((ms % 60_000) / 1000);
  const rest = ms % 1000;
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(h)}:${p(m)}:${p(sec)}${sep}${p(rest, 3)}`;
}

const clean = (segs: Segment[]) => segs.map((s) => ({ ...s, text: s.text.trim() })).filter((s) => s.text);

export function toSrt(segs: Segment[]): string {
  return clean(segs)
    .map((s, i) => `${i + 1}\n${stamp(s.start, ",")} --> ${stamp(Math.max(s.end, s.start + 0.5), ",")}\n${s.text}\n`)
    .join("\n");
}

export function toVtt(segs: Segment[]): string {
  return `WEBVTT\n\n${clean(segs)
    .map((s) => `${stamp(s.start, ".")} --> ${stamp(Math.max(s.end, s.start + 0.5), ".")}\n${s.text}\n`)
    .join("\n")}`;
}

/** Plain text with paragraph breaks at longer pauses. */
export function toParagraphs(segs: Segment[], pause = 1.5): string {
  let out = "";
  let last = -Infinity;
  for (const s of clean(segs)) {
    out += out ? (s.start - last > pause ? "\n\n" : " ") : "";
    out += s.text;
    last = s.end;
  }
  return out;
}

/** Whisper chunks may lack an end time for the last segment. */
export function fromChunks(chunks: { timestamp: [number, number | null]; text: string }[], duration: number): Segment[] {
  return chunks.map((c, i) => ({ start: c.timestamp[0] ?? 0, end: c.timestamp[1] ?? chunks[i + 1]?.timestamp[0] ?? duration, text: c.text }));
}
