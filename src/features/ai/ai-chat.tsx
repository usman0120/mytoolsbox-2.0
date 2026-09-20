"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, Loader2, Bot, User, Trash2, Sparkles, Coins } from "lucide-react";
import { completeViaServer, getAvailableProviders } from "@/lib/ai";
import type { AIProvider, AIResponse } from "@/lib/ai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  provider?: AIProvider;
  model?: string;
  usage?: AIResponse["usage"];
}

const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
  groq: "Groq",
  claude: "Claude",
};

const PROVIDER_COLORS: Record<AIProvider, string> = {
  openai:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  gemini:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  groq: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  claude:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
};

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<AIProvider | "auto">("auto");
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const availableProviders = getAvailableProviders();
  const hasAnyProvider = availableProviders.length > 0;

  // Fetch credit balance on mount
  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/credits");
      if (res.ok) {
        const data = await res.json();
        setCreditsRemaining(data.remaining);
      }
    } catch {
      // Silently fail — credits display is non-critical
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await completeViaServer({
        prompt: trimmed,
        provider: provider === "auto" ? undefined : provider,
        tier: "cheap",
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.text,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update credit display from response
      if (response.creditsRemaining !== undefined) {
        setCreditsRemaining(response.creditsRemaining);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to get AI response"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 ring-1 ring-violet-500/20">
            <Bot className="h-4 w-4 text-violet-500" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AI Chat</h2>
            {!hasAnyProvider && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No API keys configured
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {creditsRemaining !== null && (
            <Badge
              variant="outline"
              className={`h-8 px-2.5 rounded-lg text-xs gap-1.5 ${
                creditsRemaining < 50
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              }`}
            >
              <Coins className="h-3.5 w-3.5" />
              {creditsRemaining}
            </Badge>
          )}
          <Select
            value={provider}
            onValueChange={(v) => setProvider(v as AIProvider | "auto")}
          >
            <SelectTrigger className="w-32 h-8 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              {availableProviders.map((p) => (
                <SelectItem key={p} value={p}>
                  {PROVIDER_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={clearChat}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 ring-1 ring-violet-500/20">
              <Sparkles className="h-8 w-8 text-violet-500" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium mb-1">
                Start a conversation
              </p>
              <p className="text-sm">
                Ask anything — coding, writing, analysis, brainstorming
              </p>
            </div>
            {!hasAnyProvider && (
              <Card className="p-5 mt-4 max-w-md text-sm border-border/50 rounded-xl">
                <p className="font-medium mb-3">To get started:</p>
                <p className="mb-2">
                  Add at least one API key to your{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    .env.local
                  </code>
                  :
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  <li>
                    <code className="text-foreground">
                      NEXT_PUBLIC_OPENAI_API_KEY
                    </code>
                  </li>
                  <li>
                    <code className="text-foreground">
                      NEXT_PUBLIC_GEMINI_API_KEY
                    </code>
                  </li>
                  <li>
                    <code className="text-foreground">
                      NEXT_PUBLIC_GROQ_API_KEY
                    </code>
                  </li>
                  <li>
                    <code className="text-foreground">
                      NEXT_PUBLIC_CLAUDE_API_KEY
                    </code>
                  </li>
                </ul>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-5 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : ""
                }`}
              >
                {msg.role === "assistant" && (
                  <Avatar className="h-8 w-8 shrink-0 ring-2 ring-violet-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                      <Bot className="h-4 w-4 text-violet-500" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] ${
                    msg.role === "user" ? "order-first" : ""
                  }`}
                >
                  <Card
                    className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap rounded-2xl ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-lg"
                        : "bg-card border-border/50 rounded-bl-lg"
                    }`}
                  >
                    {msg.content}
                  </Card>
                  {msg.provider && (
                    <div className="flex items-center gap-2 mt-1.5 px-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-5 px-1.5 rounded-full ${PROVIDER_COLORS[msg.provider]}`}
                      >
                        {PROVIDER_LABELS[msg.provider]}
                      </Badge>
                      {msg.model && (
                        <span className="text-[10px] text-muted-foreground">
                          {msg.model}
                        </span>
                      )}
                      {msg.usage && (
                        <span className="text-[10px] text-muted-foreground">
                          {msg.usage.totalTokens} tokens
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <Avatar className="h-8 w-8 shrink-0 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0 ring-2 ring-violet-500/20">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                    <Bot className="h-4 w-4 text-violet-500" />
                  </AvatarFallback>
                </Avatar>
                <Card className="px-4 py-3 rounded-2xl rounded-bl-lg border-border/50">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </Card>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="flex gap-2 pt-4 border-t border-border/50">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            hasAnyProvider
              ? "Type a message... (Enter to send, Shift+Enter for new line)"
              : "Configure an API key to start chatting..."
          }
          className="min-h-[52px] max-h-32 resize-none rounded-xl border-border/60 focus-visible:ring-primary/30"
          rows={2}
          disabled={!hasAnyProvider || isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || !hasAnyProvider}
          size="icon"
          className="h-[52px] w-[52px] shrink-0 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}