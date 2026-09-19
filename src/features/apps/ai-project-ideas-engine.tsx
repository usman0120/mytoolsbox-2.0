"use client";

import { useState } from "react";
import { Lightbulb, Code2, BarChart3, Star, Clock, Layers, ArrowRight, Copy, RefreshCw, Sparkles, Download, Gauge, Wrench, Database, GitBranch, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { complete } from "@/lib/ai";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProjectIdea {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  skills: string[];
  features: string[];
  techStack: {
    frontend?: string;
    backend?: string;
    database?: string;
    deployment?: string;
  };
  architecture: string;
  milestones: { title: string; tasks: string[] }[];
  stretchFeatures: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner (0-6 months)" },
  { value: "intermediate", label: "Intermediate (6-18 months)" },
  { value: "advanced", label: "Advanced (18+ months)" },
];

const TIME_RANGES = [
  { value: "1-week", label: "1 Week" },
  { value: "2-weeks", label: "2 Weeks" },
  { value: "1-month", label: "1 Month" },
  { value: "3-months", label: "3 Months" },
];

const PROJECT_TYPES = [
  { value: "web", label: "Web App" },
  { value: "mobile", label: "Mobile App" },
  { value: "api", label: "API / Backend" },
  { value: "cli", label: "CLI Tool" },
  { value: "data", label: "Data / ML" },
  { value: "game", label: "Game" },
  { value: "extension", label: "Browser Extension" },
  { value: "fullstack", label: "Full Stack" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// ---------------------------------------------------------------------------
// AI helpers
// ---------------------------------------------------------------------------

function buildAIPrompt(skillLevel: string, timeRange: string, projectType: string, extraContext: string): string {
  return `Generate a detailed project idea for a ${skillLevel} developer who wants a ${projectType} project that takes about ${timeRange}. ${extraContext ? `Additional context: ${extraContext}` : ""}

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "title": "string (catchy project name)",
  "description": "string (2-3 sentence overview)",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedTime": "string",
  "skills": ["string (specific skills the developer will practice)"],
  "features": ["string (5-8 specific features)"],
  "techStack": {
    "frontend": "string (recommended frontend tech)",
    "backend": "string (recommended backend tech)",
    "database": "string (recommended database)",
    "deployment": "string (recommended deployment platform)"
  },
  "architecture": "string (brief architecture description, 2-3 sentences)",
  "milestones": [
    { "title": "string", "tasks": ["string"] }
  ],
  "stretchFeatures": ["string (3-4 advanced features to try after completing the basics)"]
}

Rules:
- Make the project realistic and achievable within the timeframe
- Skills should be specific (e.g., "React hooks", "REST API design", not just "React")
- Features should be concrete and implementable
- Milestones should have 3-5 tasks each, spread across the timeframe
- Stretch features should genuinely extend the project's scope
- Be creative but practical — suggest projects a real developer would want to build`;
}

function parseAIResponse(text: string): ProjectIdea | null {
  try {
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }
    const parsed = JSON.parse(cleaned);
    if (parsed.title && parsed.features && parsed.milestones) {
      return parsed as ProjectIdea;
    }
    return null;
  } catch {
    return null;
  }
}

function getFallbackProject(skillLevel: string, timeRange: string, projectType: string): ProjectIdea {
  const projects: Record<string, ProjectIdea> = {
    "beginner-web-1-week": {
      title: "Personal Portfolio Website",
      description: "Build a responsive portfolio to showcase your projects and skills. Includes a contact form, project gallery, and smooth animations.",
      difficulty: "Beginner",
      estimatedTime: "1 week",
      skills: ["HTML5", "CSS3", "Responsive Design", "CSS Animations", "Form Handling"],
      features: ["Hero section with introduction", "Project showcase grid", "Contact form with validation", "Smooth scroll navigation", "Mobile-responsive layout", "Dark/light mode toggle"],
      techStack: { frontend: "HTML, CSS, JavaScript", backend: "None (static site)", database: "None", deployment: "GitHub Pages or Netlify" },
      architecture: "Static single-page website with CSS animations. Contact form uses Formspree or similar service for handling submissions without a backend.",
      milestones: [
        { title: "Setup & Structure", tasks: ["Create HTML structure", "Set up CSS variables", "Build navigation"] },
        { title: "Sections & Content", tasks: ["Build hero section", "Create project cards", "Add about section"] },
        { title: "Polish & Deploy", tasks: ["Add animations", "Make responsive", "Deploy to Netlify"] },
      ],
      stretchFeatures: ["Add a blog section", "Integrate a CMS like Decap CMS", "Add page transition animations", "Implement SEO meta tags"],
    },
    "beginner-web-2-weeks": {
      title: "Task Manager / To-Do App",
      description: "Build a full-featured task management app with categories, priorities, due dates, and local storage persistence.",
      difficulty: "Beginner",
      estimatedTime: "2 weeks",
      skills: ["JavaScript", "DOM Manipulation", "LocalStorage API", "Event Handling", "CSS Grid/Flexbox"],
      features: ["Add/edit/delete tasks", "Task categories & priorities", "Due date picker", "Filter & search tasks", "Local storage persistence", "Drag-and-drop reordering"],
      techStack: { frontend: "HTML, CSS, JavaScript (or React)", backend: "None (localStorage)", database: "localStorage", deployment: "Vercel or Netlify" },
      architecture: "Client-side only app using localStorage for persistence. React optional for component-based architecture. No backend needed.",
      milestones: [
        { title: "Core CRUD", tasks: ["Set up project structure", "Implement add/delete tasks", "Add localStorage persistence"] },
        { title: "Features", tasks: ["Add categories & priorities", "Implement filtering", "Add due dates"] },
        { title: "Polish", tasks: ["Add drag-and-drop", "Style with CSS", "Deploy to Vercel"] },
      ],
      stretchFeatures: ["Add user accounts with Firebase", "Sync across devices", "Add subtasks", "Export to CSV/JSON"],
    },
    "intermediate-web-1-month": {
      title: "E-Commerce Store",
      description: "Build a full-stack e-commerce platform with product listings, cart, checkout, and payment integration.",
      difficulty: "Intermediate",
      estimatedTime: "1 month",
      skills: ["React", "Node.js", "REST API", "Database Design", "Payment Integration", "Authentication"],
      features: ["Product catalog with search/filter", "Shopping cart with persistence", "User authentication & profiles", "Stripe payment integration", "Order history & tracking", "Admin dashboard for products"],
      techStack: { frontend: "React + Tailwind CSS", backend: "Node.js + Express", database: "PostgreSQL or MongoDB", deployment: "Vercel (frontend) + Railway (backend)" },
      architecture: "React SPA frontend communicating with a RESTful Node.js API. JWT authentication. Stripe for payments. PostgreSQL for relational data (products, orders, users).",
      milestones: [
        { title: "Setup & Auth", tasks: ["Initialize frontend & backend", "Set up database schema", "Implement user auth"] },
        { title: "Products", tasks: ["Build product catalog API", "Create product listing UI", "Add search & filters"] },
        { title: "Cart & Checkout", tasks: ["Implement cart logic", "Integrate Stripe", "Build checkout flow"] },
        { title: "Admin & Deploy", tasks: ["Build admin dashboard", "Add order tracking", "Deploy both frontend & backend"] },
      ],
      stretchFeatures: ["Add product reviews & ratings", "Implement wishlists", "Add real-time inventory tracking", "Build a mobile app with React Native"],
    },
  };

  const key = `${skillLevel}-${projectType}-${timeRange}`;
  const fallback = projects[key] || projects["beginner-web-1-week"];
  return { ...fallback, difficulty: skillLevel === "beginner" ? "Beginner" : skillLevel === "intermediate" ? "Intermediate" : "Advanced" };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AIProjectIdeasEngine() {
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [timeRange, setTimeRange] = useState("2-weeks");
  const [projectType, setProjectType] = useState("web");
  const [extraContext, setExtraContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedAI, setUsedAI] = useState(false);
  const [project, setProject] = useState<ProjectIdea | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await complete({
        prompt: `Skill: ${skillLevel}, Time: ${timeRange}, Type: ${projectType}${extraContext ? `, Context: ${extraContext}` : ""}`,
        systemPrompt: buildAIPrompt(skillLevel, timeRange, projectType, extraContext),
        temperature: 0.7,
        maxTokens: 3000,
      });
      const parsed = parseAIResponse(response.text);
      if (parsed) {
        setProject(parsed);
        setUsedAI(true);
      } else {
        setProject(getFallbackProject(skillLevel, timeRange, projectType));
        setUsedAI(false);
        setError("AI response couldn't be parsed. Using a smart template instead.");
      }
    } catch {
      setProject(getFallbackProject(skillLevel, timeRange, projectType));
      setUsedAI(false);
      setError("AI is unavailable (offline or API error). Using a smart template.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyProject = () => {
    if (!project) return;
    let text = `🚀 Project: ${project.title}\n`;
    text += `📝 ${project.description}\n\n`;
    text += `🎯 Difficulty: ${project.difficulty} | ⏱ Time: ${project.estimatedTime}\n\n`;
    text += `🛠 Skills: ${project.skills.join(", ")}\n\n`;
    text += `✨ Features:\n${project.features.map(f => `  • ${f}`).join("\n")}\n\n`;
    text += `🏗 Tech Stack:\n`;
    if (project.techStack.frontend) text += `  Frontend: ${project.techStack.frontend}\n`;
    if (project.techStack.backend) text += `  Backend: ${project.techStack.backend}\n`;
    if (project.techStack.database) text += `  Database: ${project.techStack.database}\n`;
    if (project.techStack.deployment) text += `  Deployment: ${project.techStack.deployment}\n`;
    text += `\n📐 Architecture: ${project.architecture}\n\n`;
    text += `📋 Milestones:\n`;
    project.milestones.forEach(m => {
      text += `  ${m.title}:\n`;
      m.tasks.forEach(t => text += `    - ${t}\n`);
    });
    text += `\n🚀 Stretch Features:\n${project.stretchFeatures.map(f => `  • ${f}`).join("\n")}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Project Idea Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Skill Level</Label>
              <Select value={skillLevel} onValueChange={(v) => setSkillLevel(v || "beginner")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Available</Label>
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v || "2-weeks")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Select value={projectType} onValueChange={(v) => setProjectType(v || "web")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Input
              id="context"
              placeholder="e.g., I want to focus on React and Firebase... or I prefer Python backend..."
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
            {isGenerating ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Generating Ideas...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate Project Idea</>
            )}
          </Button>
          {error && <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {project && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold">{project.title}</h2>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
            <div className="flex gap-2">
              {usedAI && <Badge variant="secondary" className="text-xs">AI Generated</Badge>}
              <Button variant="outline" size="sm" onClick={copyProject}><Copy className="h-4 w-4 mr-1" /> Copy</Button>
              <Button variant="outline" size="sm" onClick={handleGenerate}><RefreshCw className="h-4 w-4 mr-1" /> New Idea</Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <Gauge className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-xs text-muted-foreground">Difficulty</p>
                <Badge className={DIFFICULTY_COLORS[project.difficulty] || ""}>{project.difficulty}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-semibold text-sm">{project.estimatedTime}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-xs text-muted-foreground">Skills</p>
                <p className="font-semibold text-sm">{project.skills.length} skills</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Target className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                <p className="text-xs text-muted-foreground">Features</p>
                <p className="font-semibold text-sm">{project.features.length} features</p>
              </CardContent>
            </Card>
          </div>

          {/* Skills */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> Skills You'll Practice</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4" /> Core Features</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {project.features.map((feature, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4" /> Recommended Tech Stack</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {project.techStack.frontend && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Frontend</p>
                    <p className="font-medium text-sm">{project.techStack.frontend}</p>
                  </div>
                )}
                {project.techStack.backend && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Backend</p>
                    <p className="font-medium text-sm">{project.techStack.backend}</p>
                  </div>
                )}
                {project.techStack.database && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Database</p>
                    <p className="font-medium text-sm">{project.techStack.database}</p>
                  </div>
                )}
                {project.techStack.deployment && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Deployment</p>
                    <p className="font-medium text-sm">{project.techStack.deployment}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Architecture */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><GitBranch className="h-4 w-4" /> Architecture</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{project.architecture}</p>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Milestones</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.milestones.map((milestone, i) => (
                  <div key={i} className="border-l-2 border-primary pl-4">
                    <p className="font-medium text-sm">{milestone.title}</p>
                    <ul className="mt-1 space-y-0.5">
                      {milestone.tasks.map((task, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span> {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stretch Features */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Rocket className="h-4 w-4" /> Stretch Features</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {project.stretchFeatures.map((feature, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 mt-0.5 text-purple-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Rocket icon workaround
function Rocket(props: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4l.5-2.5a4.98 4.98 0 0 1 3-3L10 6" />
      <path d="M14.5 6.5 15 6a4.98 4.98 0 0 1 3 3l.5 2.5H15" />
    </svg>
  );
}