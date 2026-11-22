import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.ideal-gas-law-calculator",
  "space": "calc",
  "category": "chemistry",
  "slug": "ideal-gas-law-calculator",
  "name": "Ideal Gas Law Calculator",
  "tagline": "Solve PV = nRT for pressure, volume, moles or temperature.",
  "keywords": [
    "ideal gas law calculator",
    "pv nrt calculator",
    "gas law calculator",
    "moles of gas"
  ],
  "synonyms": [
    "pv nrt calculator",
    "gas law calculator",
    "moles of gas"
  ],
  "jobs": [
    "ideal gas law calculator",
    "pv nrt calculator",
    "gas law calculator"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Ideal Gas Law Calculator – Solve PV = nRT",
    "description": "Solve the ideal gas law PV = nRT for pressure, volume, amount or temperature, with kPa, atm, bar, mmHg, psi, litres and °C or °F unit conversions. Free.",
    "h1": "Ideal Gas Law Calculator"
  },
  "howTo": [
    "Enter three of pressure, volume, amount and temperature.",
    "Choose units for each value.",
    "Read the missing value, shown in common units."
  ],
  "faq": [
    {
      "q": "What value of R is used?",
      "a": "8.314 L·kPa/(mol·K). Units are converted automatically."
    },
    {
      "q": "When is the ideal gas law inaccurate?",
      "a": "At very high pressures or low temperatures, where real gas molecules attract each other or take up space."
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
    "calc.molar-mass-calculator",
    "calc.dilution-calculator",
    "calc.unit-converter",
    "calc.scientific-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
