import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.projectile-motion-calculator",
  "space": "calc",
  "category": "physics",
  "slug": "projectile-motion-calculator",
  "name": "Projectile Motion Calculator",
  "tagline": "Range, flight time and maximum height, with the trajectory plotted.",
  "keywords": [
    "projectile motion calculator",
    "projectile range",
    "trajectory calculator",
    "time of flight",
    "maximum height"
  ],
  "synonyms": [
    "projectile range",
    "trajectory calculator",
    "time of flight"
  ],
  "jobs": [
    "projectile motion calculator",
    "projectile range",
    "trajectory calculator"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Projectile Motion Calculator – Range, Height, Trajectory",
    "description": "Calculate range, time of flight, maximum height and impact speed of a projectile from launch speed, angle and height, with the trajectory plotted. No air drag.",
    "h1": "Projectile Motion Calculator"
  },
  "howTo": [
    "Enter launch speed and angle.",
    "Add a launch height and choose the planet if needed.",
    "Read range, time and height, and see the path on the chart."
  ],
  "faq": [
    {
      "q": "Which angle gives the longest range?",
      "a": "45° on flat ground without air resistance. From a height, a slightly lower angle goes further."
    },
    {
      "q": "Is air resistance included?",
      "a": "No. Real balls fall shorter, especially at high speeds."
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
    "calc.kinematics-calculator",
    "calc.ohms-law-calculator",
    "calc.scientific-calculator",
    "calc.unit-converter"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
