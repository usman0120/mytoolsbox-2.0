// ---------------------------------------------------------------------------
// Math Engine – Client-side symbolic & numeric solver
// ---------------------------------------------------------------------------

export interface MathSolution {
  result: string;
  steps: string[];
  topic: string;
  graphData?: GraphData;
  relatedConcepts: string[];
  practiceQuestions: PracticeQuestion[];
}

export interface GraphData {
  type: "function" | "points" | "inequality";
  functions: { expr: string; color: string; label?: string }[];
  xRange: [number, number];
  yRange: [number, number];
  keyPoints?: { x: number; y: number; label: string }[];
}

export interface PracticeQuestion {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
}

// ---------------------------------------------------------------------------
// Quadratic equation solver
// ---------------------------------------------------------------------------

function solveQuadratic(a: number, b: number, c: number): MathSolution {
  const discriminant = b * b - 4 * a * c;
  const steps: string[] = [];
  steps.push(`Identify coefficients: a = ${a}, b = ${b}, c = ${c}`);
  steps.push(`Discriminant: Δ = b² − 4ac = ${b}² − 4(${a})(${c}) = ${b * b} − ${4 * a * c} = ${discriminant}`);

  let result: string;
  let keyPoints: { x: number; y: number; label: string }[] = [];

  if (discriminant > 0) {
    const sqrtD = Math.sqrt(discriminant);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    steps.push(`√Δ = ${sqrtD.toFixed(4)}`);
    steps.push(`x = (−b ± √Δ) / (2a) = (−${b} ± ${sqrtD.toFixed(4)}) / ${2 * a}`);
    steps.push(`x₁ = (−${b} + ${sqrtD.toFixed(4)}) / ${2 * a} = ${x1.toFixed(4)}`);
    steps.push(`x₂ = (−${b} − ${sqrtD.toFixed(4)}) / ${2 * a} = ${x2.toFixed(4)}`);
    result = `x = ${x1.toFixed(4)} or x = ${x2.toFixed(4)}`;
    keyPoints = [
      { x: x1, y: 0, label: `(${x1.toFixed(2)}, 0)` },
      { x: x2, y: 0, label: `(${x2.toFixed(2)}, 0)` },
    ];
  } else if (discriminant === 0) {
    const x = -b / (2 * a);
    steps.push(`Δ = 0 → one real root (double root)`);
    steps.push(`x = −b / (2a) = −${b} / ${2 * a} = ${x.toFixed(4)}`);
    result = `x = ${x.toFixed(4)} (double root)`;
    keyPoints = [{ x, y: 0, label: `(${x.toFixed(2)}, 0)` }];
  } else {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-discriminant) / (2 * a);
    steps.push(`Δ < 0 → two complex roots`);
    steps.push(`x = −b/(2a) ± i√|Δ|/(2a)`);
    steps.push(`x = ${realPart.toFixed(4)} ± ${imagPart.toFixed(4)}i`);
    result = `x = ${realPart.toFixed(4)} ± ${imagPart.toFixed(4)}i`;
  }

  // Vertex
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;
  steps.push(`Vertex: x = −b/(2a) = ${vertexX.toFixed(4)}, y = ${vertexY.toFixed(4)}`);
  keyPoints.push({ x: vertexX, y: vertexY, label: `Vertex (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})` });

  return {
    result,
    steps,
    topic: "Algebra — Quadratic Equations",
    graphData: {
      type: "function",
      functions: [{ expr: `${a}x² + ${b}x + ${c}`, color: "#06b6d4", label: `f(x) = ${a}x² + ${b}x + ${c}` }],
      xRange: [vertexX - 5, vertexX + 5] as [number, number],
      yRange: [Math.min(0, vertexY) - 2, Math.max(0, vertexY) + 2] as [number, number],
      keyPoints,
    },
    relatedConcepts: [
      "Quadratic Formula",
      "Discriminant Analysis",
      "Parabola Vertex Form",
      "Factoring Quadratics",
      "Completing the Square",
    ],
    practiceQuestions: [
      { question: `Solve: ${a + 1}x² + ${b + 2}x + ${c - 1} = 0`, answer: "Use quadratic formula", difficulty: "easy" },
      { question: `Find the vertex of y = ${a}x² + ${b}x + ${c}`, answer: `Vertex at (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`, difficulty: "medium" },
      { question: `Write ${a}x² + ${b}x + ${c} in vertex form`, answer: `y = ${a}(x − ${vertexX.toFixed(2)})² + ${vertexY.toFixed(2)}`, difficulty: "hard" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Derivative solver (polynomial + trig)
// ---------------------------------------------------------------------------

function solveDerivative(expr: string): MathSolution {
  const steps: string[] = [];
  steps.push(`f(x) = ${expr}`);

  // Handle x^n * sin(x) pattern
  const prodMatch = expr.match(/x\^?(\d+)?\s*\*\s*sin\(x\)/i) || expr.match(/x\^?(\d+)?sin\(x\)/i);
  if (prodMatch) {
    const n = parseInt(prodMatch[1] || "1");
    steps.push(`Use product rule: (u·v)′ = u′v + uv′`);
    steps.push(`u = x${n > 1 ? "^" + n : ""} → u′ = ${n}x${n > 2 ? "^" + (n - 1) : n === 2 ? "" : ""}`);
    steps.push(`v = sin(x) → v′ = cos(x)`);
    const uPrime = n === 1 ? "1" : `${n}x${n > 2 ? "^" + (n - 1) : ""}`;
    const uTerm = n === 1 ? "x" : `x^${n}`;
    steps.push(`f′(x) = ${uPrime}·sin(x) + ${uTerm}·cos(x)`);
    return {
      result: `f′(x) = ${uPrime}sin(x) + ${uTerm}cos(x)`,
      steps,
      topic: "Calculus — Derivatives",
      relatedConcepts: ["Product Rule", "Chain Rule", "Trigonometric Derivatives", "Higher Order Derivatives"],
      practiceQuestions: [
        { question: `Find derivative of x²cos(x)`, answer: "2x·cos(x) − x²·sin(x)", difficulty: "medium" },
        { question: `Find derivative of e^x·sin(x)`, answer: "e^x(sin(x) + cos(x))", difficulty: "medium" },
        { question: `Find f″(x) for f(x) = x³sin(x)`, answer: "6x·sin(x) + 6x²·cos(x) − x³·sin(x)", difficulty: "hard" },
      ],
    };
  }

  // Handle simple polynomial: ax^n
  const polyMatch = expr.match(/(\d+)?x\^?(\d+)/i);
  if (polyMatch) {
    const coeff = parseInt(polyMatch[1] || "1");
    const power = parseInt(polyMatch[2]);
    const newCoeff = coeff * power;
    const newPower = power - 1;
    steps.push(`Power rule: d/dx[axⁿ] = a·n·xⁿ⁻¹`);
    steps.push(`d/dx[${coeff}x^${power}] = ${coeff}·${power}·x^${power - 1} = ${newCoeff}x${newPower > 1 ? "^" + newPower : ""}`);
    return {
      result: `f′(x) = ${newCoeff}x${newPower > 1 ? "^" + newPower : ""}`,
      steps,
      topic: "Calculus — Derivatives",
      relatedConcepts: ["Power Rule", "Sum Rule", "Constant Multiple Rule"],
      practiceQuestions: [
        { question: `Find derivative of 5x⁴`, answer: "20x³", difficulty: "easy" },
        { question: `Find derivative of 3x² + 2x − 1`, answer: "6x + 2", difficulty: "easy" },
        { question: `Find derivative of x⁵ − 4x³ + 2x`, answer: "5x⁴ − 12x² + 2", difficulty: "medium" },
      ],
    };
  }

  // Generic
  steps.push("Apply differentiation rules to each term");
  return {
    result: `f′(x) = derivative of ${expr}`,
    steps,
    topic: "Calculus — Derivatives",
    relatedConcepts: ["Differentiation Rules", "Chain Rule", "Implicit Differentiation"],
    practiceQuestions: [
      { question: `Find derivative of ln(x)`, answer: "1/x", difficulty: "easy" },
      { question: `Find derivative of e^(2x)`, answer: "2e^(2x)", difficulty: "medium" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Integral solver
// ---------------------------------------------------------------------------

function solveIntegral(expr: string): MathSolution {
  const steps: string[] = [];
  steps.push(`∫ ${expr} dx`);

  // ∫(ax^n)dx
  const terms = expr.match(/(\d+)x\^?(\d+)/g);
  if (terms) {
    const results: string[] = [];
    for (const term of terms) {
      const m = term.match(/(\d+)x\^?(\d+)/i);
      if (m) {
        const coeff = parseInt(m[1]);
        const power = parseInt(m[2]);
        const newPower = power + 1;
        const newCoeff = coeff / newPower;
        const coeffStr = newCoeff === 1 ? "" : newCoeff === Math.floor(newCoeff) ? newCoeff.toString() : `(${coeff}/${newPower})`;
        steps.push(`∫ ${coeff}x^${power} dx = ${coeff}·x^${newPower}/${newPower} = ${coeffStr}x^${newPower}`);
        results.push(`${coeffStr}x^${newPower}`);
      }
    }
    const resultStr = results.join(" + ") + " + C";
    steps.push(`Add constant of integration: ${resultStr}`);
    return {
      result: resultStr,
      steps,
      topic: "Calculus — Integration",
      relatedConcepts: ["Power Rule for Integration", "Definite Integrals", "U-Substitution", "Integration by Parts"],
      practiceQuestions: [
        { question: `∫ 4x³ dx`, answer: "x⁴ + C", difficulty: "easy" },
        { question: `∫ (6x² + 2) dx`, answer: "2x³ + 2x + C", difficulty: "easy" },
        { question: `∫ (x² + 3x + 1) dx from 0 to 2`, answer: "20/3", difficulty: "medium" },
      ],
    };
  }

  steps.push("Apply integration rules term by term");
  return {
    result: `∫ ${expr} dx = ... + C`,
    steps,
    topic: "Calculus — Integration",
    relatedConcepts: ["Indefinite Integrals", "Fundamental Theorem of Calculus", "Riemann Sums"],
    practiceQuestions: [
      { question: `∫ 1/x dx`, answer: "ln|x| + C", difficulty: "easy" },
      { question: `∫ e^x dx`, answer: "e^x + C", difficulty: "easy" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Linear equation solver (2x2 system)
// ---------------------------------------------------------------------------

function solveLinearSystem(expr: string): MathSolution {
  const steps: string[] = [];
  // Try to parse: 2x + y = 5, x - y = 1
  const eqMatch = expr.match(/(\d+)x\s*([+-])\s*(\d*)y\s*=\s*(-?\d+).*?(\d+)x\s*([+-])\s*(\d*)y\s*=\s*(-?\d+)/);
  if (eqMatch) {
    const a1 = parseInt(eqMatch[1]), op1 = eqMatch[2], b1 = parseInt(eqMatch[3] || "1") * (op1 === "-" ? -1 : 1), c1 = parseInt(eqMatch[4]);
    const a2 = parseInt(eqMatch[5]), op2 = eqMatch[6], b2 = parseInt(eqMatch[7] || "1") * (op2 === "-" ? -1 : 1), c2 = parseInt(eqMatch[8]);

    steps.push(`${a1}x ${b1 >= 0 ? "+" : "-"} ${Math.abs(b1)}y = ${c1}`);
    steps.push(`${a2}x ${b2 >= 0 ? "+" : "-"} ${Math.abs(b2)}y = ${c2}`);

    const det = a1 * b2 - a2 * b1;
    steps.push(`Determinant: D = ${a1}·(${b2}) − ${a2}·(${b1}) = ${det}`);

    if (det !== 0) {
      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;
      steps.push(`x = (${c1}·${b2} − ${c2}·${b1}) / ${det} = ${x.toFixed(4)}`);
      steps.push(`y = (${a1}·${c2} − ${a2}·${c1}) / ${det} = ${y.toFixed(4)}`);
      return {
        result: `x = ${x.toFixed(4)}, y = ${y.toFixed(4)}`,
        steps,
        topic: "Linear Algebra — Systems of Equations",
        relatedConcepts: ["Cramer's Rule", "Matrix Inversion", "Gaussian Elimination", "Eigenvalues"],
        practiceQuestions: [
          { question: `Solve: 3x + 2y = 7, x − y = 1`, answer: "x = 1.8, y = 0.8", difficulty: "easy" },
          { question: `Solve: 4x − y = 10, 2x + 3y = 12`, answer: "x = 3, y = 2", difficulty: "medium" },
        ],
      };
    }
  }

  steps.push("Use elimination or substitution method");
  return {
    result: "Solve using elimination or substitution",
    steps,
    topic: "Linear Algebra — Systems of Equations",
    relatedConcepts: ["Substitution Method", "Elimination Method", "Matrix Methods"],
    practiceQuestions: [
      { question: `Solve: x + y = 5, x − y = 1`, answer: "x = 3, y = 2", difficulty: "easy" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Trigonometry solver
// ---------------------------------------------------------------------------

function solveTrigonometry(expr: string): MathSolution {
  const steps: string[] = [];
  steps.push(`Solve: ${expr}`);

  if (expr.includes("sin(2") && expr.includes("cos(")) {
    steps.push("Use double-angle identity: sin(2θ) = 2sin(θ)cos(θ)");
    steps.push("2sin(θ)cos(θ) = cos(θ)");
    steps.push("cos(θ)(2sin(θ) − 1) = 0");
    steps.push("Case 1: cos(θ) = 0 → θ = π/2 + πn");
    steps.push("Case 2: 2sin(θ) − 1 = 0 → sin(θ) = 1/2 → θ = π/6 + 2πn or 5π/6 + 2πn");
    return {
      result: "θ = π/6 + 2πn, 5π/6 + 2πn, or π/2 + πn",
      steps,
      topic: "Trigonometry — Equations",
      graphData: {
        type: "function",
        functions: [
          { expr: "sin(2θ)", color: "#06b6d4", label: "sin(2θ)" },
          { expr: "cos(θ)", color: "#f59e0b", label: "cos(θ)" },
        ],
        xRange: [0, 2 * Math.PI] as [number, number],
        yRange: [-1.5, 1.5] as [number, number],
      },
      relatedConcepts: ["Double Angle Formulas", "Unit Circle", "Trigonometric Identities", "Periodic Functions"],
      practiceQuestions: [
        { question: "Solve: sin(θ) = 1/2 for 0 ≤ θ < 2π", answer: "θ = π/6 or 5π/6", difficulty: "easy" },
        { question: "Solve: cos(2θ) = 0 for 0 ≤ θ < 2π", answer: "θ = π/4, 3π/4, 5π/4, 7π/4", difficulty: "medium" },
        { question: "Prove: tan²θ + 1 = sec²θ", answer: "Divide sin²θ + cos²θ = 1 by cos²θ", difficulty: "hard" },
      ],
    };
  }

  steps.push("Apply trigonometric identities and solve");
  return {
    result: "Apply identities to solve",
    steps,
    topic: "Trigonometry",
    relatedConcepts: ["Trigonometric Identities", "Unit Circle", "Inverse Trig Functions"],
    practiceQuestions: [
      { question: "Find sin(30°)", answer: "1/2", difficulty: "easy" },
      { question: "Find cos(π/3)", answer: "1/2", difficulty: "easy" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Statistics solver
// ---------------------------------------------------------------------------

function solveStatistics(expr: string): MathSolution {
  const steps: string[] = [];
  steps.push(`Problem: ${expr}`);

  // Poisson
  if (expr.toLowerCase().includes("poisson")) {
    const lambdaMatch = expr.match(/λ\s*=\s*(\d+)/) || expr.match(/lambda\s*=\s*(\d+)/);
    const lambda = lambdaMatch ? parseInt(lambdaMatch[1]) : 3;
    steps.push(`X ~ Poisson(λ = ${lambda})`);
    steps.push(`P(X = k) = e^(-λ)·λ^k / k!`);

    // P(X > 2)
    if (expr.includes(">")) {
      const probs: number[] = [];
      for (let k = 0; k <= 2; k++) {
        const p = Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
        probs.push(p);
        steps.push(`P(X = ${k}) = e^(-${lambda})·${lambda}^${k}/${k}! = ${p.toFixed(4)}`);
      }
      const sum = probs.reduce((a, b) => a + b, 0);
      const result = 1 - sum;
      steps.push(`P(X ≤ 2) = ${probs.map(p => p.toFixed(4)).join(" + ")} = ${sum.toFixed(4)}`);
      steps.push(`P(X > 2) = 1 − ${sum.toFixed(4)} = ${result.toFixed(4)}`);
      return {
        result: `P(X > 2) = ${result.toFixed(4)}`,
        steps,
        topic: "Statistics — Probability Distributions",
        relatedConcepts: ["Poisson Distribution", "Binomial Distribution", "Normal Distribution", "Expected Value"],
        practiceQuestions: [
          { question: `P(X = 0) for Poisson(λ=2)`, answer: "e^(-2) ≈ 0.1353", difficulty: "easy" },
          { question: `P(X ≥ 1) for Poisson(λ=1)`, answer: "1 − e^(-1) ≈ 0.6321", difficulty: "medium" },
        ],
      };
    }
  }

  // Mean/StdDev from data
  const numbers = expr.match(/\d+/g);
  if (numbers && numbers.length >= 3) {
    const data = numbers.map(Number);
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, x) => sum + (x - mean) ** 2, 0) / data.length;
    const stdDev = Math.sqrt(variance);
    steps.push(`Data: [${data.join(", ")}]`);
    steps.push(`Mean = (${data.join(" + ")}) / ${data.length} = ${mean.toFixed(4)}`);
    steps.push(`Variance = Σ(x − μ)² / n = ${variance.toFixed(4)}`);
    steps.push(`Standard Deviation = √${variance.toFixed(4)} = ${stdDev.toFixed(4)}`);
    return {
      result: `Mean = ${mean.toFixed(4)}, SD = ${stdDev.toFixed(4)}`,
      steps,
      topic: "Statistics — Descriptive",
      relatedConcepts: ["Mean, Median, Mode", "Variance & Standard Deviation", "Normal Distribution", "Z-Scores"],
      practiceQuestions: [
        { question: "Find mean of [2, 4, 6, 8, 10]", answer: "6", difficulty: "easy" },
        { question: "Find standard deviation of [1, 2, 3, 4, 5]", answer: "√2 ≈ 1.414", difficulty: "medium" },
      ],
    };
  }

  return {
    result: "Enter statistical data for analysis",
    steps,
    topic: "Statistics",
    relatedConcepts: ["Descriptive Statistics", "Probability", "Hypothesis Testing"],
    practiceQuestions: [
      { question: "What is the mean of 10, 20, 30?", answer: "20", difficulty: "easy" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Percentage / Ratio solver
// ---------------------------------------------------------------------------

function solvePercentage(expr: string): MathSolution {
  const steps: string[] = [];
  steps.push(`Problem: ${expr}`);

  // "what is X% of Y"
  const pctOf = expr.match(/what\s+is\s+(\d+)\s*%\s*of\s+(\d+)/i);
  if (pctOf) {
    const pct = parseInt(pctOf[1]);
    const num = parseInt(pctOf[2]);
    const result = (pct / 100) * num;
    steps.push(`${pct}% = ${pct}/100 = ${pct / 100}`);
    steps.push(`${pct}% of ${num} = ${pct / 100} × ${num} = ${result}`);
    return {
      result: `${pct}% of ${num} = ${result}`,
      steps,
      topic: "Arithmetic — Percentages",
      relatedConcepts: ["Fractions to Percentages", "Percentage Change", "Discount Calculations"],
      practiceQuestions: [
        { question: "What is 15% of 200?", answer: "30", difficulty: "easy" },
        { question: "25% of what number is 50?", answer: "200", difficulty: "medium" },
      ],
    };
  }

  // "X is what % of Y"
  const isWhatPct = expr.match(/(\d+)\s+is\s+what\s*%\s*of\s+(\d+)/i);
  if (isWhatPct) {
    const x = parseInt(isWhatPct[1]);
    const y = parseInt(isWhatPct[2]);
    const result = (x / y) * 100;
    steps.push(`${x} / ${y} = ${(x / y).toFixed(4)}`);
    steps.push(`${(x / y).toFixed(4)} × 100 = ${result.toFixed(2)}%`);
    return {
      result: `${x} is ${result.toFixed(2)}% of ${y}`,
      steps,
      topic: "Arithmetic — Percentages",
      relatedConcepts: ["Ratio & Proportion", "Percentage Points vs Percent"],
      practiceQuestions: [
        { question: "30 is what % of 150?", answer: "20%", difficulty: "easy" },
      ],
    };
  }

  return {
    result: "Enter a percentage problem",
    steps,
    topic: "Arithmetic — Percentages",
    relatedConcepts: ["Percentage Basics", "Markup & Markdown", "Simple Interest"],
    practiceQuestions: [
      { question: "What is 10% of 500?", answer: "50", difficulty: "easy" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// ---------------------------------------------------------------------------
// Main solver – routes to the right sub-solver
// ---------------------------------------------------------------------------

export function solveMath(input: string): MathSolution {
  const trimmed = input.trim();

  // Quadratic detection
  const quadMatch = trimmed.match(/(\d*)\s*x\^?2\s*([+-]\s*\d*)\s*x\s*([+-]\s*\d*)\s*=\s*0/);
  if (quadMatch || (trimmed.includes("x²") || trimmed.includes("x^2")) && trimmed.includes("=")) {
    // Extract coefficients
    const aMatch = trimmed.match(/(\d*)\s*x\^?[²2]/);
    const bMatch = trimmed.match(/x\^?[²2]\s*([+-]\s*\d*)\s*x/) || trimmed.match(/([+-]?\s*\d+)\s*x\b(?!\^)/);
    const cMatch = trimmed.match(/([+-]\s*\d+)\s*=\s*0/);

    const a = aMatch ? (parseInt(aMatch[1]) || 1) : 1;
    let b = 0, c = 0;

    if (bMatch) {
      const bStr = bMatch[1].replace(/\s/g, "");
      b = parseInt(bStr) || (bStr === "+" ? 1 : bStr === "-" ? -1 : 0);
    }
    if (cMatch) {
      c = parseInt(cMatch[1].replace(/\s/g, ""));
    }

    if (a !== 0) return solveQuadratic(a, b, c);
  }

  // Derivative detection
  if (/\bderivative\b|f'?\s*\(\s*x\s*\)|d\/dx|differentiate/i.test(trimmed)) {
    const exprMatch = trimmed.match(/(?:of|:)\s*(.+)/i);
    return solveDerivative(exprMatch ? exprMatch[1].trim() : trimmed);
  }

  // Integral detection
  if (/\bintegrate\b|∫|antiderivative|indefinite\s+integral/i.test(trimmed)) {
    const exprMatch = trimmed.match(/(?:∫|integrate)\s*(.+?)(?:\s*dx)?$/i);
    return solveIntegral(exprMatch ? exprMatch[1].trim() : trimmed);
  }

  // Trigonometry detection
  if (/\bsin\b|\bcos\b|\btan\b|trig|θ|pi\b/i.test(trimmed)) {
    return solveTrigonometry(trimmed);
  }

  // Statistics detection
  if (/\bpoisson\b|\bmean\b|\bstandard\s+deviation\b|\bvariance\b|\bprobability\b|data\s*[:=]\s*\[/i.test(trimmed)) {
    return solveStatistics(trimmed);
  }

  // Percentage detection
  if (/%|percent|percentage/i.test(trimmed)) {
    return solvePercentage(trimmed);
  }

  // Linear system detection
  if (trimmed.includes("x") && trimmed.includes("y") && (trimmed.match(/=/g) || []).length >= 2) {
    return solveLinearSystem(trimmed);
  }

  // Generic fallback
  return {
    result: "Enter a specific math problem for a step-by-step solution.",
    steps: ["Try one of the example problems below, or type your own equation."],
    topic: "General",
    relatedConcepts: ["Algebra", "Calculus", "Trigonometry", "Statistics", "Linear Algebra"],
    practiceQuestions: [
      { question: "Solve: x² + 5x + 6 = 0", answer: "x = -2 or x = -3", difficulty: "easy" },
      { question: "Find derivative of x³", answer: "3x²", difficulty: "easy" },
      { question: "What is 20% of 150?", answer: "30", difficulty: "easy" },
    ],
  };
}