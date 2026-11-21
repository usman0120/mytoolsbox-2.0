import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.matrix-calculator",
  "space": "calc",
  "category": "maths",
  "slug": "matrix-calculator",
  "name": "Matrix Calculator",
  "tagline": "Matrix operations: add, multiply, inverse, det.",
  "keywords": [
    "matrix calculator",
    "matrix operations",
    "matrix inverse",
    "determinant calculator",
    "matrix math"
  ],
  "synonyms": [
    "matrix operations",
    "matrix inverse",
    "determinant calculator"
  ],
  "jobs": [
    "matrix addition",
    "matrix multiplication",
    "transpose"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Matrix Calculator – Add, Multiply, Inverse & Determinant",
    "description": "Perform matrix operations online: addition, subtraction, multiplication, transpose, determinant, and inverse. Free matrix calculator. Free, private, no sign-up.",
    "h1": "Matrix Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Matrix Calculator runs in your browser, so your files and text stay on your device."
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
    "study.equation-solver",
    "ai.math-solver",
    "calc.percentage-calculator"
  ],
  "legacySlugs": [
    "matrix-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
