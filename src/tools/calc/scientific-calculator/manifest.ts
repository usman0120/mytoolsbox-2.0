import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.scientific-calculator",
  "space": "calc",
  "category": "maths",
  "slug": "scientific-calculator",
  "name": "Scientific Calculator",
  "tagline": "Advanced calculator with trig, log, and more.",
  "keywords": [
    "scientific calculator",
    "trig calculator",
    "log calculator",
    "advanced calculator",
    "math calculator"
  ],
  "synonyms": [
    "trig calculator",
    "log calculator",
    "advanced calculator"
  ],
  "jobs": [
    "trig functions",
    "logarithms",
    "power & roots"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Scientific Calculator – Trig, Log, Power Functions",
    "description": "Advanced scientific calculator with sin, cos, tan, log, ln, sqrt, powers, and factorial. Supports degrees and radians. Free, private, no sign-up.",
    "h1": "Scientific Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Scientific Calculator runs in your browser, so your files and text stay on your device."
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
    "calc.percentage-calculator",
    "study.gpa-calculator",
    "ai.math-solver",
    "calc.matrix-calculator"
  ],
  "legacySlugs": [
    "scientific-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
