// Formula sheets (KaTeX source). Original compilation of standard results.

export interface Formula {
  name: string;
  tex: string;
  note?: string;
}
export interface Sheet {
  id: string;
  title: string;
  sections: { title: string; items: Formula[] }[];
}

export const SHEETS: Sheet[] = [
  {
    id: "algebra",
    title: "Algebra",
    sections: [
      {
        title: "Identities",
        items: [
          { name: "Square of a sum", tex: "(a+b)^2 = a^2 + 2ab + b^2" },
          { name: "Square of a difference", tex: "(a-b)^2 = a^2 - 2ab + b^2" },
          { name: "Difference of squares", tex: "a^2 - b^2 = (a+b)(a-b)" },
          { name: "Cube of a sum", tex: "(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3" },
          { name: "Sum and difference of cubes", tex: "a^3 \\pm b^3 = (a \\pm b)(a^2 \\mp ab + b^2)" },
        ],
      },
      {
        title: "Equations",
        items: [
          { name: "Quadratic formula", tex: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}", note: "For ax² + bx + c = 0" },
          { name: "Discriminant", tex: "\\Delta = b^2 - 4ac", note: "Δ > 0: two real roots; Δ = 0: one; Δ < 0: none" },
          { name: "Sum and product of roots", tex: "x_1 + x_2 = -\\frac{b}{a}, \\quad x_1x_2 = \\frac{c}{a}" },
          { name: "Slope of a line", tex: "m = \\frac{y_2 - y_1}{x_2 - x_1}" },
          { name: "Point-slope form", tex: "y - y_1 = m(x - x_1)" },
        ],
      },
      {
        title: "Exponents and logarithms",
        items: [
          { name: "Product and quotient", tex: "a^m a^n = a^{m+n}, \\quad \\frac{a^m}{a^n} = a^{m-n}" },
          { name: "Power", tex: "(a^m)^n = a^{mn}, \\quad a^{-n} = \\frac{1}{a^n}" },
          { name: "Log rules", tex: "\\log(xy) = \\log x + \\log y, \\quad \\log\\frac{x}{y} = \\log x - \\log y" },
          { name: "Log of a power", tex: "\\log x^n = n\\log x" },
          { name: "Change of base", tex: "\\log_b x = \\frac{\\ln x}{\\ln b}" },
        ],
      },
      {
        title: "Sequences",
        items: [
          { name: "Arithmetic nth term", tex: "a_n = a_1 + (n-1)d" },
          { name: "Arithmetic sum", tex: "S_n = \\frac{n}{2}(a_1 + a_n)" },
          { name: "Geometric nth term", tex: "a_n = a_1 r^{n-1}" },
          { name: "Geometric sum", tex: "S_n = a_1\\frac{1-r^n}{1-r}, \\quad S_\\infty = \\frac{a_1}{1-r} \\; (|r|<1)" },
        ],
      },
    ],
  },
  {
    id: "geometry",
    title: "Geometry",
    sections: [
      {
        title: "Area",
        items: [
          { name: "Rectangle", tex: "A = lw" },
          { name: "Triangle", tex: "A = \\tfrac12 bh = \\tfrac12 ab\\sin C" },
          { name: "Heron's formula", tex: "A = \\sqrt{s(s-a)(s-b)(s-c)}, \\quad s = \\tfrac{a+b+c}{2}" },
          { name: "Trapezium", tex: "A = \\tfrac12 (a+b)h" },
          { name: "Circle", tex: "A = \\pi r^2, \\quad C = 2\\pi r" },
          { name: "Sector", tex: "A = \\tfrac12 r^2\\theta, \\quad s = r\\theta \\;(\\theta \\text{ in radians})" },
        ],
      },
      {
        title: "Volume and surface",
        items: [
          { name: "Cuboid", tex: "V = lwh, \\quad S = 2(lw + lh + wh)" },
          { name: "Cylinder", tex: "V = \\pi r^2 h, \\quad S = 2\\pi r(r+h)" },
          { name: "Cone", tex: "V = \\tfrac13 \\pi r^2 h, \\quad S = \\pi r(r + l)" },
          { name: "Sphere", tex: "V = \\tfrac43 \\pi r^3, \\quad S = 4\\pi r^2" },
          { name: "Pyramid", tex: "V = \\tfrac13 Bh" },
        ],
      },
      {
        title: "Coordinate geometry",
        items: [
          { name: "Pythagoras", tex: "a^2 + b^2 = c^2" },
          { name: "Distance", tex: "d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}" },
          { name: "Midpoint", tex: "M = \\left(\\tfrac{x_1+x_2}{2}, \\tfrac{y_1+y_2}{2}\\right)" },
          { name: "Circle equation", tex: "(x-h)^2 + (y-k)^2 = r^2" },
          { name: "Sum of interior angles", tex: "(n-2) \\times 180^\\circ" },
        ],
      },
    ],
  },
  {
    id: "trigonometry",
    title: "Trigonometry",
    sections: [
      {
        title: "Basics",
        items: [
          { name: "Ratios", tex: "\\sin\\theta = \\tfrac{\\text{opp}}{\\text{hyp}}, \\; \\cos\\theta = \\tfrac{\\text{adj}}{\\text{hyp}}, \\; \\tan\\theta = \\tfrac{\\text{opp}}{\\text{adj}}" },
          { name: "Pythagorean identity", tex: "\\sin^2\\theta + \\cos^2\\theta = 1" },
          { name: "Related identities", tex: "1 + \\tan^2\\theta = \\sec^2\\theta, \\quad 1 + \\cot^2\\theta = \\csc^2\\theta" },
          { name: "Degrees and radians", tex: "\\pi \\text{ rad} = 180^\\circ" },
        ],
      },
      {
        title: "Compound and double angles",
        items: [
          { name: "Sine of a sum", tex: "\\sin(A \\pm B) = \\sin A\\cos B \\pm \\cos A\\sin B" },
          { name: "Cosine of a sum", tex: "\\cos(A \\pm B) = \\cos A\\cos B \\mp \\sin A\\sin B" },
          { name: "Tangent of a sum", tex: "\\tan(A \\pm B) = \\frac{\\tan A \\pm \\tan B}{1 \\mp \\tan A\\tan B}" },
          { name: "Double angle", tex: "\\sin 2A = 2\\sin A\\cos A, \\quad \\cos 2A = \\cos^2 A - \\sin^2 A" },
        ],
      },
      {
        title: "Triangles",
        items: [
          { name: "Sine rule", tex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}" },
          { name: "Cosine rule", tex: "c^2 = a^2 + b^2 - 2ab\\cos C" },
        ],
      },
    ],
  },
  {
    id: "calculus",
    title: "Calculus",
    sections: [
      {
        title: "Derivatives",
        items: [
          { name: "Power rule", tex: "\\frac{d}{dx}x^n = nx^{n-1}" },
          { name: "Product rule", tex: "(uv)' = u'v + uv'" },
          { name: "Quotient rule", tex: "\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}" },
          { name: "Chain rule", tex: "\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx}" },
          { name: "Exponential and log", tex: "\\frac{d}{dx}e^x = e^x, \\quad \\frac{d}{dx}\\ln x = \\frac{1}{x}" },
          { name: "Trig", tex: "(\\sin x)' = \\cos x, \\; (\\cos x)' = -\\sin x, \\; (\\tan x)' = \\sec^2 x" },
        ],
      },
      {
        title: "Integrals",
        items: [
          { name: "Power rule", tex: "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\ne -1)" },
          { name: "Reciprocal", tex: "\\int \\frac{1}{x}\\,dx = \\ln|x| + C" },
          { name: "Exponential", tex: "\\int e^{ax}\\,dx = \\frac{1}{a}e^{ax} + C" },
          { name: "Trig", tex: "\\int \\sin x\\,dx = -\\cos x + C, \\quad \\int \\cos x\\,dx = \\sin x + C" },
          { name: "By parts", tex: "\\int u\\,dv = uv - \\int v\\,du" },
          { name: "Fundamental theorem", tex: "\\int_a^b f(x)\\,dx = F(b) - F(a)" },
        ],
      },
      {
        title: "Limits and series",
        items: [
          { name: "Standard limit", tex: "\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1" },
          { name: "Definition of e", tex: "e = \\lim_{n\\to\\infty}\\left(1 + \\frac1n\\right)^n" },
          { name: "Taylor series", tex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n" },
        ],
      },
    ],
  },
  {
    id: "statistics",
    title: "Statistics and probability",
    sections: [
      {
        title: "Descriptive",
        items: [
          { name: "Mean", tex: "\\bar{x} = \\frac{1}{n}\\sum x_i" },
          { name: "Sample variance", tex: "s^2 = \\frac{1}{n-1}\\sum (x_i - \\bar{x})^2" },
          { name: "Standard score", tex: "z = \\frac{x - \\mu}{\\sigma}" },
        ],
      },
      {
        title: "Probability",
        items: [
          { name: "Addition rule", tex: "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)" },
          { name: "Conditional", tex: "P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}" },
          { name: "Bayes' theorem", tex: "P(A \\mid B) = \\frac{P(B \\mid A)P(A)}{P(B)}" },
          { name: "Permutations and combinations", tex: "^nP_r = \\frac{n!}{(n-r)!}, \\quad \\binom{n}{r} = \\frac{n!}{r!(n-r)!}" },
          { name: "Binomial", tex: "P(X=k) = \\binom{n}{k}p^k(1-p)^{n-k}" },
        ],
      },
    ],
  },
  {
    id: "mechanics",
    title: "Physics: mechanics",
    sections: [
      {
        title: "Motion",
        items: [
          { name: "Equations of motion", tex: "v = u + at, \\quad s = ut + \\tfrac12 at^2, \\quad v^2 = u^2 + 2as" },
          { name: "Average speed", tex: "\\bar{v} = \\frac{\\Delta s}{\\Delta t}" },
          { name: "Projectile range", tex: "R = \\frac{v^2 \\sin 2\\theta}{g}" },
          { name: "Circular motion", tex: "a_c = \\frac{v^2}{r} = \\omega^2 r" },
        ],
      },
      {
        title: "Forces and energy",
        items: [
          { name: "Newton's second law", tex: "F = ma" },
          { name: "Weight", tex: "W = mg" },
          { name: "Momentum and impulse", tex: "p = mv, \\quad F\\Delta t = \\Delta p" },
          { name: "Work and power", tex: "W = Fd\\cos\\theta, \\quad P = \\frac{W}{t}" },
          { name: "Kinetic and potential energy", tex: "E_k = \\tfrac12 mv^2, \\quad E_p = mgh" },
          { name: "Gravitation", tex: "F = G\\frac{m_1 m_2}{r^2}" },
          { name: "Hooke's law", tex: "F = -kx" },
          { name: "Pressure", tex: "P = \\frac{F}{A}, \\quad P = \\rho g h" },
        ],
      },
    ],
  },
  {
    id: "electricity",
    title: "Physics: electricity and waves",
    sections: [
      {
        title: "Circuits",
        items: [
          { name: "Ohm's law", tex: "V = IR" },
          { name: "Power", tex: "P = VI = I^2R = \\frac{V^2}{R}" },
          { name: "Resistors in series", tex: "R = R_1 + R_2 + \\cdots" },
          { name: "Resistors in parallel", tex: "\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\cdots" },
          { name: "Charge", tex: "Q = It" },
          { name: "Coulomb's law", tex: "F = k\\frac{q_1 q_2}{r^2}" },
        ],
      },
      {
        title: "Waves",
        items: [
          { name: "Wave speed", tex: "v = f\\lambda" },
          { name: "Period", tex: "T = \\frac{1}{f}" },
          { name: "Snell's law", tex: "n_1\\sin\\theta_1 = n_2\\sin\\theta_2" },
          { name: "Photon energy", tex: "E = hf = \\frac{hc}{\\lambda}" },
        ],
      },
    ],
  },
  {
    id: "chemistry",
    title: "Chemistry",
    sections: [
      {
        title: "Quantities",
        items: [
          { name: "Moles", tex: "n = \\frac{m}{M}" },
          { name: "Concentration", tex: "c = \\frac{n}{V}" },
          { name: "Dilution", tex: "C_1V_1 = C_2V_2" },
          { name: "Number of particles", tex: "N = nN_A, \\quad N_A = 6.022 \\times 10^{23}\\,\\text{mol}^{-1}" },
        ],
      },
      {
        title: "Gases and solutions",
        items: [
          { name: "Ideal gas law", tex: "PV = nRT" },
          { name: "Combined gas law", tex: "\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}" },
          { name: "pH", tex: "\\text{pH} = -\\log[\\text{H}^+], \\quad \\text{pH} + \\text{pOH} = 14" },
          { name: "Percent yield", tex: "\\%\\,\\text{yield} = \\frac{\\text{actual}}{\\text{theoretical}} \\times 100" },
        ],
      },
    ],
  },
];
