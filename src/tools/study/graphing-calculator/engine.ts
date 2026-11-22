// Function plotting: a small safe expression compiler (no eval) plus sampling and root finding.

type Node = (x: number) => number;

const FUNCS: Record<string, (v: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs,
  exp: Math.exp, ln: Math.log, log: Math.log10, log2: Math.log2, floor: Math.floor, ceil: Math.ceil, round: Math.round, sign: Math.sign,
  sec: (v) => 1 / Math.cos(v), csc: (v) => 1 / Math.sin(v), cot: (v) => 1 / Math.tan(v),
};
const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E, π: Math.PI };
const NAMES = [...Object.keys(FUNCS), ...Object.keys(CONSTS), "x"].sort((a, b) => b.length - a.length);

type Tok = { k: "n"; v: number } | { k: "id"; v: string } | { k: "op"; v: string };

function tokenize(src: string): Tok[] {
  const s = src.replace(/^\s*(y|f\(x\))\s*=/i, "").replace(/\*\*/g, "^").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "");
  if (!s) throw new Error("Empty expression");
  const out: Tok[] = [];
  for (let i = 0; i < s.length; ) {
    const rest = s.slice(i);
    const n = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(rest);
    if (n) {
      out.push({ k: "n", v: Number(n[0]) });
      i += n[0].length;
      continue;
    }
    const name = NAMES.find((nm) => rest.toLowerCase().startsWith(nm));
    if (name) {
      out.push({ k: "id", v: name });
      i += name.length;
      continue;
    }
    if ("+-*/^()|,".includes(s[i])) {
      out.push({ k: "op", v: s[i] });
      i++;
      continue;
    }
    throw new Error(`Unknown symbol "${rest.match(/^[a-z]+/i)?.[0] ?? s[i]}"`);
  }
  // Implicit multiplication: 2x, 3(x+1), (x+1)(x-1), 2sin(x), x pi
  const res: Tok[] = [];
  for (const t of out) {
    const p = res[res.length - 1];
    const pEnds = p && (p.k === "n" || (p.k === "id" && !(p.v in FUNCS)) || (p.k === "op" && p.v === ")"));
    const tStarts = t.k === "n" || t.k === "id" || (t.k === "op" && t.v === "(");
    if (pEnds && tStarts) res.push({ k: "op", v: "*" });
    res.push(t);
  }
  return res;
}

/** Compiles an expression in x ("y = x^2 - 3sin(x)") into a fast function. Throws with a readable message. */
export function compile(src: string): Node {
  const toks = tokenize(src);
  let i = 0;
  const peek = () => toks[i];
  const isOp = (v: string) => peek()?.k === "op" && peek()!.v === v;
  const expect = (v: string) => {
    if (!isOp(v)) throw new Error(`Expected "${v}"`);
    i++;
  };

  function expr(): Node {
    let left = term();
    while (isOp("+") || isOp("-")) {
      const op = (toks[i++] as { v: string }).v, l = left, r = term();
      left = op === "+" ? (x) => l(x) + r(x) : (x) => l(x) - r(x);
    }
    return left;
  }
  function term(): Node {
    let left = unary();
    while (isOp("*") || isOp("/")) {
      const op = (toks[i++] as { v: string }).v, l = left, r = unary();
      left = op === "*" ? (x) => l(x) * r(x) : (x) => l(x) / r(x);
    }
    return left;
  }
  function unary(): Node {
    if (isOp("-")) {
      i++;
      const a = unary();
      return (x) => -a(x);
    }
    if (isOp("+")) {
      i++;
      return unary();
    }
    return power();
  }
  function power(): Node {
    const base = atom();
    if (isOp("^")) {
      i++;
      const ex = unary();
      return (x) => Math.pow(base(x), ex(x));
    }
    return base;
  }
  function atom(): Node {
    const t = toks[i++];
    if (!t) throw new Error("Incomplete expression");
    if (t.k === "n") return () => t.v;
    if (t.k === "id") {
      if (t.v === "x") return (x) => x;
      if (t.v in CONSTS) return () => CONSTS[t.v];
      const f = FUNCS[t.v];
      // Function argument: f(...) or f x (e.g. "sin x")
      if (isOp("(")) {
        i++;
        const a = expr();
        expect(")");
        return (x) => f(a(x));
      }
      const a = power();
      return (x) => f(a(x));
    }
    if (t.v === "(") {
      const a = expr();
      expect(")");
      return a;
    }
    if (t.v === "|") {
      const a = expr();
      expect("|");
      return (x) => Math.abs(a(x));
    }
    throw new Error(`Unexpected "${t.v}"`);
  }

  const f = expr();
  if (i < toks.length) throw new Error(`Unexpected "${(toks[i] as { v: string | number }).v}"`);
  return f;
}

/** Samples f across [a, b]. Returns segments split at gaps or near-vertical jumps (asymptotes). */
export function sample(f: Node, a: number, b: number, n: number, yRange: number): [number, number][][] {
  const segs: [number, number][][] = [];
  let cur: [number, number][] = [];
  let prev: number | null = null;
  for (let k = 0; k <= n; k++) {
    const x = a + ((b - a) * k) / n;
    const y = f(x);
    if (!Number.isFinite(y) || (prev !== null && Math.abs(y - prev) > yRange * 2 && Math.sign(y) !== Math.sign(prev))) {
      if (cur.length > 1) segs.push(cur);
      cur = Number.isFinite(y) ? [[x, y]] : [];
      prev = Number.isFinite(y) ? y : null;
      continue;
    }
    cur.push([x, y]);
    prev = y;
  }
  if (cur.length > 1) segs.push(cur);
  return segs;
}

/** Zeros of f in [a, b]: sign changes refined by bisection, skipping asymptotes. */
export function roots(f: Node, a: number, b: number, n = 2000): number[] {
  const out: number[] = [];
  let x0 = a, y0 = f(a);
  for (let k = 1; k <= n; k++) {
    const x1 = a + ((b - a) * k) / n, y1 = f(x1);
    if (Number.isFinite(y0) && Number.isFinite(y1)) {
      if (y0 === 0) out.push(x0);
      else if (y0 * y1 < 0) {
        let lo = x0, hi = x1, flo = y0;
        for (let it = 0; it < 60; it++) {
          const mid = (lo + hi) / 2, fm = f(mid);
          if (flo * fm <= 0) hi = mid;
          else {
            lo = mid;
            flo = fm;
          }
        }
        const r = (lo + hi) / 2;
        // A real root has a small value nearby; a pole flips sign with a huge value.
        if (Math.abs(f(r)) < 1e-6 * (1 + Math.abs(y0) + Math.abs(y1))) out.push(r);
      }
    }
    x0 = x1;
    y0 = y1;
  }
  return out.filter((r, i) => i === 0 || Math.abs(r - out[i - 1]) > (b - a) / n);
}

export const intersections = (f: Node, g: Node, a: number, b: number) => roots((x) => f(x) - g(x), a, b);

/** "Nice" grid step (1, 2 or 5 × 10^k) for about `target` lines across `span`. */
export function niceStep(span: number, target = 10): number {
  const raw = span / target;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}
