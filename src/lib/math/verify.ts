// Safe arithmetic evaluator used to check AI maths answers locally (blueprint section 13: CAS check).
// Supports + - * / ^, parentheses, unary minus, implicit multiplication (2x, 3(x+1)), one variable,
// constants pi and e, and sqrt, abs, sin, cos, tan, log (base 10), ln, exp. No eval().

type Token = { t: "num"; v: number } | { t: "id"; v: string } | { t: "op"; v: string };

const FUNCS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan,
  log: Math.log10, ln: Math.log, exp: Math.exp,
};

function tokenize(src: string): Token[] {
  const s = src.replace(/\s+/g, "").replace(/\*\*/g, "^").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
  const out: Token[] = [];
  for (let i = 0; i < s.length; ) {
    const c = s[i];
    const num = /^\d*\.?\d+(?:e[+-]?\d+)?/i.exec(s.slice(i));
    if (num && /[\d.]/.test(c)) {
      out.push({ t: "num", v: Number(num[0]) });
      i += num[0].length;
    } else if (/[a-z]/i.test(c)) {
      const id = /^[a-z]+/i.exec(s.slice(i))![0].toLowerCase();
      // split runs like "xy" or "2pix" into known names / single letters
      let rest = id;
      while (rest) {
        const name = Object.keys(FUNCS).concat(["pi"]).find((n) => rest.startsWith(n)) ?? rest[0];
        out.push({ t: "id", v: name });
        rest = rest.slice(name.length);
      }
      i += id.length;
    } else if ("+-*/^()".includes(c)) {
      out.push({ t: "op", v: c });
      i++;
    } else {
      throw new Error(`Unsupported character "${c}"`);
    }
  }
  // implicit multiplication: 2x, 2(, )(, x(, )x, x y
  const withMul: Token[] = [];
  out.forEach((tok, k) => {
    const prev = withMul[withMul.length - 1];
    const prevEnds = prev && (prev.t === "num" || (prev.t === "id" && !(prev.v in FUNCS)) || (prev.t === "op" && prev.v === ")"));
    const startsValue = tok.t === "num" || tok.t === "id" || (tok.t === "op" && tok.v === "(");
    if (k > 0 && prevEnds && startsValue) withMul.push({ t: "op", v: "*" });
    withMul.push(tok);
  });
  return withMul;
}

/** Evaluates an expression with the given variable values. Throws on invalid input. */
export function evaluate(expr: string, vars: Record<string, number> = {}): number {
  const tokens = tokenize(expr);
  let pos = 0;
  const peek = () => tokens[pos];
  const take = () => tokens[pos++];

  // expr := term (('+'|'-') term)* ; term := unary (('*'|'/') unary)* ; unary := '-' unary | power ; power := atom ('^' unary)?
  function parseExpr(): number {
    let v = parseTerm();
    while (peek()?.t === "op" && (peek()!.v === "+" || peek()!.v === "-")) v = take().v === "+" ? v + parseTerm() : v - parseTerm();
    return v;
  }
  function parseTerm(): number {
    let v = parseUnary();
    while (peek()?.t === "op" && (peek()!.v === "*" || peek()!.v === "/")) v = take().v === "*" ? v * parseUnary() : v / parseUnary();
    return v;
  }
  function parseUnary(): number {
    if (peek()?.t === "op" && peek()!.v === "-") {
      take();
      return -parseUnary();
    }
    if (peek()?.t === "op" && peek()!.v === "+") {
      take();
      return parseUnary();
    }
    return parsePower();
  }
  function parsePower(): number {
    const base = parseAtom();
    if (peek()?.t === "op" && peek()!.v === "^") {
      take();
      return base ** parseUnary();
    }
    return base;
  }
  function parseAtom(): number {
    const tok = take();
    if (!tok) throw new Error("Unexpected end of expression");
    if (tok.t === "num") return tok.v;
    if (tok.t === "op" && tok.v === "(") {
      const v = parseExpr();
      if (take()?.v !== ")") throw new Error("Missing )");
      return v;
    }
    if (tok.t === "id") {
      if (tok.v in FUNCS) {
        const arg = peek()?.v === "(" ? parseAtom() : parseUnary();
        return FUNCS[tok.v](arg);
      }
      if (tok.v === "pi") return Math.PI;
      if (tok.v === "e" && !(tok.v in vars)) return Math.E;
      if (tok.v in vars) return vars[tok.v];
      throw new Error(`Unknown name "${tok.v}"`);
    }
    throw new Error(`Unexpected "${tok.v}"`);
  }

  const value = parseExpr();
  if (pos !== tokens.length) throw new Error("Unexpected input after expression");
  return value;
}

export type VerifyResult = "match" | "mismatch" | "unchecked";

/** Substitutes each claimed solution into `lhs = rhs` and checks both sides agree. */
export function verifySolutions(equation: string, variable: string, values: number[]): VerifyResult {
  const parts = equation.split("=");
  if (parts.length !== 2 || !values.length) return "unchecked";
  try {
    for (const value of values) {
      const lhs = evaluate(parts[0], { [variable.toLowerCase()]: value });
      const rhs = evaluate(parts[1], { [variable.toLowerCase()]: value });
      if (!Number.isFinite(lhs) || !Number.isFinite(rhs)) return "unchecked";
      if (Math.abs(lhs - rhs) > 1e-6 * Math.max(1, Math.abs(lhs), Math.abs(rhs))) return "mismatch";
    }
    return "match";
  } catch {
    return "unchecked";
  }
}
