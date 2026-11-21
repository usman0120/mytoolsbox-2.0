// Equation to LaTeX Converter Core Engine
// Comprehensive math parser with formula catalog

export interface LatexConversionResult {
  latex: string;
  inline: string;    // $...$
  display: string;   // $$...$$
  mathml?: string;
}

export interface FormulaTemplate {
  name: string;
  description: string;
  input: string;
  latex: string;
  category: string;
}

export const FORMULA_CATALOG: FormulaTemplate[] = [
  // Calculus
  { name: "Quadratic Formula", description: "Roots of ax² + bx + c = 0", input: "(-b ± sqrt(b^2 - 4ac)) / (2a)", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", category: "Algebra" },
  { name: "Derivative Power Rule", description: "d/dx of x^n", input: "d/dx x^n = n*x^(n-1)", latex: "\\frac{d}{dx} x^n = nx^{n-1}", category: "Calculus" },
  { name: "Product Rule", description: "Derivative of product", input: "(fg)' = f'g + fg'", latex: "(fg)' = f'g + fg'", category: "Calculus" },
  { name: "Chain Rule", description: "Derivative of composite function", input: "d/dx f(g(x)) = f'(g(x))*g'(x)", latex: "\\frac{d}{dx} f(g(x)) = f'(g(x)) \\cdot g'(x)", category: "Calculus" },
  { name: "Definite Integral", description: "Area under a curve", input: "int(a,b) f(x) dx", latex: "\\int_{a}^{b} f(x)\\,dx", category: "Calculus" },
  { name: "Fundamental Theorem of Calculus", description: "FTC", input: "d/dx int(a,x) f(t) dt = f(x)", latex: "\\frac{d}{dx}\\int_{a}^{x} f(t)\\,dt = f(x)", category: "Calculus" },
  // Statistics
  { name: "Normal Distribution PDF", description: "Gaussian PDF", input: "f(x) = (1/(sigma*sqrt(2*pi))) * exp(-(x-mu)^2 / (2*sigma^2))", latex: "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}", category: "Statistics" },
  { name: "Bayes' Theorem", description: "Conditional probability", input: "P(A|B) = P(B|A)*P(A) / P(B)", latex: "P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}", category: "Statistics" },
  // Physics
  { name: "Einstein's E=mc²", description: "Mass-energy equivalence", input: "E = m*c^2", latex: "E = mc^2", category: "Physics" },
  { name: "Schrödinger Equation", description: "Time-dependent quantum wave equation", input: "iħ d/dt Psi = H Psi", latex: "i\\hbar \\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi", category: "Physics" },
  { name: "Lorentz Factor", description: "Relativistic time dilation", input: "gamma = 1 / sqrt(1 - v^2/c^2)", latex: "\\gamma = \\frac{1}{\\sqrt{1 - \\frac{v^2}{c^2}}}", category: "Physics" },
  // Mathematics
  { name: "Euler's Identity", description: "Most beautiful equation", input: "e^(i*pi) + 1 = 0", latex: "e^{i\\pi} + 1 = 0", category: "Mathematics" },
  { name: "Taylor Series", description: "Function expansion", input: "f(x) = sum(n=0,infinity) f^(n)(a) / n! * (x-a)^n", latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n", category: "Mathematics" },
  { name: "Fourier Transform", description: "Frequency domain transform", input: "F(omega) = int(-inf,inf) f(t) e^(-i*omega*t) dt", latex: "\\mathcal{F}(\\omega) = \\int_{-\\infty}^{\\infty} f(t)\\,e^{-i\\omega t}\\,dt", category: "Mathematics" },
  { name: "Pythagorean Theorem", description: "Right triangle relationship", input: "a^2 + b^2 = c^2", latex: "a^2 + b^2 = c^2", category: "Geometry" },
];

// LaTeX conversion rules: [pattern, replacement]
const CONVERSION_RULES: Array<[RegExp, string]> = [
  // Fractions: a/b -> \frac{a}{b}  (before other transforms)
  [/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, "\\frac{$1}{$2}"],
  [/([a-zA-Z0-9]+)\s*\/\s*([a-zA-Z0-9]+)/g, "\\frac{$1}{$2}"],
  // nth root
  [/root\[([^\]]+)\]\(([^)]+)\)/g, "\\sqrt[$1]{$2}"],
  [/nrt\s*\(([^)]+)\)/g, "\\sqrt[n]{$1}"],
  // Square root
  [/sqrt\s*\(([^)]+)\)/g, "\\sqrt{$1}"],
  [/√\s*\(([^)]+)\)/g, "\\sqrt{$1}"],
  [/√([a-zA-Z0-9]+)/g, "\\sqrt{$1}"],
  // Absolute value
  [/abs\s*\(([^)]+)\)/g, "\\left|$1\\right|"],
  // Summation: sum(i=0,n) or sum_(i=0)^(n)
  [/sum\s*\(([^,]+),([^)]+)\)/g, "\\sum_{$1}^{$2}"],
  [/sum_\{([^}]+)\}\s*\^\{([^}]+)\}/g, "\\sum_{$1}^{$2}"],
  // Product
  [/prod\s*\(([^,]+),([^)]+)\)/g, "\\prod_{$1}^{$2}"],
  // Integral: int(a,b) or integral(a,b)
  [/(?:int|integral)\s*\(([^,]+),([^)]+)\)/g, "\\int_{$1}^{$2}"],
  [/∫\s*\(([^,]+),([^)]+)\)/g, "\\int_{$1}^{$2}"],
  // Limit
  [/lim\s*\(([^)]+)\)/g, "\\lim_{$1}"],
  // Power: x^n -> x^{n}  (only for multi-char or grouped exponents)
  [/([a-zA-Z0-9)\]}])\^([a-zA-Z0-9]+)/g, "$1^{$2}"],
  // Subscript: x_n -> x_{n}
  [/([a-zA-Z0-9)\]}])_([a-zA-Z0-9]+)/g, "$1_{$2}"],
  // Greek letters (case-sensitive transformations)
  [/\bAlpha\b/g, "\\Alpha"], [/\balpha\b/g, "\\alpha"],
  [/\bBeta\b/g, "\\Beta"], [/\bbeta\b/g, "\\beta"],
  [/\bGamma\b/g, "\\Gamma"], [/\bgamma\b/g, "\\gamma"],
  [/\bDelta\b/g, "\\Delta"], [/\bdelta\b/g, "\\delta"],
  [/\bEpsilon\b/g, "\\epsilon"], [/\bepsilon\b/g, "\\epsilon"],
  [/\bZeta\b/g, "\\zeta"], [/\bzeta\b/g, "\\zeta"],
  [/\bEta\b/g, "\\eta"], [/\beta\b/g, "\\eta"],
  [/\bTheta\b/g, "\\Theta"], [/\btheta\b/g, "\\theta"],
  [/\bLambda\b/g, "\\Lambda"], [/\blambda\b/g, "\\lambda"],
  [/\bMu\b/g, "\\mu"], [/\bmu\b/g, "\\mu"],
  [/\bNu\b/g, "\\nu"], [/\bnu\b/g, "\\nu"],
  [/\bXi\b/g, "\\Xi"], [/\bxi\b/g, "\\xi"],
  [/\bPi\b/g, "\\Pi"], [/\bpi(?!xel|pe|lot|on)\b/g, "\\pi"],
  [/\bRho\b/g, "\\rho"], [/\brho\b/g, "\\rho"],
  [/\bSigma\b/g, "\\Sigma"], [/\bsigma\b/g, "\\sigma"],
  [/\bTau\b/g, "\\tau"], [/\btau\b/g, "\\tau"],
  [/\bUpsilon\b/g, "\\upsilon"], [/\bupsilon\b/g, "\\upsilon"],
  [/\bPhi\b/g, "\\Phi"], [/\bphi\b/g, "\\phi"],
  [/\bChi\b/g, "\\chi"], [/\bchi\b/g, "\\chi"],
  [/\bPsi\b/g, "\\Psi"], [/\bpsi\b/g, "\\psi"],
  [/\bOmega\b/g, "\\Omega"], [/\bomega\b/g, "\\omega"],
  // Infinity
  [/\b(?:infinity|inf|∞)\b/g, "\\infty"],
  // Partial derivative
  [/partial/g, "\\partial"],
  // nabla / del
  [/\bnabla\b/g, "\\nabla"],
  // Trig functions
  [/\bsin\b/g, "\\sin"], [/\bcos\b/g, "\\cos"], [/\btan\b/g, "\\tan"],
  [/\barcsin\b/g, "\\arcsin"], [/\barccos\b/g, "\\arccos"], [/\barctan\b/g, "\\arctan"],
  [/\bsinh\b/g, "\\sinh"], [/\bcosh\b/g, "\\cosh"], [/\btanh\b/g, "\\tanh"],
  // Log functions
  [/\bln\b/g, "\\ln"], [/\blog\b/g, "\\log"], [/\bexp\b/g, "\\exp"],
  // Max/Min
  [/\bmax\b/g, "\\max"], [/\bmin\b/g, "\\min"],
  // Matrix
  [/matrix\(([^)]+)\)/g, "\\begin{pmatrix}$1\\end{pmatrix}"],
  // Arrows
  [/->/g, "\\to"], [/=>/g, "\\Rightarrow"], [/<=>/g, "\\Leftrightarrow"],
  [/<-/g, "\\leftarrow"],
  // Relations
  [/>=/g, "\\geq"], [/<=/g, "\\leq"], [/!=/g, "\\neq"], [/~=/g, "\\approx"],
  [/<<\b/g, "\\ll"], [/>>\b/g, "\\gg"],
  // Operators
  [/\+-/g, "\\pm"], [/-\+/g, "\\mp"],
  [/\*/g, "\\cdot"],
  [/\bdot\b/g, "\\cdot"],
  [/\bcross\b/g, "\\times"],
  [/\btimes\b/g, "\\times"],
  // Sets
  [/\bin\b/g, "\\in"], [/\bnotin\b/g, "\\notin"], [/\bsubset\b/g, "\\subset"],
  [/\bunion\b/g, "\\cup"], [/\bintersect\b/g, "\\cap"],
  [/\bforall\b/g, "\\forall"], [/\bexists\b/g, "\\exists"],
  [/\bemptyset\b/g, "\\emptyset"],
  // Number sets
  [/\bRR\b/g, "\\mathbb{R}"], [/\bNN\b/g, "\\mathbb{N}"],
  [/\bZZ\b/g, "\\mathbb{Z}"], [/\bCC\b/g, "\\mathbb{C}"],
  // Hbar
  [/\bhbar\b/g, "\\hbar"],
];

/**
 * Convert a human-readable math expression to LaTeX
 */
export function convertToLatex(input: string): LatexConversionResult {
  let latex = input.trim();

  // Apply conversion rules in order
  for (const [pattern, replacement] of CONVERSION_RULES) {
    latex = latex.replace(pattern, replacement);
  }

  // Clean up stray backslash-eta duplication from beta rule
  latex = latex.replace(/\\\\eta/g, "\\eta");
  // Clean up double backslashes that aren't intentional line breaks
  latex = latex.replace(/\\\\([a-zA-Z])/g, "\\$1");
  // Normalize whitespace
  latex = latex.replace(/\s{2,}/g, " ").trim();

  return {
    latex,
    inline: `$${latex}$`,
    display: `$$${latex}$$`,
  };
}

/**
 * Get formulas filtered by category
 */
export function getFormulasByCategory(): Record<string, FormulaTemplate[]> {
  const grouped: Record<string, FormulaTemplate[]> = {};
  for (const f of FORMULA_CATALOG) {
    if (!grouped[f.category]) grouped[f.category] = [];
    grouped[f.category].push(f);
  }
  return grouped;
}
