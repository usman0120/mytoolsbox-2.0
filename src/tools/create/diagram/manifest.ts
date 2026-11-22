import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "create.diagram",
  "space": "create",
  "category": "diagrams",
  "slug": "diagram",
  "name": "Diagram Studio",
  "tagline": "Whiteboard, flowcharts and diagrams from text, with optional AI.",
  "keywords": [
    "diagram maker",
    "flowchart maker",
    "online whiteboard",
    "mermaid editor",
    "text to diagram",
    "sequence diagram",
    "er diagram",
    "mind map maker"
  ],
  "synonyms": [
    "flowchart maker",
    "whiteboard",
    "text to diagram"
  ],
  "jobs": [
    "hand-drawn whiteboard",
    "diagrams from text",
    "describe a diagram and let AI draw it"
  ],
  "template": "editor",
  "input": [
    {
      "type": "mermaid",
      "accept": [
        "text/plain"
      ]
    }
  ],
  "output": [
    {
      "type": "image",
      "accept": [
        "image/png",
        "image/svg+xml"
      ]
    },
    {
      "type": "mermaid",
      "accept": [
        "text/plain"
      ]
    }
  ],
  "engine": "client",
  "aiTask": "general",
  "seo": {
    "title": "Diagram Studio – Whiteboard, Flowchart & Mermaid Editor",
    "description": "Draw on a whiteboard, write flowcharts, sequence and ER diagrams as text, or describe one and let AI draw it. Export PNG or SVG. Free, no sign-up.",
    "h1": "Diagram Studio"
  },
  "howTo": [
    "Draw on the Whiteboard, or write a diagram as text in the Code tab.",
    "Describe a diagram in plain words to have AI write it for you.",
    "Turn code into editable shapes, then export PNG, SVG or the source."
  ],
  "faq": [
    {
      "q": "What is the Code tab?",
      "a": "It uses Mermaid, a simple text format for diagrams. Write lines like A --> B and the diagram draws itself. Pick an example to start."
    },
    {
      "q": "How does the AI option work?",
      "a": "Describe the diagram in plain words. The description is sent to our AI provider, which writes Mermaid code that you can edit. It counts toward your daily AI allowance."
    },
    {
      "q": "Can I edit an AI diagram by hand?",
      "a": "Yes. Edit the code, or choose Edit as shapes to move boxes and arrows freely on the whiteboard."
    },
    {
      "q": "Does it work offline?",
      "a": "The whiteboard and the Code tab work offline once the page has loaded. Only AI needs a connection."
    },
    {
      "q": "Where is my diagram saved?",
      "a": "In this browser, automatically. Signed-in users can also save diagrams to their account."
    },
    {
      "q": "Which diagram types are supported?",
      "a": "Flowcharts, sequence, class, entity relationship, state, Gantt, mind maps, pie charts and timelines."
    }
  ],
  "related": [
    "create.design",
    "create.presentation-maker",
    "dev.json-formatter",
    "ai.writer"
  ],
  "legacySlugs": [
    "ai-diagram-generator"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
