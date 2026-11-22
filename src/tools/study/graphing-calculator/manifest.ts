import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.graphing-calculator",
  "space": "study",
  "category": "maths",
  "slug": "graphing-calculator",
  "name": "Graphing Calculator",
  "tagline": "Plot functions, find roots and intersections, and trace values.",
  "keywords": [
    "graphing calculator",
    "graph plotter",
    "plot function online",
    "function grapher",
    "graph y = f(x)"
  ],
  "synonyms": [
    "graph plotter",
    "plot function online",
    "function grapher"
  ],
  "jobs": [
    "graphing calculator",
    "graph plotter",
    "plot function online"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "legacySlugs": [],
  "status": "live",
  "offline": true,
  "seo": {
    "title": "Graphing Calculator – Plot Functions Online, Free",
    "description": "Plot up to six functions, then pan, zoom and trace values. Finds roots, y-intercepts and intersections in view. Download the graph as PNG. Free, no sign-up.",
    "h1": "Graphing Calculator"
  },
  "howTo": [
    "Type a function such as x^2 - 4 or 2sin(x).",
    "Add more functions to compare them; drag to move and scroll to zoom.",
    "Read roots and intersections from the list, or hover to trace values."
  ],
  "faq": [
    {
      "q": "What can I type?",
      "a": "Expressions in x with + − × ÷ and ^, brackets, sqrt, sin, cos, tan and their inverses, ln, log, abs (or |x|), pi and e. Write 2x or 3(x+1) without a multiplication sign."
    },
    {
      "q": "How are roots found?",
      "a": "The calculator samples each function across the visible range and refines every sign change, skipping vertical asymptotes. Zoom in to find roots outside the view."
    },
    {
      "q": "Can I share a graph?",
      "a": "Yes. The page address updates with your functions, so copying it shares the same graph."
    },
    {
      "q": "Does it work offline?",
      "a": "Yes. Everything runs in your browser once the page has loaded."
    },
    {
      "q": "Is it free?",
      "a": "Yes. No sign-up and no limits."
    }
  ],
  "related": [
    "study.equation-solver",
    "ai.math-solver",
    "calc.scientific-calculator",
    "study.formula-sheets"
  ]
};

export default manifest;
