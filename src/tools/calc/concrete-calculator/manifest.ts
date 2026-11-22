import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.concrete-calculator",
  "space": "calc",
  "category": "engineering",
  "slug": "concrete-calculator",
  "name": "Concrete Calculator",
  "tagline": "Cement bags, sand and aggregate for a slab or footing by mix ratio.",
  "keywords": [
    "concrete calculator",
    "cement calculator",
    "cement bags calculator",
    "concrete mix ratio",
    "sand and crush calculator"
  ],
  "synonyms": [
    "cement calculator",
    "cement bags calculator",
    "concrete mix ratio"
  ],
  "jobs": [
    "concrete calculator",
    "cement calculator",
    "cement bags calculator"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Concrete Calculator – Cement Bags, Sand and Aggregate",
    "description": "Estimate concrete volume, 50 kg cement bags, sand and aggregate for a slab or footing from its size and mix ratio such as 1:2:4, with wastage. Metric or feet.",
    "h1": "Concrete Calculator"
  },
  "howTo": [
    "Enter length, width and thickness in metres, feet or inches.",
    "Pick the mix ratio and wastage.",
    "Read cement bags, sand, aggregate and water."
  ],
  "faq": [
    {
      "q": "Why multiply by 1.54?",
      "a": "Dry materials shrink when mixed with water and fill voids, so about 54% more dry volume is needed than the finished concrete."
    },
    {
      "q": "Which mix should I use?",
      "a": "1:1.5:3 for columns and beams, 1:2:4 for floors and light slabs, 1:3:6 for foundations. Follow your engineer for structural work."
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
    "calc.unit-converter",
    "calc.land-area-converter",
    "calc.wire-gauge-calculator",
    "calc.percentage-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
