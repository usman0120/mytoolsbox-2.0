"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "./markdown-renderer";
import {
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Code,
  Pencil,
  Lightbulb,
  Calculator,
  Search,
  ArrowRight,
  TrendingUp,
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { ChatMessage } from "../types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectPrompt: (promptText: string) => void;
  onRegenerate: () => void;
  onFeedback: (messageId: string, feedback: "like" | "dislike") => void;
}

const STARTER_CARDS = [
  {
    icon: Code,
    title: "Write clean code",
    prompt: "Write a high-performance debounce function in TypeScript with cancellation and immediate execution options.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Pencil,
    title: "Polish my writing",
    prompt: "Rewrite this draft to be more compelling, clear, and punchy while maintaining an authoritative tone: ",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Lightbulb,
    title: "Brainstorm 10 ideas",
    prompt: "Give me 10 creative, high-margin SaaS product ideas for developer productivity in 2026.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Search,
    title: "Architect an API",
    prompt: "Design a RESTful API specification for a team workspace collaboration system with schemas and error codes.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Calculator,
    title: "Solve & prove math",
    prompt: "Explain and prove Bayes' Theorem step-by-step with an intuitive real-world diagnostic medical example.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: TrendingUp,
    title: "Business Model Canvas",
    prompt: "Construct a detailed Business Model Canvas covering all 9 building blocks for an AI-powered code auditing tool.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
];

const PROVIDER_COLORS: Record<string, string> = {
  openai: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  gemini: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  groq: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  claude: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  auto: "bg-primary/10 text-primary border-primary/20",
};

export function ChatMessages({
  messages,
  isLoading,
  onSelectPrompt,
  onRegenerate,
  onFeedback,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Cancel speech synthesis when leaving or switching chat
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in your browser.");
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code omitted.")
      .replace(/[*_~`#>]/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 max-w-4xl mx-auto w-full">
        {/* Gemini Greeting Header */}

        {/* Gemini Quick Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {STARTER_CARDS.slice(0, 4).map((card, i) => (
            <button
              type="button"
              key={i}
              onClick={() => onSelectPrompt(card.prompt)}
              className="p-3 text-start hover:bg-muted/50 group border-b border-border/50 flex flex-col justify-between min-h-24"
            >
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {card.title}
                </h3>
                <p className="text-[11px] text-muted-foreground line-clamp-3 leading-snug">
                  {card.prompt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.bg}`}>
                  <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>

      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 md:py-6 max-w-4xl mx-auto w-full space-y-6 min-h-0 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.25)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
      {messages.map((msg, index) => {
        const isUser = msg.role === "user";
        const isLastAssistant =
          !isUser &&
          index === messages.length - 1 &&
          !isLoading;

        return (
          <div
            key={msg.id}
            className={`flex gap-3 md:gap-4 ${
              isUser ? "justify-end" : "justify-start"
            } animate-fade-in-up`}
          >
            {/* Assistant Avatar */}
            {!isUser && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500/15 to-purple-500/15 ring-1 ring-blue-500/25 shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4 text-blue-500" />
              </div>
            )}

            {/* Message Content Container */}
            <div
              className={`flex flex-col min-w-0 ${
                isUser ? "items-end max-w-[85%] md:max-w-[75%]" : "items-start flex-1 max-w-full"
              }`}
            >
              {/* Message Body */}
              <div
                className={`text-sm leading-relaxed ${
                  isUser
                    ? "bg-muted text-foreground rounded-lg px-3 py-2 whitespace-pre-wrap wrap-break-word"
                    : "w-full text-foreground px-1 py-0.5 space-y-3"
                }`}
              >
                {isUser ? (
                  msg.content
                ) : (
                  <div data-user-content translate="no"><MarkdownRenderer content={msg.content} /></div>
                )}
              </div>

              {/* Assistant Message Footer / Metadata & Actions */}
              {!isUser && (
                <div className="flex flex-wrap items-center gap-2 mt-2 px-1 text-[11px] text-muted-foreground w-full">
                  {msg.provider && (
                    <Badge
                      variant="outline"
                      className={`h-5 px-1.5 rounded-full uppercase tracking-wider text-[9px] font-mono ${
                        PROVIDER_COLORS[msg.provider] || PROVIDER_COLORS.auto
                      }`}
                    >
                      {msg.provider}
                    </Badge>
                  )}

                  {msg.model && (
                    <span className="font-mono text-[10px] opacity-70">
                      {msg.model}
                    </span>
                  )}

                  {msg.usage && (
                    <span className="text-[10px] opacity-60">
                      • {msg.usage.totalTokens} tokens
                    </span>
                  )}

                  <div className="flex items-center gap-0.5 ml-auto">
                    {/* Read Aloud / Speak */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      className={`h-6 w-6 rounded-md hover:bg-muted ${
                        speakingId === msg.id
                          ? "text-primary animate-pulse"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={speakingId === msg.id ? "Stop reading" : "Read aloud"}
                    >
                      {speakingId === msg.id ? (
                        <VolumeX className="h-3 w-3" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                    </Button>

                    {/* Copy Response */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>

                    {/* Like / Dislike */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onFeedback(msg.id, "like")}
                      className={`h-6 w-6 rounded-md hover:bg-muted ${
                        msg.feedback === "like"
                          ? "text-emerald-500"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Helpful response"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onFeedback(msg.id, "dislike")}
                      className={`h-6 w-6 rounded-md hover:bg-muted ${
                        msg.feedback === "dislike"
                          ? "text-rose-500"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Not helpful"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>

                    {/* Regenerate button on last message */}
                    {isLastAssistant && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRegenerate}
                        className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Regenerate response"
                      >
                        <RotateCw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* User Message Footer */}
              {isUser && (
                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-muted-foreground">
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <Copy className="h-2.5 w-2.5" />
                    Copy
                  </button>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {isUser && (
              <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/20 shadow-xs mt-0.5">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}

      {/* Loading state indicator */}
      {isLoading && (
        <div className="flex gap-3 md:gap-4 animate-fade-in-up">
          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-violet-500/20 shadow-xs">
            <AvatarFallback className="bg-linear-to-br from-violet-500/10 to-purple-500/10 text-violet-600">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-xs bg-card/70 border border-border/50 text-muted-foreground text-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span className="animate-pulse">Generating response...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
