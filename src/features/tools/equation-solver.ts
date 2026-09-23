// Equation Solver mathematical engine supporting Linear, Quadratic, Cubic, and Systems (2x2 and 3x3)

export interface EquationSolution {
  type: "linear" | "quadratic" | "cubic" | "system2" | "system3" | "unknown";
  roots: string[];
  steps: string[];
  properties?: {
    discriminant?: number;
    vertex?: { x: number; y: number };
    axisOfSymmetry?: number;
    yIntercept?: number;
  };
}

export function solveEquation(equation: string): EquationSolution {
  const cleaned = equation.trim().replace(/\s+/g, " ");

  // Check for multi-line or semicolon-separated systems
  const parts = cleaned.split(/[\n;]+/).map(p => p.trim()).filter(Boolean);

  if (parts.length === 3) {
    return solveSystem3(parts[0], parts[1], parts[2]);
  }
  if (parts.length === 2) {
    return solveSystem2(parts[0], parts[1]);
  }

  return solveSingle(parts[0] || cleaned);
}

function solveSingle(equation: string): EquationSolution {
  const eq = equation.replace(/\s+/g, "").toLowerCase();
  const sides = eq.split("=");
  const left = sides[0] || "0";
  const right = sides[1] || "0";

  // Check degree
  const hasX3 = /x\^3/.test(left) || /x\^3/.test(right);
  const hasX2 = /x\^2/.test(left) || /x\^2/.test(right);

  if (hasX3) {
    return solveCubic(left, right);
  } else if (hasX2) {
    return solveQuadratic(left, right);
  } else {
    return solveLinear(left, right);
  }
}

function parsePolynomialCoeffs(left: string, right: string, degree: 1 | 2 | 3): number[] {
  // Move all to left: f(x) = (left) - (right)
  const expr = `(${left})-(${right})`;

  const evalAt = (x: number): number => {
    let e = expr
      .replace(/(\d)x/gi, "$1*x")
      .replace(/x\^3/gi, `(${x}*${x}*${x})`)
      .replace(/x\^2/gi, `(${x}*${x})`)
      .replace(/(?<![a-zA-Z_])x(?![a-zA-Z_])/gi, `(${x})`)
      .replace(/(\d)\(/g, "$1*(")
      .replace(/\)(\d)/g, ")*$1");

    try {
      const res = new Function(`return (${e})`)();
      return typeof res === "number" && !isNaN(res) ? res : 0;
    } catch {
      return 0;
    }
  };

  if (degree === 1) {
    // f(x) = ax + b
    const f0 = evalAt(0); // b
    const f1 = evalAt(1); // a + b
    const a = f1 - f0;
    const b = f0;
    return [a, b];
  }

  if (degree === 2) {
    // f(x) = ax^2 + bx + c
    const f0 = evalAt(0); // c
    const f1 = evalAt(1); // a + b + c
    const f_1 = evalAt(-1); // a - b + c
    const c = f0;
    const a = (f1 + f_1 - 2 * c) / 2;
    const b = f1 - a - c;
    return [a, b, c];
  }

  // Degree 3: f(x) = ax^3 + bx^2 + cx + d
  const f0 = evalAt(0);
  const f1 = evalAt(1);
  const f_1 = evalAt(-1);
  const f2 = evalAt(2);

  const d = f0;
  // f1 - d = a + b + c
  // f_1 - d = -a + b - c
  // Sum: f1 + f_1 - 2d = 2b => b = (f1 + f_1 - 2d) / 2
  const b = (f1 + f_1 - 2 * d) / 2;
  // Diff: f1 - f_1 = 2a + 2c => a + c = (f1 - f_1) / 2
  const acSum = (f1 - f_1) / 2;
  // f2 = 8a + 4b + 2c + d => 8a + 2c = f2 - 4b - d
  // 6a + 2(a + c) = f2 - 4b - d => 6a = (f2 - 4b - d) - 2*acSum
  const a = ((f2 - 4 * b - d) - 2 * acSum) / 6;
  const c = acSum - a;

  return [a, b, c, d];
}

function solveLinear(left: string, right: string): EquationSolution {
  const [a, b] = parsePolynomialCoeffs(left, right, 1);

  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) < 1e-12) {
      return {
        type: "linear",
        roots: ["Infinite solutions (identity)"],
        steps: ["0 = 0 is true for all real values of x."],
      };
    }
    return {
      type: "linear",
      roots: ["No solution (contradiction)"],
      steps: [`Simplified equation gives ${formatNumber(b)} = 0, which is false.`],
    };
  }

  const root = -b / a;
  return {
    type: "linear",
    roots: [formatNumber(root)],
    steps: [
      `Standard form: ${formatCoeff(a)}x + ${formatNumber(b)} = 0`,
      `Subtract ${formatNumber(b)}: ${formatCoeff(a)}x = ${formatNumber(-b)}`,
      `Divide by ${formatNumber(a)}: x = ${formatNumber(root)}`,
    ],
  };
}

function solveQuadratic(left: string, right: string): EquationSolution {
  const [a, b, c] = parsePolynomialCoeffs(left, right, 2);

  if (Math.abs(a) < 1e-12) {
    return solveLinear(left, right);
  }

  const discriminant = b * b - 4 * a * c;
  const vertexX = -b / (2 * a);
  const vertexY = c - (b * b) / (4 * a);

  const steps: string[] = [
    `Standard form: ${formatCoeff(a)}x² + ${formatCoeff(b)}x + ${formatNumber(c)} = 0`,
    `Identify coefficients: a = ${formatNumber(a)}, b = ${formatNumber(b)}, c = ${formatNumber(c)}`,
    `Calculate discriminant Δ = b² - 4ac = (${formatNumber(b)})² - 4(${formatNumber(a)})(${formatNumber(c)}) = ${formatNumber(discriminant)}`,
  ];

  const properties = {
    discriminant: round(discriminant),
    vertex: { x: round(vertexX), y: round(vertexY) },
    axisOfSymmetry: round(vertexX),
    yIntercept: round(c),
  };

  if (discriminant < 0) {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-discriminant) / (2 * Math.abs(a));
    const r1 = `${formatNumber(realPart)} + ${formatNumber(imagPart)}i`;
    const r2 = `${formatNumber(realPart)} - ${formatNumber(imagPart)}i`;
    return {
      type: "quadratic",
      roots: [r1, r2],
      steps: [
        ...steps,
        `Since Δ < 0, the equation has two complex conjugate roots.`,
        `x = (-b ± √|Δ| i) / (2a)`,
        `x₁ = ${r1}`,
        `x₂ = ${r2}`,
      ],
      properties,
    };
  }

  if (Math.abs(discriminant) < 1e-12) {
    const root = -b / (2 * a);
    return {
      type: "quadratic",
      roots: [formatNumber(root)],
      steps: [
        ...steps,
        `Since Δ = 0, the equation has exactly one unique real root (multiplicity 2).`,
        `x = -b / (2a) = ${formatNumber(root)}`,
      ],
      properties,
    };
  }

  const sqrtD = Math.sqrt(discriminant);
  const root1 = (-b + sqrtD) / (2 * a);
  const root2 = (-b - sqrtD) / (2 * a);

  return {
    type: "quadratic",
    roots: [formatNumber(root1), formatNumber(root2)],
    steps: [
      ...steps,
      `Since Δ > 0, the equation has two distinct real roots.`,
      `x₁ = (-b + √Δ) / (2a) = (-(${formatNumber(b)}) + ${formatNumber(sqrtD)}) / ${formatNumber(2 * a)} = ${formatNumber(root1)}`,
      `x₂ = (-b - √Δ) / (2a) = (-(${formatNumber(b)}) - ${formatNumber(sqrtD)}) / ${formatNumber(2 * a)} = ${formatNumber(root2)}`,
    ],
    properties,
  };
}

function solveCubic(left: string, right: string): EquationSolution {
  const [a, b, c, d] = parsePolynomialCoeffs(left, right, 3);

  if (Math.abs(a) < 1e-12) {
    return solveQuadratic(left, right);
  }

  // Cardano's method or numerical root finding + quadratic reduction
  // f(x) = a*x^3 + b*x^2 + c*x + d
  const f = (x: number) => a * x * x * x + b * x * x + c * x + d;
  const df = (x: number) => 3 * a * x * x + 2 * b * x + c;

  // Newton-Raphson to find one real root
  let r1 = 0;
  for (let trial = 0; trial < 10; trial++) {
    let x = (trial % 2 === 0 ? 1 : -1) * trial * 1.5;
    for (let iter = 0; iter < 50; iter++) {
      const y = f(x);
      const dy = df(x);
      if (Math.abs(y) < 1e-10) break;
      if (Math.abs(dy) < 1e-10) {
        x += 0.5;
        continue;
      }
      x = x - y / dy;
    }
    if (Math.abs(f(x)) < 1e-7) {
      r1 = x;
      break;
    }
  }

  // Synthetic division by (x - r1)
  // (a*x^3 + b*x^2 + c*x + d) / (x - r1) = a*x^2 + (b + a*r1)*x + (c + (b + a*r1)*r1)
  const A = a;
  const B = b + a * r1;
  const C = c + B * r1;

  const quadSol = solveQuadratic(`${A}x^2 + ${B}x + ${C}`, "0");

  const allRoots = [formatNumber(r1), ...quadSol.roots];

  return {
    type: "cubic",
    roots: allRoots,
    steps: [
      `Standard form: ${formatCoeff(a)}x³ + ${formatCoeff(b)}x² + ${formatCoeff(c)}x + ${formatNumber(d)} = 0`,
      `Found real root via Newton-Raphson approximation: x₁ ≈ ${formatNumber(r1)}`,
      `Perform polynomial synthetic division to reduce to quadratic factor: (${formatCoeff(A)}x² + ${formatCoeff(B)}x + ${formatNumber(C)}) = 0`,
      ...quadSol.steps.slice(2),
    ],
  };
}

export function solveSystem2(eq1: string, eq2: string): EquationSolution {
  const parse2 = (eq: string) => {
    const parts = eq.split("=");
    const left = parts[0] || "0";
    const right = parts[1] || "0";

    const evalAt = (x: number, y: number) => {
      let e = `(${left})-(${right})`
        .replace(/(\d)x/gi, "$1*x")
        .replace(/(\d)y/gi, "$1*y")
        .replace(/(?<![a-zA-Z_])x(?![a-zA-Z_])/gi, `(${x})`)
        .replace(/(?<![a-zA-Z_])y(?![a-zA-Z_])/gi, `(${y})`)
        .replace(/(\d)\(/g, "$1*(")
        .replace(/\)(\d)/g, ")*$1");
      try {
        return new Function(`return (${e})`)();
      } catch {
        return 0;
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

  const p1 = parse2(eq1);
  const p2 = parse2(eq2);

  const det = p1.a * p2.b - p2.a * p1.b;

  if (Math.abs(det) < 1e-12) {
    return {
      type: "system2",
      roots: ["No unique solution (system is dependent or inconsistent)"],
      steps: [
        `Eq 1: ${formatCoeff(p1.a)}x + ${formatCoeff(p1.b)}y = ${formatNumber(p1.c)}`,
        `Eq 2: ${formatCoeff(p2.a)}x + ${formatCoeff(p2.b)}y = ${formatNumber(p2.c)}`,
        `Determinant D = ${p1.a}×${p2.b} - ${p2.a}×${p1.b} = 0. No unique solution exists.`,
      ],
    };
  }

  const dx = p1.c * p2.b - p2.c * p1.b;
  const dy = p1.a * p2.c - p2.a * p1.c;
  const x = dx / det;
  const y = dy / det;

  return {
    type: "system2",
    roots: [`x = ${formatNumber(x)}`, `y = ${formatNumber(y)}`],
    steps: [
      `Eq 1: ${formatCoeff(p1.a)}x + ${formatCoeff(p1.b)}y = ${formatNumber(p1.c)}`,
      `Eq 2: ${formatCoeff(p2.a)}x + ${formatCoeff(p2.b)}y = ${formatNumber(p2.c)}`,
      `Cramer's Rule:`,
      `Main Determinant D = (${p1.a})(${p2.b}) - (${p2.a})(${p1.b}) = ${formatNumber(det)}`,
      `Determinant Dx = (${p1.c})(${p2.b}) - (${p2.c})(${p1.b}) = ${formatNumber(dx)}`,
      `Determinant Dy = (${p1.a})(${p2.c}) - (${p2.a})(${p1.c}) = ${formatNumber(dy)}`,
      `x = Dx / D = ${formatNumber(dx)} / ${formatNumber(det)} = ${formatNumber(x)}`,
      `y = Dy / D = ${formatNumber(dy)} / ${formatNumber(det)} = ${formatNumber(y)}`,
    ],
  };
}

export function solveSystem3(eq1: string, eq2: string, eq3: string): EquationSolution {
  const parse3 = (eq: string) => {
    const parts = eq.split("=");
    const left = parts[0] || "0";
    const right = parts[1] || "0";

    const evalAt = (x: number, y: number, z: number) => {
      let e = `(${left})-(${right})`
        .replace(/(\d)x/gi, "$1*x")
        .replace(/(\d)y/gi, "$1*y")
        .replace(/(\d)z/gi, "$1*z")
        .replace(/(?<![a-zA-Z_])x(?![a-zA-Z_])/gi, `(${x})`)
        .replace(/(?<![a-zA-Z_])y(?![a-zA-Z_])/gi, `(${y})`)
        .replace(/(?<![a-zA-Z_])z(?![a-zA-Z_])/gi, `(${z})`)
        .replace(/(\d)\(/g, "$1*(")
        .replace(/\)(\d)/g, ")*$1");
      try {
        return new Function(`return (${e})`)();
      } catch {
        return 0;
      }
    };

    const f000 = evalAt(0, 0, 0);
    const a = evalAt(1, 0, 0) - f000;
    const b = evalAt(0, 1, 0) - f000;
    const c = evalAt(0, 0, 1) - f000;
    const d = -f000;
    return [a, b, c, d];
  };

  const matrix = [parse3(eq1), parse3(eq2), parse3(eq3)];

  // Gaussian elimination with back-substitution
  const m = matrix.map(r => [...r]);
  const n = 3;

  for (let i = 0; i < n; i++) {
    let pivot = i;
    while (pivot < n && Math.abs(m[pivot][i]) < 1e-12) pivot++;
    if (pivot === n) {
      return {
        type: "system3",
        roots: ["No unique solution (rank < 3)"],
        steps: ["Matrix is singular; system has either no solutions or infinite solutions."],
      };
    }
    if (pivot !== i) {
      [m[i], m[pivot]] = [m[pivot], m[i]];
    }

    const divisor = m[i][i];
    for (let j = i; j <= n; j++) {
      m[i][j] /= divisor;
    }

    for (let r = 0; r < n; r++) {
      if (r !== i) {
        const factor = m[r][i];
        for (let c = i; c <= n; c++) {
          m[r][c] -= factor * m[i][c];
        }
      }
    }
  }

  const x = m[0][3];
  const y = m[1][3];
  const z = m[2][3];

  return {
    type: "system3",
    roots: [`x = ${formatNumber(x)}`, `y = ${formatNumber(y)}`, `z = ${formatNumber(z)}`],
    steps: [
      `Eq 1: ${formatCoeff(matrix[0][0])}x + ${formatCoeff(matrix[0][1])}y + ${formatCoeff(matrix[0][2])}z = ${formatNumber(matrix[0][3])}`,
      `Eq 2: ${formatCoeff(matrix[1][0])}x + ${formatCoeff(matrix[1][1])}y + ${formatCoeff(matrix[1][2])}z = ${formatNumber(matrix[1][3])}`,
      `Eq 3: ${formatCoeff(matrix[2][0])}x + ${formatCoeff(matrix[2][1])}y + ${formatCoeff(matrix[2][2])}z = ${formatNumber(matrix[2][3])}`,
      `Perform Gauss-Jordan Elimination to Reduced Row Echelon Form (RREF)`,
      `x = ${formatNumber(x)}`,
      `y = ${formatNumber(y)}`,
      `z = ${formatNumber(z)}`,
    ],
  };
}

function round(n: number): number {
  return parseFloat(n.toFixed(6));
}

function formatNumber(n: number): string {
  if (!isFinite(n)) return "undefined";
  if (Math.abs(n) < 1e-12) return "0";
  return parseFloat(n.toPrecision(8)).toString();
}

function formatCoeff(n: number): string {
  if (Math.abs(n - 1) < 1e-12) return "";
  if (Math.abs(n + 1) < 1e-12) return "-";
  return formatNumber(n);
}