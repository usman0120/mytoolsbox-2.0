import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "calc.statistics-calculator",
  "space": "calc",
  "category": "maths",
  "slug": "statistics-calculator",
  "name": "Statistics Calculator",
  "tagline": "Mean, median, mode, variance, histogram.",
  "keywords": [
    "statistics calculator",
    "mean calculator",
    "standard deviation",
    "variance calculator",
    "data analysis"
  ],
  "synonyms": [
    "mean calculator",
    "standard deviation",
    "variance calculator"
  ],
  "jobs": [
    "mean, median, mode",
    "variance & std dev",
    "quartiles & iqr"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Statistics Calculator – Mean, Median, Variance & More",
    "description": "Calculate comprehensive statistics: mean, median, mode, variance, standard deviation, quartiles, and histogram. Free, private, no sign-up. Runs in your browser.",
    "h1": "Statistics Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. Statistics Calculator runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    },
    {
      "q": "Does it work on my phone?",
      "a": "Yes. It works in any modern browser on phones, tablets and computers."
    },
    {
      "q": "Does it work offline?",
      "a": "Once the page has loaded, the tool keeps working without an internet connection."
    }
  ],
  "related": [
    "calc.percentage-calculator",
    "calc.scientific-calculator",
    "ai.math-solver",
    "calc.matrix-calculator"
  ],
  "legacySlugs": [
    "statistics-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
