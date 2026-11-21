import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "work.word-counter",
  "space": "work",
  "category": "text",
  "slug": "word-counter",
  "name": "Word Counter",
  "tagline": "Words, characters, sentences, reading time and keyword density as you type.",
  "keywords": [
    "word counter",
    "count words",
    "character count",
    "word count"
  ],
  "synonyms": [
    "count words",
    "character count",
    "word count"
  ],
  "jobs": [
    "word count",
    "character count",
    "sentence count"
  ],
  "template": "text",
  "input": [],
  "output": [],
  "engine": "client",
  "seo": {
    "title": "Word Counter – Characters, Reading Time & Keywords",
    "description": "Count words, characters, sentences and paragraphs as you type. See reading and speaking time, keyword density and social post limits. Free and private.",
    "h1": "Word and character counter"
  },
  "howTo": [
    "Paste or type your text.",
    "Watch the counts update instantly.",
    "Check limits for social posts and copy your text."
  ],
  "faq": [
    {
      "q": "Does it count characters with spaces?",
      "a": "Yes. It shows characters with and without spaces, which most forms and essay limits specify."
    },
    {
      "q": "How is reading time estimated?",
      "a": "At about 200 words per minute for reading and 130 for speaking, the averages used by most publishers."
    },
    {
      "q": "Is my text saved or sent anywhere?",
      "a": "No. Counting happens in your browser and nothing is uploaded."
    },
    {
      "q": "Can I check social media limits?",
      "a": "Yes. The counter shows how your text fits common limits such as captions and short posts."
    }
  ],
  "related": [
    "work.case-converter",
    "work.text-cleaner",
    "work.grammar-checker",
    "work.paraphraser"
  ],
  "legacySlugs": [
    "word-counter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
