import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "ai.fitness-coach",
  "space": "ai",
  "category": "everyday",
  "slug": "fitness-coach",
  "name": "AI Fitness & Gym Coach",
  "tagline": "Scientific workout splits, 1RM calculator, TDEE macros & AI gym coach.",
  "keywords": [
    "fitness ai",
    "gym coach",
    "workout generator",
    "1rm calculator",
    "ppl split",
    "tdee calculator",
    "hypertrophy planner"
  ],
  "synonyms": [
    "gym coach",
    "workout generator",
    "1rm calculator"
  ],
  "jobs": [
    "scientific workout split architect (ppl, upper/lower, full body)",
    "dynamic exercise database with form cues & equipment filtering",
    "live session logger with automatic rest countdown timer"
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
    "title": "AI Fitness & Gym Coach – Workout Splits & 1RM Calculator",
    "description": "Build a workout split, estimate your one-rep max and get exercise guidance from an AI coach. Educational, not medical advice. Free daily AI allowance.",
    "h1": "AI Fitness & Gym Coach"
  },
  "howTo": [
    "Describe what you need, or start from an example.",
    "Generate the answer.",
    "Copy it, refine your request or regenerate."
  ],
  "faq": [
    {
      "q": "What workout splits are supported?",
      "a": "The platform generates Push/Pull/Legs (PPL), Upper/Lower, and Full Body splits tailored for 3 to 6 days per week based on your available equipment."
    },
    {
      "q": "How does the 1RM calculator work?",
      "a": "It computes your One-Rep Max simultaneously across four gold-standard exercise science formulas: Brzycki, Epley, Lander, and Lombardi, providing a reliable consensus estimate along with percentage loads."
    },
    {
      "q": "Can I use the gym coach offline?",
      "a": "Yes! While online AI queries give deeper custom analysis, an offline clinical sports science engine provides instant biomechanics advice when disconnected."
    },
    {
      "q": "Where is my text sent?",
      "a": "AI Fitness & Gym Coach sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details."
    }
  ],
  "related": [
    "study.pomodoro-timer",
    "work.habit-tracker",
    "study.study-planner",
    "ai.chat"
  ],
  "legacySlugs": [
    "fitness-ai"
  ],
  "status": "live",
  "offline": false
};

export default manifest;
