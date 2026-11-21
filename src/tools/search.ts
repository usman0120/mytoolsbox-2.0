// Local search over tools (blueprint section 5.4): instant, offline, no server round trip.
// The index is built on the server and fetched once from /search-index.json.

export interface SearchDoc {
  id: string;
  name: string;
  url: string;
  space: string;
  tagline: string;
  /** Lowercased name, keywords, synonyms and job phrases. */
  terms: string;
  ai: boolean;
}

const STOP = new Set(["a", "an", "the", "to", "for", "of", "my", "and", "or", "in", "on", "with", "into", "online", "free", "tool", "how", "i", "can", "do", "make"]);
const SYNONYMS: Record<string, string> = {
  shrink: "compress", reduce: "compress", smaller: "compress", minify: "compress", photo: "image", picture: "image", pic: "image",
  jpeg: "jpg", combine: "merge", join: "merge", cut: "trim", sign: "signature", kb: "compress", mb: "compress",
};

export function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9.+#\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w) && !/^\d+$/.test(w))
    .map((w) => SYNONYMS[w] ?? w);
}

/** Ranks tools for a query: exact name first, then term coverage, with a small bonus for prefixes. */
export function searchTools(index: SearchDoc[], query: string, max = 8): SearchDoc[] {
  const words = tokenize(query);
  if (!words.length) return [];
  const q = query.trim().toLowerCase();
  const scored = index.map((doc) => {
    const name = doc.name.toLowerCase();
    let score = name === q ? 100 : name.startsWith(q) ? 40 : 0;
    let matched = 0;
    for (const w of words) {
      if (name.includes(w)) {
        score += 12;
        matched++;
      } else if (doc.terms.includes(w)) {
        score += 6;
        matched++;
      } else if (w.length > 3 && doc.terms.includes(w.slice(0, -1))) {
        score += 3;
        matched++;
      }
    }
    if (matched < Math.ceil(words.length / 2)) score = 0;
    else if (matched === words.length) score += 10;
    return { doc, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, max).map((s) => s.doc);
}

let cache: Promise<SearchDoc[]> | null = null;
/** Loads the index once per page load (cached by the browser and the service worker). */
export function loadSearchIndex(): Promise<SearchDoc[]> {
  cache ??= fetch("/search-index.json")
    .then((r) => (r.ok ? (r.json() as Promise<SearchDoc[]>) : []))
    .catch(() => {
      cache = null;
      return [];
    });
  return cache;
}
