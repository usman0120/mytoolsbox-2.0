"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AIChat } from "@/features/ai/ai-chat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignInDialog } from "@/components/auth/signin-dialog";
import {
  Bot,
  Code,
  Pencil,
  Brain,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Image,
  Search,
  Calculator,
  FileText,
  MessageSquare,
  Languages,
  Wand2,
  LogIn,
  ShieldAlert,
} from "lucide-react";

const QUICK_PROMPTS = [
  {
    icon: Code,
    label: "Write code",
    prompt: "Write a TypeScript function that...",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Pencil,
    label: "Improve writing",
    prompt: "Rewrite this to be more professional: ",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Brain,
    label: "Explain concept",
    prompt: "Explain how ___ works in simple terms.",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Lightbulb,
    label: "Brainstorm ideas",
    prompt: "Give me 10 creative ideas for...",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Calculator,
    label: "Solve math",
    prompt: "Solve this step by step: ",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: Languages,
    label: "Translate",
    prompt: "Translate the following to Spanish: ",
    gradient: "from-teal-500/10 to-green-500/10",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
];

const AI_CAPABILITIES = [
  {
    icon: MessageSquare,
    title: "Chat",
    description: "Conversational AI for questions, brainstorming, and assistance",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    status: "active",
  },
  {
    icon: Pencil,
    title: "Writing",
    description: "Improve, rewrite, summarize, or generate any text content",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    status: "active",
  },
  {
    icon: Calculator,
    title: "Math",
    description: "Step-by-step math solutions with detailed explanations",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    status: "active",
  },
  {
    icon: Image,
    title: "Vision",
    description: "Analyze images, extract text, and understand visual content",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    status: "coming-soon",
  },
  {
    icon: Search,
    title: "Research",
    description: "Deep research with source citations and structured reports",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    status: "coming-soon",
  },
  {
    icon: Wand2,
    title: "Image Generation",
    description: "Create images from text descriptions with AI",
    gradient: "from-pink-500/10 to-rose-500/10",
    iconColor: "text-pink-600 dark:text-pink-400",
    status: "coming-soon",
  },
];

export function AIPageClient() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const [showSignIn, setShowSignIn] = useState(false);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center py-32 gap-4 animate-fade-in-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/10 to-purple-500/10 ring-1 ring-violet-500/20">
            <Sparkles className="h-8 w-8 text-violet-500 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth gate: require sign-in for AI features
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center py-24 gap-6 animate-fade-in-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500/10 to-orange-500/10 ring-1 ring-amber-500/20">
            <ShieldAlert className="h-10 w-10 text-amber-500" />
          </div>
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-sm text-muted-foreground mb-6">
              AI features require an account to manage API usage and credits.
              Sign in to get <strong>500 free credits</strong> every month.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowSignIn(true)} className="rounded-xl gap-2">
              <LogIn className="h-4 w-4" />
              Sign In to Continue
            </Button>
          </div>
          <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/10 to-purple-500/10 ring-1 ring-violet-500/20 shadow-sm">
            <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Assistant</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Multi-provider AI — OpenAI, Gemini, Groq & Claude. Chat, write, solve, and create.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 rounded-xl p-1 bg-muted/50 w-full justify-start overflow-x-auto">
          <TabsTrigger value="chat" className="rounded-lg data-[state=active]:shadow-sm gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="capabilities" className="rounded-lg data-[state=active]:shadow-sm gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Capabilities
          </TabsTrigger>
          <TabsTrigger value="compare" className="rounded-lg data-[state=active]:shadow-sm gap-1.5">
            <Bot className="h-3.5 w-3.5" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="prompts" className="rounded-lg data-[state=active]:shadow-sm gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" />
            Prompt Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <AIChat />
        </TabsContent>

        <TabsContent value="capabilities">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_CAPABILITIES.map((cap, i) => (
              <Card
                key={cap.title}
                className="group card-lift border-border/50 hover:border-primary/30 overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${cap.gradient} ring-1 ring-border/50 group-hover:scale-110 transition-transform shrink-0`}
                    >
                      <cap.icon className={`h-6 w-6 ${cap.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{cap.title}</h3>
                        {cap.status === "coming-soon" && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-full">Soon</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compare">
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4 animate-fade-in-up">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/10 to-purple-500/10 ring-1 ring-violet-500/20">
              <Bot className="h-10 w-10 text-violet-500" />
            </div>
            <p className="text-lg font-medium">Model Comparison</p>
            <p className="text-sm max-w-sm text-center">
              Compare responses from multiple AI models side by side to find the best output for your use case.
            </p>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Coming Soon
            </Badge>
          </div>
        </TabsContent>

        <TabsContent value="prompts">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_PROMPTS.map((item, i) => (
              <Card
                key={item.label}
                className="group card-lift cursor-pointer border-border/50 hover:border-primary/30 overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => {
                  setActiveTab("chat");
                  // Could set the prompt in chat input via state management
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${item.gradient} ring-1 ring-border/50 shrink-0 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1">{item.label}</h3>
                      <p className="text-xs text-muted-foreground truncate">{item.prompt}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}