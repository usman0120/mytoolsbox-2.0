// Spaced repetition (SM-2 variant, as used by most flashcard apps). Pure functions: no DOM.

export type Grade = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

export interface CardState {
  /** Ease factor (≥ 1.3). */
  ease: number;
  /** Current interval in days (0 = learning). */
  interval: number;
  reps: number;
  lapses: number;
  /** Next review time (ms epoch); 0 = new card. */
  due: number;
}

export interface Card extends CardState {
  id: string;
  front: string;
  back: string;
}

export const DAY = 86_400_000;
export const NEW_STATE: CardState = { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: 0 };

/** Schedules the next review. Learning steps are 1 min (Again) and 10 min (Hard) before a card graduates. */
export function review(card: CardState, grade: Grade, now: number): CardState {
  const s = { ...card };
  if (grade === 1) {
    s.lapses += s.reps > 0 ? 1 : 0;
    s.reps = 0;
    s.interval = 0;
    s.ease = Math.max(1.3, s.ease - 0.2);
    s.due = now + 60_000;
    return s;
  }
  if (s.reps === 0 && grade === 2) {
    s.due = now + 10 * 60_000;
    s.ease = Math.max(1.3, s.ease - 0.15);
    return s;
  }
  s.reps += 1;
  if (s.reps === 1) s.interval = grade === 4 ? 4 : 1;
  else if (s.reps === 2 && s.interval < 6) s.interval = grade === 4 ? 8 : grade === 2 ? 3 : 6;
  else {
    const mult = grade === 2 ? 1.2 : grade === 4 ? s.ease * 1.3 : s.ease;
    s.interval = Math.max(s.interval + 1, Math.round(s.interval * mult));
  }
  s.ease = Math.max(1.3, s.ease + (grade === 2 ? -0.15 : grade === 4 ? 0.15 : 0));
  s.due = now + s.interval * DAY;
  return s;
}

/** Cards to study now: due reviews first (oldest first), then up to `newLimit` new cards in deck order. */
export function queue(cards: Card[], now: number, newLimit = 20): Card[] {
  const due = cards.filter((c) => c.due > 0 && c.due <= now).sort((a, b) => a.due - b.due);
  const fresh = cards.filter((c) => c.due === 0).slice(0, newLimit);
  return [...due, ...fresh];
}

/** Human label for when a grade would next show the card ("1 min", "10 min", "4 d", "2 mo"). */
export function nextLabel(card: CardState, grade: Grade, now: number): string {
  const ms = review(card, grade, now).due - now;
  if (ms < 3_600_000) return `${Math.max(1, Math.round(ms / 60_000))} min`;
  if (ms < DAY) return `${Math.round(ms / 3_600_000)} h`;
  const d = Math.round(ms / DAY);
  return d < 31 ? `${d} d` : d < 365 ? `${Math.round(d / 30)} mo` : `${(d / 365).toFixed(1)} y`;
}

/**
 * Parses pasted lists into cards. Each line is "front<sep>back" with tab, " - ", " – ", ":" or ";" as the separator,
 * or a CSV with two columns (quoted fields allowed).
 */
export function parseCards(text: string): { front: string; back: string }[] {
  const out: { front: string; back: string }[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    let parts: string[] | null = null;
    if (line.includes("\t")) parts = line.split("\t");
    else if (/^".*",|^[^,"]+,/.test(line) && !/ [-–] /.test(line)) parts = csvRow(line);
    else {
      const m = /^(.+?)\s+[-–—]\s+(.+)$/.exec(line) ?? /^(.+?)\s*[:;]\s+(.+)$/.exec(line);
      if (m) parts = [m[1], m[2]];
    }
    if (parts && parts.length >= 2 && parts[0].trim() && parts.slice(1).join(", ").trim()) out.push({ front: parts[0].trim(), back: parts.slice(1).join(", ").trim() });
  }
  return out;
}

function csvRow(line: string): string[] {
  const cells: string[] = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      cells.push(cur);
      cur = "";
    } else cur += c;
  }
  cells.push(cur);
  return cells;
}

export function toCsv(cards: { front: string; back: string }[]): string {
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  return cards.map((c) => `${esc(c.front)},${esc(c.back)}`).join("\n");
}
