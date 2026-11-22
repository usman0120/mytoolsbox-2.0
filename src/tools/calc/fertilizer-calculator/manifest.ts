import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.fertilizer-calculator",
  "space": "calc",
  "category": "agriculture",
  "slug": "fertilizer-calculator",
  "name": "Fertilizer Calculator",
  "tagline": "Turn N, P and K needs into bags of DAP, urea and potash.",
  "keywords": [
    "fertilizer calculator",
    "urea dap calculator",
    "npk calculator",
    "fertilizer per acre",
    "khad calculator"
  ],
  "synonyms": [
    "urea dap calculator",
    "npk calculator",
    "fertilizer per acre"
  ],
  "jobs": [
    "fertilizer calculator",
    "urea dap calculator",
    "npk calculator"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Fertilizer Calculator – DAP, Urea and Potash Bags",
    "description": "Convert nitrogen, phosphorus and potash needs per acre or hectare into kilograms and bags of DAP, urea and SOP or MOP for your field size. Free for farmers.",
    "h1": "Fertilizer Calculator"
  },
  "howTo": [
    "Enter the nutrients your crop needs, from a soil test or extension advice.",
    "Enter the field area and pick SOP or MOP.",
    "Read kilograms and bags of each product."
  ],
  "faq": [
    {
      "q": "Why is DAP calculated first?",
      "a": "DAP supplies phosphorus and some nitrogen, so the urea amount is reduced by the nitrogen DAP already provides."
    },
    {
      "q": "Where do the nutrient numbers come from?",
      "a": "A soil test or your local agriculture extension recommendation for the crop and variety."
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
    "calc.land-area-converter",
    "ai.farm-advisor",
    "calc.percentage-calculator",
    "calc.unit-converter"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
