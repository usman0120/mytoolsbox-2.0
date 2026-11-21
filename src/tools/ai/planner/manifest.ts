import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "ai.planner",
  "space": "ai",
  "category": "plan",
  "slug": "planner",
  "name": "AI Planning Assistant",
  "tagline": "AI-powered planning with milestones & checklists.",
  "keywords": [
    "ai planner",
    "planning assistant",
    "goal planner",
    "project planner",
    "study plan",
    "event planner",
    "learning plan",
    "weekly planner"
  ],
  "synonyms": [
    "planning assistant",
    "goal planner",
    "project planner"
  ],
  "jobs": [
    "ai-generated milestones",
    "weekly/daily task plans",
    "resource recommendations"
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
    "title": "AI Planning Assistant – Generate Smart Plans Online",
    "description": "Plan a study schedule, project, trip or event with AI. Get a step-by-step plan with timings you can copy and adjust. Free daily AI allowance, no sign-up.",
    "h1": "AI Planning Assistant"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "What can I plan with this tool?",
      "a": "Anything! Learning paths, projects, events (like weddings), business goals, personal goals, and team projects. Just describe what you want to achieve."
    },
    {
      "q": "How detailed are the plans?",
      "a": "Plans include milestones with deadlines, weekly task breakdowns, specific resource recommendations (books, courses, tools), and practical tips for success."
    },
    {
      "q": "Can I track my progress?",
      "a": "Yes! Each plan includes an interactive checklist. Check off tasks as you complete them and see your progress percentage."
    },
    {
      "q": "Does it work offline?",
      "a": "AI generation requires internet. When offline, smart templates are used based on your goal and plan type."
    }
  ],
  "related": [
    "ai.project-ideas",
    "study.study-planner",
    "study.pomodoro-timer",
    "work.notepad"
  ],
  "legacySlugs": [
    "ai-planning"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
