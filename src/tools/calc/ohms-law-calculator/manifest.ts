import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.ohms-law-calculator",
  "space": "calc",
  "category": "physics",
  "slug": "ohms-law-calculator",
  "name": "Ohm's Law Calculator",
  "tagline": "Find voltage, current, resistance or power from any two values.",
  "keywords": [
    "ohms law calculator",
    "voltage calculator",
    "current calculator",
    "resistance calculator",
    "power calculator watts"
  ],
  "synonyms": [
    "voltage calculator",
    "current calculator",
    "resistance calculator"
  ],
  "jobs": [
    "ohms law calculator",
    "voltage calculator",
    "current calculator"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Ohm's Law Calculator – Voltage, Current, Resistance, Power",
    "description": "Enter any two of voltage, current, resistance and power to calculate the other two with Ohm's law and the power formula. Supports mV, mA, kΩ and kW units.",
    "h1": "Ohm's Law Calculator"
  },
  "howTo": [
    "Enter any two known values.",
    "Pick units such as mA or kΩ if needed.",
    "Read the other two values."
  ],
  "faq": [
    {
      "q": "What is Ohm's law?",
      "a": "Voltage equals current times resistance (V = IR). Combined with P = VI, any two values give the other two."
    },
    {
      "q": "Does it work for AC circuits?",
      "a": "For resistive loads, yes. Circuits with capacitors or motors need impedance and power factor."
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
    "calc.resistor-color-code-calculator",
    "calc.wire-gauge-calculator",
    "calc.unit-converter",
    "calc.scientific-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
