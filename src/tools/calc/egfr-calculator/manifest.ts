import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.egfr-calculator",
  "space": "calc",
  "category": "health",
  "slug": "egfr-calculator",
  "name": "eGFR Calculator",
  "tagline": "Kidney function estimate from creatinine (CKD-EPI 2021), with CKD stage.",
  "keywords": [
    "egfr calculator",
    "kidney function calculator",
    "ckd epi 2021",
    "creatinine clearance",
    "gfr calculator"
  ],
  "synonyms": [
    "kidney function calculator",
    "ckd epi 2021",
    "creatinine clearance"
  ],
  "jobs": [
    "egfr calculator",
    "kidney function calculator",
    "ckd epi 2021"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "eGFR Calculator – CKD-EPI 2021 Kidney Function",
    "description": "Estimate glomerular filtration rate from serum creatinine, age and sex with the race-free CKD-EPI 2021 equation, and see the KDIGO stage. For information only.",
    "h1": "eGFR Calculator"
  },
  "howTo": [
    "Enter serum creatinine in mg/dL or µmol/L from your lab report.",
    "Enter age and sex.",
    "Read the eGFR and the matching kidney function stage."
  ],
  "faq": [
    {
      "q": "Which equation is used?",
      "a": "The CKD-EPI 2021 creatinine equation, which does not use race and is recommended by U.S. kidney organisations."
    },
    {
      "q": "Can I diagnose kidney disease with this?",
      "a": "No. Diagnosis needs repeated tests over at least three months and a urine test, interpreted by a doctor."
    },
    {
      "q": "Is it valid for children?",
      "a": "No. It is for adults 18 and over."
    },
    {
      "q": "Can I share or save the result?",
      "a": "Yes. Copy link opens the calculator with the same numbers. Signed-in users can save results to their Workspace."
    }
  ],
  "related": [
    "calc.bmi-calculator",
    "calc.bmr-calculator",
    "calc.unit-converter",
    "calc.age-calculator"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
