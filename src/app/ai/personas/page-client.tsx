"use client";

import { useRouter } from "next/navigation";
import { AISubnav } from "@/features/ai/components/ai-subnav";
import { useChatStore } from "@/features/ai/chat-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Code,
  Pencil,
  Calculator,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Bot,
  CheckCircle2,
  Terminal,
  Database,
  FileText,
  Zap,
} from "lucide-react";
import { AI_PERSONAS } from "@/features/ai/prompt-library-data";

const PERSONA_ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Code,
  Pencil,
  Calculator,
  GraduationCap,
  Briefcase,
};

const SPECIALIZED_AI_TOOLS = [
  {
    icon: Code,
    name: "Code Review & Security Auditor",
    description: "Scan code for potential memory leaks, race conditions, edge case bugs, and security vulnerabilities.",
    personaId: "software-engineer",
    prompt: "Perform a thorough code review and security audit on the following code. Highlight vulnerabilities, edge cases, and performance bottlenecks:\n\n```typescript\n\n```",
    badge: "Engineering",
  },
  {
    icon: Database,
    name: "SQL & Query Performance Optimizer",
    description: "Analyze slow SQL queries, suggest composite indexes, and optimize execution plans.",
    personaId: "software-engineer",
    prompt: "Analyze and optimize this SQL query for high-traffic PostgreSQL/MySQL databases. Suggest optimal indexes and explain query execution trade-offs:\n\n```sql\n\n```",
    badge: "Database",
  },
  {
    icon: FileText,
    name: "Executive Summary & Key Takeaways",
    description: "Distill dense technical papers, executive briefs, or meeting notes into actionable executive summaries.",
    personaId: "general",
    prompt: "Provide a high-impact executive summary of the following text with: 1. Core Thesis, 2. Key Actionable Insights, 3. Critical Risks & Trade-offs:\n\n",
    badge: "Executive",
  },
  {
    icon: Terminal,
    name: "Regex Architect & Explainer",
    description: "Construct resilient regular expressions with detailed token-by-token explanations and test cases.",
    personaId: "software-engineer",
    prompt: "Construct a robust, safe regular expression with test cases and token-by-token explanation for the following pattern requirement:\n\n",
    badge: "DevOps",
  },
];

export function PersonasPageClient() {
  const router = useRouter();
  const { setActivePersonaId, setPendingPrompt, addConversation } = useChatStore();

  const handleLaunchPersona = (personaId: string, samplePrompt?: string) => {
    setActivePersonaId(personaId);
    if (samplePrompt) {
      setPendingPrompt(samplePrompt);
    }
    router.push("/ai");
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8 max-w-7xl">
      <AISubnav
        title="AI Personas & Domain Engines"
        subtitle="Specialized system prompts tuned for precise domain expertise. Select a persona or launch a targeted AI workflow."
      />

      {/* Personas Grid */}
      <div className="space-y-8 mt-6">
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight">Expert Personas</h2>
            <p className="text-xs text-muted-foreground">
              Configured system roles tailored with specialized guidelines, tone, and rigor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_PERSONAS.map((persona) => {
              const Icon = PERSONA_ICONS[persona.iconName] || Bot;
              return (
                <Card
                  key={persona.id}
                  className="group card-lift border-border/60 hover:border-primary/40 bg-card/70 hover:bg-card/95 rounded-2xl flex flex-col justify-between p-5 transition-all"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${persona.gradient} ring-1 ring-border/50 group-hover:scale-105 transition-transform shrink-0`}
                        >
                          <Icon className={`h-5 w-5 ${persona.iconColor}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm leading-tight">{persona.name}</h3>
                          <span className="text-[11px] text-muted-foreground block mt-0.5">
                            {persona.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {persona.description}
                    </p>

                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-[11px] text-muted-foreground font-mono line-clamp-3">
                      &quot;{persona.systemPrompt}&quot;
                    </div>
                  </div>

                  <Button
                    onClick={() => handleLaunchPersona(persona.id)}
                    size="sm"
                    className="w-full mt-4 rounded-xl text-xs gap-1.5 font-medium shadow-xs"
                  >
                    <span>Chat as {persona.name.split(" ")[0]}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Specialized Workflows */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight">Specialized AI Workflows</h2>
            <p className="text-xs text-muted-foreground">
              One-click prompt structures for high-value technical and editorial workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPECIALIZED_AI_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.name}
                  className="card-lift border-border/60 hover:border-primary/40 bg-card/70 hover:bg-card/95 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-sm">{tool.name}</h3>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5 rounded-full">
                        {tool.badge}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <Button
                      onClick={() => handleLaunchPersona(tool.personaId, tool.prompt)}
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-xs gap-1.5 font-medium hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <span>Launch Workflow</span>
                      <ArrowRight className="h-3 w-3 ml-0.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
