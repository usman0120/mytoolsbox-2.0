"use client";

import { useState, useCallback, useRef, useEffect, useSyncExternalStore } from "react";
import {
  Send, Copy, Trash2, Loader2, Download, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCredits } from "@/lib/credits/use-credits";
import { completeViaServer } from "@/lib/ai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const STORAGE_KEY = "mytoolsbox-ai-chat";
const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function loadMessages(): { messages: Message[]; storageError: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { messages: [], storageError: null };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((message) =>
      message && typeof message.id === "string" &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      typeof message.timestamp === "number" && Number.isFinite(new Date(message.timestamp).getTime())
    )) throw new Error("Invalid saved chat");
    return { messages: parsed, storageError: null };
  } catch {
    return { messages: [], storageError: "Saved chat could not be read. Existing data is unchanged; this conversation will stay in memory." };
  }
}

function saveMessages(messages: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    toast.error("Chat cannot be saved on this device. Your conversation remains available here.");
  }
}

export function AITextGeneratorEngine() {
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const [savedChat] = useState(loadMessages);
  const [messages, setMessages] = useState<Message[]>(savedChat.messages);
  const visibleMessages = hydrated ? messages : [];
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<Message | null>(null);
  const historyChangedRef = useRef(false);
  const sendingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { refresh } = useCredits();

  useEffect(() => {
    if (historyChangedRef.current && !savedChat.storageError) saveMessages(messages);
  }, [messages, savedChat.storageError]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async (retryMessage?: Message) => {
    const text = retryMessage?.content ?? input.trim();
    if (!text || sendingRef.current) return;
    sendingRef.current = true;

    const userMsg: Message = {
      id: Date.now().toString(36),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    historyChangedRef.current = true;
    if (!retryMessage) setMessages((prev) => [...prev, userMsg]);
    setError(null);
    setIsLoading(true);

    try {
      const history = retryMessage ? messages.filter((message) => message.id !== retryMessage.id) : messages;
      const contextHistory = history.slice(-4).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
      const fullPrompt = contextHistory ? `${contextHistory}\nUser: ${text}\nAssistant:` : text;

      const aiRes = await completeViaServer({
        systemPrompt: "You are a helpful, brilliant, concise, and friendly AI assistant. Format explanations clearly with markdown.",
        prompt: fullPrompt,
        tier: "cheap",
        operation: "chat_message",
        temperature: 0.7,
      });

      const responseText = aiRes?.text?.trim();
      if (!responseText) throw new Error("The AI provider returned an empty response. No reply was generated.");

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(36),
        role: "assistant",
        content: responseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setInput("");
      setFailedMessage(null);
      try {
        await refresh();
      } catch {
        toast.error("Reply received, but the credit balance could not be refreshed.");
      }
    } catch (failure) {
      const detail = failure instanceof Error ? failure.message : "The AI request failed. Please try again.";
      const status = typeof failure === "object" && failure !== null && "status" in failure ? Number(failure.status) : undefined;
      if (status === 401 || /\b401\b|authentication required/i.test(detail)) setError("Sign in to send AI messages (401).");
      else if (status === 402 || /\b402\b|insufficient credits/i.test(detail)) setError("Insufficient credits for this request (402).");
      else if (status === 429 || /\b429\b|too many|rate limit/i.test(detail)) setError("Too many requests (429). Please wait before retrying.");
      else if (status === 503 || /\b503\b|no ai providers?|no ai provider available/i.test(detail)) setError("AI service unavailable (503). Please try again later.");
      else setError(detail);
      setFailedMessage(retryMessage ?? userMsg);
    } finally {
      sendingRef.current = false;
      setIsLoading(false);
    }
  }, [input, messages, refresh]);

  const handleClear = useCallback(() => {
    if (sendingRef.current) return;
    historyChangedRef.current = true;
    setMessages([]);
    setError(null);
    setFailedMessage(null);
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
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend(failedMessage?.content === input.trim() ? failedMessage : undefined);
    }
  };

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-medium">AI Chat</h2>
          <span className="text-xs text-muted-foreground">{visibleMessages.length} messages</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" aria-label="Export chat" title="Export chat" onClick={handleExport} className="size-11" disabled={visibleMessages.length === 0}>
            <Download className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Clear chat" title="Clear chat" onClick={handleClear} className="size-11 text-destructive" disabled={visibleMessages.length === 0 || isLoading}>
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {hydrated && savedChat.storageError && <p role="alert" className="text-sm text-destructive">{savedChat.storageError}</p>}
      <div role="log" aria-label="Chat history" aria-busy={isLoading} className="min-h-48 max-h-96 overflow-y-auto border-b py-2">
          {visibleMessages.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            visibleMessages.map((msg) => (
              <article key={msg.id} aria-label={msg.role === "user" ? "Your message" : "AI reply"} className="min-w-0 border-b py-3 last:border-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{msg.role === "user" ? "You" : "AI"}</span>
                    <time dateTime={new Date(msg.timestamp).toISOString()}>{new Date(msg.timestamp).toLocaleTimeString()}</time>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={msg.role === "user" ? "Copy your message" : "Copy AI reply"}
                      title="Copy message"
                      className="ml-auto size-11 shrink-0"
                      onClick={() => handleCopy(msg.content)}
                    >
                      <Copy className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                  <div className="whitespace-pre-wrap wrap-anywhere text-sm">{msg.content}</div>
              </article>
            ))
          )}
          {isLoading && (
            <p role="status" className="flex items-center gap-2 py-3 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />Waiting for reply...</p>
          )}
          <div ref={messagesEndRef} />
      </div>

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-destructive">
          <p className="min-w-0 wrap-anywhere">{error}</p>
          <Button variant="outline" size="sm" className="min-h-11" disabled={isLoading} onClick={() => failedMessage && handleSend(failedMessage)}><RotateCcw className="size-4" aria-hidden="true" />Retry</Button>
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          ref={inputRef}
          aria-label="Message"
          placeholder="Type your message..."
          className="min-w-0 min-h-12 max-h-30 resize-y"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <Button
          onClick={() => handleSend(failedMessage?.content === input.trim() ? failedMessage : undefined)}
          size="icon"
          aria-label="Send message"
          title="Send message"
          className="size-12 shrink-0"
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <Send className="size-5" aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  );
}