import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "dev.json-formatter",
  "space": "dev",
  "category": "format-validate",
  "slug": "json-formatter",
  "name": "JSON Formatter",
  "tagline": "Pretty-print, validate, minify and repair JSON, or convert it to YAML or CSV.",
  "keywords": [
    "json formatter",
    "format json",
    "json beautifier",
    "json validator"
  ],
  "synonyms": [
    "format json",
    "json beautifier",
    "json validator"
  ],
  "jobs": [
    "format json",
    "validate json",
    "tree view"
  ],
  "template": "file",
  "input": [
    {
      "type": "json",
      "accept": [
        "application/json"
      ]
    }
  ],
  "output": [
    {
      "type": "json",
      "accept": [
        "application/json"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "JSON Formatter & Validator – Beautify, Minify & Repair",
    "description": "Format, validate and minify JSON with clear error messages. Sort keys, repair common mistakes, or convert to YAML or CSV. Free, private; data stays local.",
    "h1": "Format and validate JSON"
  },
  "howTo": [
    "Paste JSON or open a .json file.",
    "Choose format, minify, sort keys or repair.",
    "Copy or download the result."
  ],
  "faq": [
    {
      "q": "Where does the error message point?",
      "a": "Invalid JSON shows the parser's message with the position of the problem, so you can find the missing comma or quote quickly."
    },
    {
      "q": "What does Repair fix?",
      "a": "Common slips such as trailing commas, single quotes and unquoted keys. Always review repaired output before using it."
    },
    {
      "q": "Is it safe to paste API responses or tokens?",
      "a": "Yes. Nothing you paste is sent anywhere; formatting happens in your browser."
    },
    {
      "q": "Can I convert JSON to CSV?",
      "a": "Yes, for arrays of flat objects. Nested values are written as JSON text in the cell."
    }
  ],
  "related": [
    "dev.json-validator",
    "dev.css-formatter",
    "dev.diff-checker",
    "dev.html-formatter"
  ],
  "legacySlugs": [
    "json-formatter"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
