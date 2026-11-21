import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "study.gpa-calculator",
  "space": "study",
  "category": "grades",
  "slug": "gpa-calculator",
  "name": "GPA Calculator",
  "tagline": "Calculate GPA and CGPA.",
  "keywords": [
    "gpa calculator",
    "cgpa",
    "grade calculator",
    "gpa"
  ],
  "synonyms": [
    "cgpa",
    "grade calculator",
    "gpa"
  ],
  "jobs": [
    "weighted/unweighted",
    "multiple semesters",
    "cgpa calculation"
  ],
  "template": "calculator",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "GPA Calculator – Calculate Your Grade Point Average",
    "description": "Calculate your GPA and CGPA. Support for weighted/unweighted grades and multiple grading scales. Free, private, no sign-up. Runs in your browser.",
    "h1": "GPA Calculator"
  },
  "howTo": [
    "Enter your values.",
    "Read the result and how it was worked out.",
    "Change any value to compare."
  ],
  "faq": [
    {
      "q": "Is my data uploaded?",
      "a": "No. GPA Calculator runs in your browser, so your files and text stay on your device."
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
    "calc.age-calculator",
    "study.citation-generator",
    "study.equation-solver"
  ],
  "legacySlugs": [
    "gpa-calculator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
