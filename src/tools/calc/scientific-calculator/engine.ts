// Scientific Calculator mathematical engine with robust tokenizer and evaluator

export type TrigUnit = "deg" | "rad";

export interface CalcState {
  memory: number;
  lastAnswer: number;
}

export function evaluateExpression(expression: string, trigUnit: TrigUnit = "deg", lastAnswer: number = 0): string {
  try {
    const sanitized = expression.trim();
    if (!sanitized) return "0";

    const parser = new MathParser(sanitized, trigUnit, lastAnswer);
    const result = parser.parse();

    if (!isFinite(result)) {
      return "Error: Infinite or undefined result";
    }
    if (isNaN(result)) {
      return "Error: Invalid calculation";
    }

    return formatResult(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error: Invalid expression";
    return msg.startsWith("Error:") ? msg : `Error: ${msg}`;
  }
}

export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error("Factorial requires non-negative integer");
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function formatResult(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  // If extremely small or large, scientific notation
  if (Math.abs(n) > 1e12 || (Math.abs(n) < 1e-7 && n !== 0)) {
    return n.toExponential(8).replace(/\.?0+e/, "e");
  }
  return parseFloat(n.toPrecision(10)).toString();
}

/**
 * Tokenizer & Recursive Descent Math Parser
 * Handles:
 * - Constants: pi, π, e, phi, φ, ans, Ans
 * - Ops: +, -, *, /, %, ^, !
 * - Functions: sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, sqrt, cbrt, log (log10), ln, abs, exp
 * - Unary minus/plus, nested parentheses
 */
class MathParser {
  private tokens: string[] = [];
  private pos = 0;
  private trigUnit: TrigUnit;
  private lastAnswer: number;

  constructor(input: string, trigUnit: TrigUnit, lastAnswer: number) {
    this.trigUnit = trigUnit;
    this.lastAnswer = lastAnswer;
    this.tokens = this.tokenize(input);
  }

  private tokenize(raw: string): string[] {
    let s = raw
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "pi")
      .replace(/φ/g, "phi")
      .replace(/ANS/gi, "ans");

    const tokens: string[] = [];
    let i = 0;

    const isDigitOrDot = (ch: string) => (ch >= "0" && ch <= "9") || ch === ".";
    const isAlpha = (ch: string) => (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");

    while (i < s.length) {
      const ch = s[i];

      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      if (isDigitOrDot(ch)) {
        let numStr = "";
        while (i < s.length && (isDigitOrDot(s[i]) || s[i].toLowerCase() === "e")) {
          // Handle scientific notation inside number e.g. 1e-5
          if (s[i].toLowerCase() === "e" && i + 1 < s.length && (s[i + 1] === "+" || s[i + 1] === "-")) {
            numStr += s[i] + s[i + 1];
            i += 2;
            continue;
          }
          numStr += s[i];
          i++;
        }
        tokens.push(numStr);
        continue;
      }

      if (isAlpha(ch)) {
        let ident = "";
        while (i < s.length && (isAlpha(s[i]) || (s[i] >= "0" && s[i] <= "9"))) {
          ident += s[i];
          i++;
        }
        tokens.push(ident.toLowerCase());
        continue;
      }

      // Operators and punctuation
      if ("+-*/%^!()".includes(ch)) {
        tokens.push(ch);
        i++;
        continue;
      }

      throw new Error(`Unexpected character: ${ch}`);
    }

    return tokens;
  }

  public parse(): number {
    this.pos = 0;
    if (this.tokens.length === 0) return 0;
    const res = this.expr();
    if (this.pos < this.tokens.length) {
      throw new Error(`Unexpected token: ${this.tokens[this.pos]}`);
    }
    return res;
  }

  private peek(): string | undefined {
    return this.tokens[this.pos];
  }

  private consume(expected?: string): string {
    const token = this.tokens[this.pos];
    if (expected && token !== expected) {
      throw new Error(`Expected '${expected}' but found '${token ?? "EOF"}'`);
    }
    this.pos++;
    return token;
  }

  // expr = term (( "+" | "-" ) term)*
  private expr(): number {
    let value = this.term();
    while (this.peek() === "+" || this.peek() === "-") {
      const op = this.consume();
      const right = this.term();
      if (op === "+") value += right;
      else value -= right;
    }
    return value;
  }

  // term = power (( "*" | "/" | "%" ) power)*
  private term(): number {
    let value = this.power();
    while (this.peek() === "*" || this.peek() === "/" || this.peek() === "%") {
      const op = this.consume();
      const right = this.power();
      if (op === "*") value *= right;
      else if (op === "/") {
        if (Math.abs(right) < 1e-15) throw new Error("Division by zero");
        value /= right;
      } else {
        if (Math.abs(right) < 1e-15) throw new Error("Division by zero");
        value %= right;
      }
    }
    return value;
  }

  // power = unary ( "^" unary )* (right-associative)
  private power(): number {
    let base = this.unary();
    if (this.peek() === "^") {
      this.consume();
      const exp = this.power();
      return Math.pow(base, exp);
    }
    return base;
  }

  // unary = ( "+" | "-" ) unary | postfix
  private unary(): number {
    if (this.peek() === "+") {
      this.consume();
      return this.unary();
    }
    if (this.peek() === "-") {
      this.consume();
      return -this.unary();
    }
    return this.postfix();
  }

  // postfix = primary ( "!" )*
  private postfix(): number {
    let val = this.primary();
    while (this.peek() === "!") {
      this.consume();
      val = factorial(Math.round(val));
    }
    return val;
  }

  // primary = NUMBER | CONSTANT | FUNCTION "(" expr ")" | "(" expr ")"
  private primary(): number {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of expression");

    // Parentheses
    if (token === "(") {
      this.consume("(");
      const val = this.expr();
      this.consume(")");
      return val;
    }

    // Number literal
    if (!isNaN(Number(token))) {
      this.consume();
      return Number(token);
    }

    // Constants
    if (token === "pi") {
      this.consume();
      return Math.PI;
    }
    if (token === "e") {
      this.consume();
      return Math.E;
    }
    if (token === "phi") {
      this.consume();
      return (1 + Math.sqrt(5)) / 2;
    }
    if (token === "ans") {
      this.consume();
      return this.lastAnswer;
    }

    // Functions
    const knownFuncs = [
      "sin", "cos", "tan", "asin", "acos", "atan",
      "sinh", "cosh", "tanh",
      "sqrt", "cbrt", "log", "log10", "ln", "abs", "exp"
    ];

    if (knownFuncs.includes(token)) {
      const funcName = this.consume();
      this.consume("(");
      const arg = this.expr();
      this.consume(")");

      return this.applyFunction(funcName, arg);
    }

    throw new Error(`Unknown token: ${token}`);
  }

  private applyFunction(name: string, val: number): number {
    const toRad = this.trigUnit === "deg" ? (v: number) => (v * Math.PI) / 180 : (v: number) => v;
    const toAngle = this.trigUnit === "deg" ? (v: number) => (v * 180) / Math.PI : (v: number) => v;

    switch (name) {
      case "sin": return Math.sin(toRad(val));
      case "cos": return Math.cos(toRad(val));
      case "tan": {
        const rad = toRad(val);
        // Avoid tan(90 deg) blowup
        if (Math.abs(Math.cos(rad)) < 1e-15) throw new Error("Tangent undefined at 90°");
        return Math.tan(rad);
      }
      case "asin": {
        if (val < -1 || val > 1) throw new Error("asin domain is [-1, 1]");
        return toAngle(Math.asin(val));
      }
      case "acos": {
        if (val < -1 || val > 1) throw new Error("acos domain is [-1, 1]");
        return toAngle(Math.acos(val));
      }
      case "atan": return toAngle(Math.atan(val));
      case "sinh": return Math.sinh(val);
      case "cosh": return Math.cosh(val);
      case "tanh": return Math.tanh(val);
      case "sqrt": {
        if (val < 0) throw new Error("Square root of negative number");
        return Math.sqrt(val);
      }
      case "cbrt": return Math.cbrt(val);
      case "log":
      case "log10": {
        if (val <= 0) throw new Error("Logarithm domain must be > 0");
        return Math.log10(val);
      }
      case "ln": {
        if (val <= 0) throw new Error("Natural logarithm domain must be > 0");
        return Math.log(val);
      }
      case "abs": return Math.abs(val);
      case "exp": return Math.exp(val);
      default:
        throw new Error(`Unsupported function: ${name}`);
    }
  }
}