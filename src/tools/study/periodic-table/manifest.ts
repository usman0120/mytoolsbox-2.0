import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.periodic-table",
  "space": "study",
  "category": "exam-prep",
  "slug": "periodic-table",
  "name": "Periodic Table",
  "tagline": "All 118 elements with mass, group, block and electron configuration.",
  "keywords": [
    "periodic table",
    "interactive periodic table",
    "electron configuration",
    "atomic mass table",
    "element symbols"
  ],
  "synonyms": [
    "interactive periodic table",
    "electron configuration",
    "atomic mass table"
  ],
  "jobs": [
    "periodic table",
    "interactive periodic table",
    "electron configuration"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "legacySlugs": [],
  "status": "live",
  "offline": true,
  "seo": {
    "title": "Interactive Periodic Table – Mass and Configuration",
    "description": "Explore all 118 elements: atomic number and mass, group, period, block, category and electron configuration. Search by name or symbol. Free, works offline.",
    "h1": "Periodic Table"
  },
  "howTo": [
    "Click any element to see its details.",
    "Search by name, symbol or atomic number.",
    "Highlight a category, such as halogens or transition metals."
  ],
  "faq": [
    {
      "q": "Where do the atomic masses come from?",
      "a": "Standard atomic weights from IUPAC, rounded. For radioactive elements without a standard weight, the mass of the most stable known isotope is shown in brackets."
    },
    {
      "q": "Are electron configurations accurate?",
      "a": "They follow the aufbau order with the known ground-state exceptions, such as chromium and copper. Very heavy elements are predicted, not measured."
    },
    {
      "q": "Can I find the molar mass of a compound?",
      "a": "Yes. Use the link in the details panel to open the Molar Mass Calculator."
    },
    {
      "q": "Is it free?",
      "a": "Yes. No sign-up and no limits."
    }
  ],
  "related": [
    "calc.molar-mass-calculator",
    "study.formula-sheets",
    "study.flashcards",
    "calc.ideal-gas-law-calculator"
  ]
};

export default manifest;
