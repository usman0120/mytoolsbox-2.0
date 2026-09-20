// Equation Solver utility functions

export interface EquationSolution {
  roots: string[];
  steps: string[];
  type: "linear" | "quadratic" | "cubic" | "system2" | "unknown";
}

export function solveEquation(equation: string): EquationSolution {
  const cleaned = equation.replace(/\s+/g, "").toLowerCase();

  // Try to detect equation type
  if (cleaned.includes("=")) {
    // Check for system of 2 equations (comma or semicolon separated)
    const parts = cleaned.split(/[;]/);
    if (parts.length === 2) {
      return solveSystem2(parts[0], parts[1]);
    }
  }

  // Single equation
  return solveSingle(cleaned);
}

function solveSingle(equation: string): EquationSolution {
  // Parse: move everything to left side
  const [left, rightPart] = equation.split("=");
  const right = rightPart || "0";

  // Detect degree by looking for x^3, x^2 patterns
  const hasX3 = /x\^3/.test(left) || /x\^3/.test(right);
  const hasX2 = /x\^2/.test(left) || /x\^2/.test(right);
  const hasX = /(?<!\^)x(?!\^)/.test(left) || /(?<!\^)x(?!\^)/.test(right);

  if (hasX3) {
    return solveCubic(left, right);
  } else if (hasX2) {
    return solveQuadratic(left, right);
  } else if (hasX) {
    return solveLinear(left, right);
  }

  return { roots: [], steps: ["Could not detect equation type. Use format: ax + b = c or ax^2 + bx + c = 0"], type: "unknown" };
}

function parseCoefficients(left: string, right: string): { a: number; b: number; c: number } {
  // Move all terms to left: left - right = 0
  // Simple parser for ax^2 + bx + c form
  const expr = `(${left})-(${right})`;
  // Replace x^2, x with evaluated forms
  // We'll evaluate at x=0, x=1, x=-1 to find coefficients

  const evalAt = (x: number): number => {
    const e = expr
      .replace(/x\^3/g, `(${x}*${x}*${x})`)
      .replace(/x\^2/g, `(${x}*${x})`)
      .replace(/(?<!\^)x(?!\^)/g, `(${x})`);
    try {
      return new Function(`return (${e})`)();
    } catch {
      return NaN;
    }
  };

  const f0 = evalAt(0);  // c
  const f1 = evalAt(1);  // a + b + c
  const f_1 = evalAt(-1); // a - b + c

  const c = f0;
  const a = (f1 + f_1 - 2 * c) / 2;
  const b = f1 - a - c;

  return { a, b, c };
}

function solveLinear(left: string, right: string): EquationSolution {
  const { a, b, c } = parseCoefficients(left, right);
  // ax + b + c = 0 => ax + (b+c) = 0
  const coeffX = a;
  const constant = b + c;

  if (Math.abs(coeffX) < 1e-10) {
    return { roots: [], steps: ["No x term found. Not a valid linear equation."], type: "linear" };
  }

  const root = -constant / coeffX;
  return {
    roots: [formatNumber(root)],
    steps: [
      `Rearrange to standard form: ${formatCoeff(coeffX)}x + ${formatNumber(constant)} = 0`,
      `Subtract ${formatNumber(constant)} from both sides: ${formatCoeff(coeffX)}x = ${formatNumber(-constant)}`,
      `Divide by ${formatNumber(coeffX)}: x = ${formatNumber(root)}`,
    ],
    type: "linear",
  };
}

function solveQuadratic(left: string, right: string): EquationSolution {
  // Re-evaluate properly
  const expr = `(${left})-(${right})`;
  const evalAt = (x: number): number => {
    const e = expr
      .replace(/x\^2/g, `(${x}*${x})`)
      .replace(/(?<!\^)x(?!\^)/g, `(${x})`);
    try {
      return new Function(`return (${e})`)();
    } catch {
      return NaN;
    }
  };

  const f0 = evalAt(0);
  const f1 = evalAt(1);
  const f_1 = evalAt(-1);

  const C = f0;
  const A = (f1 + f_1 - 2 * C) / 2;
  const B = f1 - A - C;

  const discriminant = B * B - 4 * A * C;

  if (Math.abs(A) < 1e-10) {
    // It's actually linear
    if (Math.abs(B) < 1e-10) {
      return { roots: [], steps: ["No variable found. Not a valid equation."], type: "quadratic" };
    }
    const root = -C / B;
    return {
      roots: [formatNumber(root)],
      steps: [`This is actually a linear equation: ${formatCoeff(B)}x + ${formatNumber(C)} = 0`, `x = ${formatNumber(root)}`],
      type: "quadratic",
    };
  }

  const steps: string[] = [
    `Standard form: ${formatCoeff(A)}x² + ${formatCoeff(B)}x + ${formatNumber(C)} = 0`,
    `Discriminant Δ = b² - 4ac = ${formatNumber(B)}² - 4(${formatNumber(A)})(${formatNumber(C)}) = ${formatNumber(discriminant)}`,
  ];

  if (discriminant < 0) {
    const realPart = -B / (2 * A);
    const imagPart = Math.sqrt(-discriminant) / (2 * A);
    return {
      roots: [`${formatNumber(realPart)} + ${formatNumber(imagPart)}i`, `${formatNumber(realPart)} - ${formatNumber(imagPart)}i`],
      steps: [...steps, `Δ < 0, so there are two complex roots`, `x = ${formatNumber(realPart)} ± ${formatNumber(imagPart)}i`],
      type: "quadratic",
    };
  }

  if (Math.abs(discriminant) < 1e-10) {
    const root = -B / (2 * A);
    return {
      roots: [formatNumber(root)],
      steps: [...steps, `Δ = 0, so there is one real root (double root)`, `x = -b/(2a) = ${formatNumber(root)}`],
      type: "quadratic",
    };
  }

  const sqrtD = Math.sqrt(discriminant);
  const root1 = (-B + sqrtD) / (2 * A);
  const root2 = (-B - sqrtD) / (2 * A);
  return {
    roots: [formatNumber(root1), formatNumber(root2)],
    steps: [
      ...steps,
      `Δ > 0, so there are two real roots`,
      `x₁ = (-b + √Δ) / (2a) = ${formatNumber(root1)}`,
      `x₂ = (-b - √Δ) / (2a) = ${formatNumber(root2)}`,
    ],
    type: "quadratic",
  };
}

function solveCubic(left: string, right: string): EquationSolution {
  // For cubic, use numerical approach (Newton's method) to find one real root,
  // then reduce to quadratic
  const expr = `(${left})-(${right})`;

  const f = (x: number): number => {
    const e = expr
      .replace(/x\^3/g, `(${x}*${x}*${x})`)
      .replace(/x\^2/g, `(${x}*${x})`)
      .replace(/(?<!\^)x(?!\^)/g, `(${x})`);
    try {
      return new Function(`return (${e})`)();
    } catch {
      return NaN;
    }
  };

  // Find one real root using Newton's method
  let x = 0;
  for (let i = 0; i < 100; i++) {
    const fx = f(x);
    if (Math.abs(fx) < 1e-10) break;
    const h = 0.0001;
    const df = (f(x + h) - f(x - h)) / (2 * h);
    if (Math.abs(df) < 1e-10) {
      x += Math.random() * 2 - 1; // Perturb if derivative is zero
      continue;
    }
    x = x - fx / df;
  }

  const root1 = x;
  const steps: string[] = [
    `Cubic equation detected. Using numerical methods.`,
    `Found one real root: x₁ ≈ ${formatNumber(root1)}`,
    `For remaining roots, factor out (x - ${formatNumber(root1)}) and solve the resulting quadratic.`,
  ];

  return {
    roots: [formatNumber(root1)],
    steps,
    type: "cubic",
  };
}

function solveSystem2(eq1: string, eq2: string): EquationSolution {
  // Parse two linear equations in form: ax + by = c
  const parseLinear2 = (eq: string): { a: number; b: number; c: number } | null => {
    const [left, right] = eq.split("=");
    if (!left || !right) return null;

    const evalAt = (x: number, y: number): number => {
      let e = `(${left})-(${right})`;
      e = e.replace(/(?<!\^)x(?!\^)/g, `(${x})`).replace(/(?<!\^)y(?!\^)/g, `(${y})`);
      try {
        return new Function(`return (${e})`)();
      } catch {
        return NaN;
      }
    };

    const f00 = evalAt(0, 0);
    const f10 = evalAt(1, 0);
    const f01 = evalAt(0, 1);

    const a = f10 - f00;
    const b = f01 - f00;
    const c = -f00;

    return { a, b, c };
  };

  const p1 = parseLinear2(eq1);
  const p2 = parseLinear2(eq2);

  if (!p1 || !p2) {
    return { roots: [], steps: ["Could not parse equations. Use format: ax + by = c"], type: "system2" };
  }

  // Cramer's rule
  const det = p1.a * p2.b - p2.a * p1.b;

  if (Math.abs(det) < 1e-10) {
    return {
      roots: [],
      steps: [
        `Equation 1: ${formatCoeff(p1.a)}x + ${formatCoeff(p1.b)}y = ${formatNumber(p1.c)}`,
        `Equation 2: ${formatCoeff(p2.a)}x + ${formatCoeff(p2.b)}y = ${formatNumber(p2.c)}`,
        `Determinant = 0. The system has either no solution or infinitely many solutions.`,
      ],
      type: "system2",
    };
  }

  const x = (p1.c * p2.b - p2.c * p1.b) / det;
  const y = (p1.a * p2.c - p2.a * p1.c) / det;

  return {
    roots: [`x = ${formatNumber(x)}`, `y = ${formatNumber(y)}`],
    steps: [
      `Equation 1: ${formatCoeff(p1.a)}x + ${formatCoeff(p1.b)}y = ${formatNumber(p1.c)}`,
      `Equation 2: ${formatCoeff(p2.a)}x + ${formatCoeff(p2.b)}y = ${formatNumber(p2.c)}`,
      `Using Cramer's rule:`,
      `Determinant = ${formatNumber(p1.a)}×${formatNumber(p2.b)} - ${formatNumber(p2.a)}×${formatNumber(p1.b)} = ${formatNumber(det)}`,
      `x = (${formatNumber(p1.c)}×${formatNumber(p2.b)} - ${formatNumber(p2.c)}×${formatNumber(p1.b)}) / ${formatNumber(det)} = ${formatNumber(x)}`,
      `y = (${formatNumber(p1.a)}×${formatNumber(p2.c)} - ${formatNumber(p2.a)}×${formatNumber(p1.c)}) / ${formatNumber(det)} = ${formatNumber(y)}`,
    ],
    type: "system2",
  };
}

function formatNumber(n: number): string {
  if (!isFinite(n)) return "undefined";
  return parseFloat(n.toPrecision(10)).toString();
}

function formatCoeff(n: number): string {
  if (Math.abs(n - 1) < 1e-10) return "";
  if (Math.abs(n + 1) < 1e-10) return "-";
  return formatNumber(n);
}