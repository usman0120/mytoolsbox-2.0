import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.fraction-calculator",
  "space": "calc",
  "category": "maths",
  "slug": "fraction-calculator",
  "name": "Fraction Calculator",
  "tagline": "Add, subtract, multiply and divide fractions and mixed numbers.",
  "keywords": [
    "fraction calculator",
    "adding fractions",
    "mixed numbers",
    "simplify fractions",
    "fraction to decimal"
  ],
  "synonyms": [
    "adding fractions",
    "mixed numbers",
    "simplify fractions"
  ],
  "jobs": [
    "fraction calculator",
    "adding fractions",
    "mixed numbers"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Fraction Calculator – Add, Subtract, Multiply, Divide",
    "description": "Add, subtract, multiply and divide fractions and mixed numbers, with the answer simplified and shown as a mixed number, decimal and percentage. Free, instant.",
    "h1": "Fraction Calculator"
  },
  "howTo": [
    "Type the first fraction, like 3/4 or 1 1/2.",
    "Choose the operation and type the second fraction.",
    "Read the simplified answer, mixed number and decimal."
  ],
  "faq": [
    {
      "q": "How do I enter a mixed number?",
      "a": "Type the whole number, a space, then the fraction: 2 1/3."
    },
    {
      "q": "Can I use decimals?",
      "a": "Yes. 0.25 is read as 1/4."
    },
    {
      "q": "Can I share or save the result?",
      "a": "Yes. Copy link opens the calculator with the same numbers. Signed-in users can save results to their Workspace."
    },
    {
      "q": "Is it free?",
      "a": "Yes. No sign-up, no limits, and the calculation runs in your browser."
    }
  ],
  "related": [
    "calc.percentage-calculator",
    "calc.scientific-calculator",
    "calc.statistics-calculator",
    "calc.matrix-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
