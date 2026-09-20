"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  MessageSquare, Send, Copy, Check, Trash2, Loader2,
  Sparkles, User, Bot, Download, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const STORAGE_KEY = "mytoolsbox-ai-chat";

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: Message[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
}

// Client-side AI response generator using pattern matching and templates
function generateResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  // Greetings
  if (/^(hi|hello|hey|greetings|good morning|good evening)/.test(msg)) {
    const greetings = [
      "Hello! 👋 How can I help you today?",
      "Hi there! What can I assist you with?",
      "Hey! I'm here to help. What do you need?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Help
  if (/help|what can you do|capabilities/i.test(msg)) {
    return "I can help you with:\n\n• **Writing** - essays, emails, stories, summaries\n• **Coding** - explain code, debug, write functions\n• **Learning** - explain concepts, answer questions\n• **Creative** - brainstorm ideas, generate content\n• **Analysis** - review text, provide feedback\n\nJust ask me anything!";
  }

  // Code related
  if (/code|programming|function|bug|error|debug|javascript|python|react|typescript/i.test(msg)) {
    return "I'd be happy to help with coding! Here are some things I can do:\n\n• Explain how code works\n• Help debug issues\n• Suggest improvements\n• Write code snippets\n\nCould you share the specific code or describe the problem you're working on?";
  }

  // Writing
  if (/write|essay|article|blog|story|poem|email|letter/i.test(msg)) {
    return "I can help you write that! To give you the best result, could you tell me:\n\n• What's the topic?\n• What's the tone? (formal, casual, persuasive)\n• How long should it be?\n• Any specific points to include?";
  }

  // Math
  if (/math|calculate|equation|solve|formula/i.test(msg)) {
    return "I can help with math problems! Try our **Math Solver** or **Scientific Calculator** tools for step-by-step solutions. Or describe the problem and I'll walk you through it.";
  }

  // Summary
  if (/summarize|summary|tldr|sum up/i.test(msg)) {
    return "I can summarize text for you! Try our **Text Summarizer** tool for quick summaries, or paste the text here and I'll give you the key points.";
  }

  // Thank you
  if (/thank|thanks|thx|appreciate/i.test(msg)) {
    return "You're welcome! 😊 Is there anything else I can help with?";
  }

  // Default responses
  const defaults = [
    "That's an interesting question! Let me think about it... Could you provide a bit more context so I can give you a better answer?",
    "I understand you're asking about that. Here's what I know: this is a great topic to explore. What specific aspect are you most interested in?",
    "Great question! While I can help with many topics, could you be more specific about what you're looking for? That way I can give you the most helpful response.",
    "I'd love to help with that! To give you the best answer, could you share a few more details about what you need?",
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export function AITextGeneratorEngine() {
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(36),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate AI thinking time
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    const response = generateResponse(text);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(36),
      role: "assistant",
      content: response,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);
  }, [input, isLoading]);

  const handleClear = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Chat cleared.");
  }, []);

  const handleExport = useCallback(() => {
    const text = messages
      .map((m) => `[${m.role === "user" ? "You" : "AI"}] ${new Date(m.timestamp).toLocaleTimeString()}\n${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported!");
  }, [messages]);

  const handleCopy = useCallback(async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied!");
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 gap-1">
            <Sparkles className="h-3 w-3" /> AI Chat
          </Badge>
          <span className="text-xs text-muted-foreground">
            {messages.length} messages
          </span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleExport} className="gap-1 h-7" disabled={messages.length === 0}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1 h-7 text-destructive" disabled={messages.length === 0}>
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </div>

      {/* Messages */}
      <Card className="min-h-[400px] max-h-[500px] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium mb-1">AI Chat Assistant</p>
                <p className="text-xs">Ask me anything! I can help with writing, coding, learning, and more.</p>
                <div className="flex gap-2 mt-4 flex-wrap justify-center">
                  {["Write a poem", "Explain recursion", "Summarize text", "Debug my code"].map((s) => (
                    <Button
                      key={s}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-violet-500" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] opacity-60">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-40 hover:opacity-100"
                      onClick={() => handleCopy(msg.content)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-violet-500" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          ref={inputRef}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          className="min-h-[50px] max-h-[120px] resize-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          size="icon"
          className="h-[50px] w-[50px] shrink-0"
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}