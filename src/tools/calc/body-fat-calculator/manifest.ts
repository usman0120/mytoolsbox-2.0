import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.body-fat-calculator",
  "space": "calc",
  "category": "health",
  "slug": "body-fat-calculator",
  "name": "Body Fat Calculator",
  "tagline": "Estimate body fat percentage with a tape measure (U.S. Navy method).",
  "keywords": [
    "body fat calculator",
    "body fat percentage",
    "navy body fat",
    "tape measure body fat"
  ],
  "synonyms": [
    "body fat percentage",
    "navy body fat",
    "tape measure body fat"
  ],
  "jobs": [
    "body fat calculator",
    "body fat percentage",
    "navy body fat"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Body Fat Calculator – U.S. Navy Tape Measure Method",
    "description": "Estimate your body fat percentage from height, neck, waist and hip measurements using the U.S. Navy method, with the fitness category. Free and private.",
    "h1": "Body Fat Calculator"
  },
  "howTo": [
    "Measure your neck, waist and (for women) hips with a soft tape.",
    "Enter the measurements and your height.",
    "Read your body fat percentage and category."
  ],
  "faq": [
    {
      "q": "How do I measure correctly?",
      "a": "Neck just below the larynx; waist at the navel for men and at the narrowest point for women; hips at the widest point. Keep the tape level and snug, not tight."
    },
    {
      "q": "How accurate is the Navy method?",
      "a": "Usually within 3–4 percentage points of lab methods such as DEXA, which is good enough to track changes over time."
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
    "calc.bmi-calculator",
    "calc.bmr-calculator",
    "calc.ideal-weight-calculator",
    "ai.fitness-coach"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
