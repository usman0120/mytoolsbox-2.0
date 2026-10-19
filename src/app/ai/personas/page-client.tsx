"use client";

import { useRouter } from "next/navigation";
import { AISubnav } from "@/features/ai/components/ai-subnav";
import { useChatStore } from "@/features/ai/chat-store";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
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
  const { t, localizePath } = useI18n();
  const { setActivePersonaId, setPendingPrompt, addConversation, updateConversation } = useChatStore();

  const handleLaunchPersona = (personaId: string, samplePrompt?: string) => {
    setActivePersonaId(personaId);
    const conversationId = addConversation();
    const persona = AI_PERSONAS.find((item) => item.id === personaId);
    if (persona) updateConversation(conversationId, { personaId, systemPrompt: persona.systemPrompt });
    if (samplePrompt) {
      setPendingPrompt(samplePrompt);
    }
    router.push(localizePath("/ai"));
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">
      <AISubnav
        title={t("ai_personas", "Personas & Tools")}
      />

      {/* Personas Grid */}
      <div className="space-y-6 mt-4">
        <div>
          <div className="mb-4">
            <h2 className="text-base font-semibold">Personas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_PERSONAS.map((persona) => {
              const Icon = PERSONA_ICONS[persona.iconName] || Bot;
              return (
                <Card
                  key={persona.id}
                  className="group border-border/60 rounded-lg flex flex-col justify-between p-3 gap-3"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="shrink-0"
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

                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer">System prompt</summary>
                      <p className="mt-2 whitespace-pre-wrap wrap-break-word">{persona.systemPrompt}</p>
                    </details>
                  </div>

                  <Button
                    onClick={() => handleLaunchPersona(persona.id)}
                    size="sm"
                    className="w-full mt-2 rounded-md text-xs gap-1.5"
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
            <h2 className="text-base font-semibold">Workflows</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPECIALIZED_AI_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.name}
                  className="border-border/60 rounded-lg p-3 flex flex-col justify-between gap-3"
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
                      className="rounded-md text-xs gap-1.5"
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
