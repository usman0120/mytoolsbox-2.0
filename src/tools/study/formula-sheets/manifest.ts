import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.formula-sheets",
  "space": "study",
  "category": "exam-prep",
  "slug": "formula-sheets",
  "name": "Formula Sheets",
  "tagline": "Maths, physics and chemistry formulas, searchable and printable.",
  "keywords": [
    "formula sheet",
    "maths formulas",
    "physics formulas",
    "chemistry formulas",
    "trigonometry identities"
  ],
  "synonyms": [
    "maths formulas",
    "physics formulas",
    "chemistry formulas"
  ],
  "jobs": [
    "formula sheet",
    "maths formulas",
    "physics formulas"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "legacySlugs": [],
  "status": "live",
  "offline": true,
  "seo": {
    "title": "Formula Sheets – Maths, Physics and Chemistry",
    "description": "Searchable, printable formula sheets for algebra, geometry, trigonometry, calculus, statistics, mechanics, electricity and chemistry. Copy any formula as LaTeX.",
    "h1": "Formula Sheets"
  },
  "howTo": [
    "Pick a subject, or search all sheets for a formula.",
    "Copy a formula as LaTeX with the copy button.",
    "Print the sheet to revise on paper."
  ],
  "faq": [
    {
      "q": "Which subjects are covered?",
      "a": "Algebra, geometry, trigonometry, calculus, statistics and probability, mechanics, electricity and waves, and chemistry."
    },
    {
      "q": "How do I print just the formulas?",
      "a": "Choose Print sheet. Only the formula sheet is printed, without the website around it."
    },
    {
      "q": "What is the copy button for?",
      "a": "It copies the formula's LaTeX source for documents, slides or the LaTeX Equation Editor."
    },
    {
      "q": "Is it free?",
      "a": "Yes. No sign-up and no limits."
    }
  ],
  "related": [
    "study.graphing-calculator",
    "study.periodic-table",
    "study.latex-equation-editor",
    "ai.math-solver"
  ]
};

export default manifest;
