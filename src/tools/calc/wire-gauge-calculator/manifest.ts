import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.wire-gauge-calculator",
  "space": "calc",
  "category": "engineering",
  "slug": "wire-gauge-calculator",
  "name": "Wire Gauge Calculator (AWG)",
  "tagline": "AWG to diameter, cross-section and resistance for copper or aluminium.",
  "keywords": [
    "wire gauge calculator",
    "awg to mm",
    "awg to mm2",
    "wire size chart",
    "cable resistance"
  ],
  "synonyms": [
    "awg to mm",
    "awg to mm2",
    "wire size chart"
  ],
  "jobs": [
    "wire gauge calculator",
    "awg to mm",
    "awg to mm2"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Wire Gauge Calculator – AWG to mm, mm² and Resistance",
    "description": "Convert American Wire Gauge sizes to diameter, cross-section in mm² and kcmil, and resistance per km for copper or aluminium, plus resistance of a cable run.",
    "h1": "Wire Gauge Calculator (AWG)"
  },
  "howTo": [
    "Choose the AWG size.",
    "Pick copper or aluminium and optionally a cable length.",
    "Read diameter, area and resistance."
  ],
  "faq": [
    {
      "q": "What current can a wire carry?",
      "a": "It depends on insulation, installation and temperature, so use your local electrical code's ampacity table."
    },
    {
      "q": "How do mm² sizes compare?",
      "a": "AWG 14 is about 2.08 mm², AWG 12 about 3.31 mm² and AWG 10 about 5.26 mm²."
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
    "calc.ohms-law-calculator",
    "calc.resistor-color-code-calculator",
    "calc.unit-converter",
    "calc.concrete-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
