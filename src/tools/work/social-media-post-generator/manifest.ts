import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.social-media-post-generator",
  "space": "work",
  "category": "business-docs",
  "slug": "social-media-post-generator",
  "name": "Social Media Content Generator",
  "tagline": "Generate social media posts.",
  "keywords": [
    "social media content",
    "post generator",
    "social media posts",
    "hashtag generator",
    "content ideas"
  ],
  "synonyms": [
    "post generator",
    "social media posts",
    "hashtag generator"
  ],
  "jobs": [
    "multi-platform",
    "content types",
    "auto hashtags"
  ],
  "template": "ai",
  "input": [],
  "output": [
    {
      "type": "text",
      "accept": [
        "text/plain"
      ]
    }
  ],
  "engine": "ai",
  "aiTask": "general",
  "seo": {
    "title": "Social Media Content Generator – Create Posts Online",
    "description": "Generate engaging social media posts with relevant hashtags for Twitter, LinkedIn, Instagram, Facebook, and TikTok. Free daily AI allowance, no sign-up.",
    "h1": "Social Media Content Generator"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "Where is my text sent?",
      "a": "Social Media Content Generator sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
    },
    {
      "q": "Is it free?",
      "a": "Yes. AI features are free within a daily allowance: 10 requests a day without an account and 40 when you sign in."
    },
    {
      "q": "Can AI answers be wrong?",
      "a": "Yes. Treat answers as a helpful draft and check important facts before you rely on them."
    },
    {
      "q": "Does it work on my phone?",
      "a": "Yes. It works in any modern browser on phones, tablets and computers."
    }
  ],
  "related": [
    "work.business-name-generator",
    "work.proposal-generator",
    "work.case-converter",
    "work.contract-generator"
  ],
  "legacySlugs": [
    "social-media-content-generator"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
