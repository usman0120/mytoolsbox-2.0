import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.resistor-color-code-calculator",
  "space": "calc",
  "category": "engineering",
  "slug": "resistor-color-code-calculator",
  "name": "Resistor Color Code Calculator",
  "tagline": "Read 4- and 5-band resistor colours as ohms with tolerance.",
  "keywords": [
    "resistor color code",
    "resistor calculator",
    "resistor bands",
    "4 band resistor",
    "5 band resistor"
  ],
  "synonyms": [
    "resistor calculator",
    "resistor bands",
    "4 band resistor"
  ],
  "jobs": [
    "resistor color code",
    "resistor calculator",
    "resistor bands"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Resistor Color Code Calculator – 4 and 5 Band",
    "description": "Decode 4-band and 5-band resistor colour codes into resistance and tolerance, with the minimum and maximum value. Supports gold and silver multipliers. Free.",
    "h1": "Resistor Color Code Calculator"
  },
  "howTo": [
    "Pick 4 or 5 bands.",
    "Choose the colour of each band from left to right.",
    "Read the resistance and tolerance range."
  ],
  "faq": [
    {
      "q": "Which end do I read from?",
      "a": "Start from the end with bands grouped closer together; the tolerance band, often gold or silver, is on the right."
    },
    {
      "q": "What does a gold multiplier mean?",
      "a": "Multiply by 0.1, for resistors below 10 Ω."
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
    "calc.wire-gauge-calculator",
    "calc.unit-converter",
    "calc.scientific-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
