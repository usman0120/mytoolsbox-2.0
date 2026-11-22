import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.molar-mass-calculator",
  "space": "calc",
  "category": "chemistry",
  "slug": "molar-mass-calculator",
  "name": "Molar Mass Calculator",
  "tagline": "Molar mass and composition of any chemical formula, including hydrates.",
  "keywords": [
    "molar mass calculator",
    "molecular weight calculator",
    "grams to moles",
    "percent composition",
    "formula mass"
  ],
  "synonyms": [
    "molecular weight calculator",
    "grams to moles",
    "percent composition"
  ],
  "jobs": [
    "molar mass calculator",
    "molecular weight calculator",
    "grams to moles"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Molar Mass Calculator – Molecular Weight and Composition",
    "description": "Calculate the molar mass of any chemical formula, including brackets and hydrates like CuSO4·5H2O, with mass percent by element and grams to moles. Free.",
    "h1": "Molar Mass Calculator"
  },
  "howTo": [
    "Type the chemical formula, e.g. Ca(OH)2.",
    "Optionally enter a mass to convert to moles.",
    "Read the molar mass and the composition table."
  ],
  "faq": [
    {
      "q": "Does capitalisation matter?",
      "a": "Yes. Co is cobalt but CO is carbon monoxide. Each element starts with a capital letter."
    },
    {
      "q": "How do I enter a hydrate?",
      "a": "Use a dot or ·, for example CuSO4·5H2O or CuSO4.5H2O."
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
    "calc.dilution-calculator",
    "calc.ideal-gas-law-calculator",
    "calc.scientific-calculator",
    "calc.unit-converter"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
