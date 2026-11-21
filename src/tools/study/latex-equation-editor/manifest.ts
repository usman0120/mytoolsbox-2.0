import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.latex-equation-editor",
  "space": "study",
  "category": "maths",
  "slug": "latex-equation-editor",
  "name": "Equation to LaTeX Converter",
  "tagline": "Convert equations to LaTeX format.",
  "keywords": [
    "equation to latex",
    "math to latex",
    "latex converter",
    "math notation",
    "latex equation"
  ],
  "synonyms": [
    "math to latex",
    "latex converter",
    "math notation"
  ],
  "jobs": [
    "expression parsing",
    "latex templates",
    "greek letter support"
  ],
  "template": "text",
  "input": [],
  "output": [
    {
      "type": "text",
      "accept": [
        "text/plain"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Equation to LaTeX Converter – Math to LaTeX Online",
    "description": "Convert mathematical equations to LaTeX code. Supports fractions, integrals, matrices, and more. Free, private, no sign-up. Runs in your browser.",
    "h1": "Equation to LaTeX Converter"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "What equation formats are supported?",
      "a": "You can enter equations in plain text (e.g., x^2 + 2x + 1 = 0) and convert them to proper LaTeX."
    },
    {
      "q": "Can I use this for academic papers?",
      "a": "Absolutely! The generated LaTeX code is compatible with all major LaTeX editors and platforms like Overleaf."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Equation to LaTeX Converter runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "study.equation-solver",
    "calc.matrix-calculator",
    "calc.scientific-calculator",
    "study.citation-generator"
  ],
  "legacySlugs": [
    "equation-to-latex-converter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
