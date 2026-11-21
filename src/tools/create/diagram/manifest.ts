import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "create.diagram",
  "space": "create",
  "category": "diagrams",
  "slug": "diagram",
  "name": "AI Diagram Generator",
  "tagline": "AI-powered diagram creation with manual editing.",
  "keywords": [
    "ai diagram generator",
    "text to diagram",
    "flowchart generator",
    "mind map maker",
    "er diagram tool",
    "sequence diagram",
    "architecture diagram",
    "ai flowchart"
  ],
  "synonyms": [
    "text to diagram",
    "flowchart generator",
    "mind map maker"
  ],
  "jobs": [
    "ai-powered diagram generation from text",
    "5 diagram types: flowchart, mind map, er, sequence, architecture",
    "full manual editing after generation"
  ],
  "template": "ai",
  "input": [],
  "output": [
    {
      "type": "image",
      "accept": [
        "image/svg+xml"
      ]
    }
  ],
  "engine": "ai",
  "aiTask": "general",
  "seo": {
    "title": "AI Diagram Generator – Create Diagrams from Text",
    "description": "Generate flowcharts, mind maps, ER diagrams, sequence diagrams, and architecture diagrams from text descriptions using AI. Works on any device.",
    "h1": "AI Diagram Generator"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "What diagram types can I create?",
      "a": "Flowcharts, mind maps, ER diagrams, sequence diagrams, and architecture diagrams. Describe what you need and AI generates it."
    },
    {
      "q": "Can I edit the generated diagram?",
      "a": "Yes! After AI generates the diagram, you can add, move, resize, recolor, and connect shapes manually. Full editing control."
    },
    {
      "q": "Does it work offline?",
      "a": "AI generation requires internet. When offline, smart templates are used based on your description keywords, and you can still edit everything manually."
    },
    {
      "q": "Can I export my diagram?",
      "a": "Yes, export as SVG for use in other applications, presentations, or documents."
    }
  ],
  "related": [
    "media.photo-editor",
    "create.presentation-maker",
    "create.barcode-generator",
    "create.barcode-scanner"
  ],
  "legacySlugs": [
    "ai-diagram-generator"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
