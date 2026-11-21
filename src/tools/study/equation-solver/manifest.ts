import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.equation-solver",
  "space": "study",
  "category": "maths",
  "slug": "equation-solver",
  "name": "Equation Solver",
  "tagline": "Solve equations with step-by-step solutions.",
  "keywords": [
    "equation solver",
    "solve equations",
    "quadratic solver",
    "linear equation",
    "math solver"
  ],
  "synonyms": [
    "solve equations",
    "quadratic solver",
    "linear equation"
  ],
  "jobs": [
    "linear equations",
    "quadratic equations",
    "cubic equations"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Equation Solver – Solve Linear, Quadratic & Cubic Equations",
    "description": "Solve equations step-by-step: linear, quadratic, cubic, and 2×2 systems. Get detailed solutions with explanations. online tool. Free, private, no sign-up.",
    "h1": "Equation Solver"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Equation Solver runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    },
    {
      "q": "Does it work on my phone?",
      "a": "Yes. It works in any modern browser on phones, tablets and computers."
    },
    {
      "q": "Does it work offline?",
      "a": "Once the page has loaded, the tool keeps working without an internet connection."
    }
  ],
  "related": [
    "calc.scientific-calculator",
    "calc.matrix-calculator",
    "ai.math-solver",
    "study.latex-equation-editor"
  ],
  "legacySlugs": [
    "equation-solver"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
