import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.kinematics-calculator",
  "space": "calc",
  "category": "physics",
  "slug": "kinematics-calculator",
  "name": "Kinematics Calculator (SUVAT)",
  "tagline": "Solve constant-acceleration motion from any three of s, u, v, a, t.",
  "keywords": [
    "kinematics calculator",
    "suvat calculator",
    "equations of motion",
    "acceleration calculator",
    "physics motion calculator"
  ],
  "synonyms": [
    "suvat calculator",
    "equations of motion",
    "acceleration calculator"
  ],
  "jobs": [
    "kinematics calculator",
    "suvat calculator",
    "equations of motion"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Kinematics Calculator – SUVAT Equations of Motion",
    "description": "Solve constant-acceleration motion problems: enter any three of displacement, initial and final velocity, acceleration and time to find the rest. Free, instant.",
    "h1": "Kinematics Calculator (SUVAT)"
  },
  "howTo": [
    "Enter any three of s, u, v, a and t.",
    "Choose units like km/h or g where helpful.",
    "Read the remaining values."
  ],
  "faq": [
    {
      "q": "When can I use these equations?",
      "a": "Only when acceleration is constant, such as free fall without air resistance or steady braking."
    },
    {
      "q": "How do I show direction?",
      "a": "Pick a positive direction and use negative numbers for the opposite way, e.g. a = −9.81 m/s² for an upward throw."
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
    "calc.projectile-motion-calculator",
    "calc.ohms-law-calculator",
    "calc.unit-converter",
    "calc.scientific-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
