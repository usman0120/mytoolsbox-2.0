import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.dilution-calculator",
  "space": "calc",
  "category": "chemistry",
  "slug": "dilution-calculator",
  "name": "Dilution Calculator",
  "tagline": "Solve C₁V₁ = C₂V₂ for any missing value.",
  "keywords": [
    "dilution calculator",
    "c1v1 c2v2",
    "stock solution",
    "molarity dilution",
    "how to dilute a solution"
  ],
  "synonyms": [
    "c1v1 c2v2",
    "stock solution",
    "molarity dilution"
  ],
  "jobs": [
    "dilution calculator",
    "c1v1 c2v2",
    "stock solution"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Dilution Calculator – C1V1 = C2V2 Solver",
    "description": "Work out how much stock solution and solvent to mix with C1V1 = C2V2: enter three of the four values in M, mM, µM or % and mL, L or µL. Free and instant.",
    "h1": "Dilution Calculator"
  },
  "howTo": [
    "Enter three of: stock concentration, stock volume, final concentration, final volume.",
    "Leave the value to find blank.",
    "Read how much stock to take and how much solvent to add."
  ],
  "faq": [
    {
      "q": "Can I mix units?",
      "a": "Volumes in any listed unit are converted. Use the same kind of concentration (molar or percent) for both C₁ and C₂."
    },
    {
      "q": "Why does it refuse my values?",
      "a": "The final concentration can't be higher than the stock in a dilution."
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
    "calc.ideal-gas-law-calculator",
    "calc.unit-converter",
    "calc.percentage-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
