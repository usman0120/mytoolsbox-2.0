import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "ai.math-solver",
  "space": "ai",
  "category": "learn",
  "slug": "math-solver",
  "name": "AI Math Solver",
  "tagline": "AI-powered step-by-step math solver with graphs & OCR.",
  "keywords": [
    "math solver",
    "equation solver",
    "step by step math",
    "calculus solver",
    "algebra help"
  ],
  "synonyms": [
    "equation solver",
    "step by step math",
    "calculus solver"
  ],
  "jobs": [
    "step-by-step solutions",
    "photo/ocr equation input",
    "interactive graph plotting"
  ],
  "template": "ai",
  "input": [],
  "output": [],
  "engine": "ai",
  "aiTask": "general",
  "seo": {
    "title": "AI Math Solver – Step-by-Step Solutions",
    "description": "Solve math problems with AI-powered step-by-step explanations. Algebra, calculus, trigonometry, and more. Works on any device. Works on any device.",
    "h1": "AI Math Solver"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "What math topics are supported?",
      "a": "Algebra, calculus, trigonometry, linear algebra, statistics, arithmetic, and more. Our engine handles quadratic equations, derivatives, integrals, trigonometric equations, probability distributions, and systems of equations."
    },
    {
      "q": "Can I upload a photo of my math problem?",
      "a": "Yes! Use the image upload feature to snap a photo of handwritten or printed equations. The OCR system will help extract the equation for solving."
    },
    {
      "q": "Does it show all steps?",
      "a": "Absolutely! Every solution includes detailed step-by-step explanations with animated reveal, so you can follow the logic and learn as you solve."
    },
    {
      "q": "Does it include graphs?",
      "a": "Yes! For functions and equations, an interactive graph is plotted showing key points like roots, vertices, and intersections."
    },
    {
      "q": "Can I practice similar problems?",
      "a": "Yes! Each solution comes with related concepts and practice questions at easy, medium, and hard difficulty levels."
    }
  ],
  "related": [
    "calc.percentage-calculator",
    "calc.unit-converter",
    "ai.notes-generator",
    "ai.research-assistant"
  ],
  "legacySlugs": [
    "math-solver"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
