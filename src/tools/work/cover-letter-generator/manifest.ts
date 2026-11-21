import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.cover-letter-generator",
  "space": "work",
  "category": "career",
  "slug": "cover-letter-generator",
  "name": "Cover Letter Generator",
  "tagline": "Generate tailored cover letters.",
  "keywords": [
    "cover letter generator",
    "cover letter maker",
    "job application letter",
    "cover letter template",
    "letter builder"
  ],
  "synonyms": [
    "cover letter maker",
    "job application letter",
    "cover letter template"
  ],
  "jobs": [
    "4 tone templates",
    "placeholder replacement",
    "professional formatting"
  ],
  "template": "text",
  "input": [],
  "output": [
    {
      "type": "text",
      "accept": [
        "text/plain"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Cover Letter Generator – Tailored Cover Letters",
    "description": "Generate tailored cover letters with professional tone templates. Fill in your details and get a polished cover letter instantly. Free, private, no sign-up.",
    "h1": "Cover Letter Generator"
  },
  "howTo": [
    "Paste or type your input.",
    "Pick the options you need.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "What tone templates are available?",
      "a": "Choose from Professional, Enthusiastic, Concise, and Creative tones to match the job you're applying for."
    },
    {
      "q": "Can I customize the generated letter?",
      "a": "Yes! The generated letter is fully editable before you download or copy it."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. Cover Letter Generator runs in your browser, so your files and text stay on your device."
    },
    {
      "q": "Is it free?",
      "a": "Yes. There is no sign-up, no watermark and no daily limit."
    }
  ],
  "related": [
    "work.resume-builder",
    "work.business-name-generator",
    "work.case-converter",
    "work.contract-generator"
  ],
  "legacySlugs": [
    "cover-letter-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
