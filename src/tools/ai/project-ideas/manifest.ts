import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "ai.project-ideas",
  "space": "ai",
  "category": "build",
  "slug": "project-ideas",
  "name": "AI Project Ideas",
  "tagline": "AI-generated project ideas with full specs.",
  "keywords": [
    "project ideas",
    "coding projects",
    "programming projects",
    "project generator",
    "side project ideas",
    "portfolio projects",
    "beginner projects"
  ],
  "synonyms": [
    "coding projects",
    "programming projects",
    "project generator"
  ],
  "jobs": [
    "skill-level matched projects",
    "complete tech stack recommendations",
    "architecture overview"
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
    "title": "AI Project Ideas Generator – Find Your Next Coding Project",
    "description": "Get personalized project ideas based on your skill level, available time, and interests. Free daily AI allowance, no sign-up. Works on any device.",
    "h1": "AI Project Ideas"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "What types of projects can it suggest?",
      "a": "Web apps, mobile apps, APIs, CLI tools, data/ML projects, games, browser extensions, and full-stack applications."
    },
    {
      "q": "How are projects matched to my skill level?",
      "a": "You select beginner, intermediate, or advanced. AI generates projects with appropriate complexity, skills, and estimated time for your level."
    },
    {
      "q": "What's included in each project idea?",
      "a": "Project title & description, required skills, core features, recommended tech stack (frontend/backend/database/deployment), architecture overview, milestones with tasks, and stretch features."
    },
    {
      "q": "Can I get another idea if I don't like the first one?",
      "a": "Yes! Click 'New Idea' to generate another project with the same criteria, or change your skill level/time/type for different suggestions."
    }
  ],
  "related": [
    "ai.planner",
    "create.diagram",
    "ai.chat",
    "ai.farm-advisor"
  ],
  "legacySlugs": [
    "ai-project-ideas"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
