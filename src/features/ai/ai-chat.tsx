"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useChatStore } from "./chat-store";
import { ChatSidebar } from "./components/chat-sidebar";
import { ChatHeader } from "./components/chat-header";
import { ChatMessages } from "./components/chat-messages";
import { ChatInput } from "./components/chat-input";
import { SignInDialog } from "@/components/auth/signin-dialog";
import { completeViaServer } from "@/lib/ai";
import { AI_PERSONAS } from "./prompt-library-data";
import { toast } from "sonner";
import { subscribeConversations } from "./chat-persistence";
import type { ChatMessage, ChatConversation } from "./types";
import type { AIProvider } from "@/lib/ai";

interface AIChatProps {
  onOpenPromptLibrary?: () => void;
}

export function AIChat({ onOpenPromptLibrary }: AIChatProps) {
  const { user } = useAuth();
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    addConversation,
    getActiveConversation,
    toggleSidebar,
    addMessage,
    updateMessage,
    setMessageFeedback,
    selectedProvider,
    setProvider,
    selectedModel,
    activePersonaId,
    setActivePersonaId,
    updateConversation,
    pendingPrompt,
    setPendingPrompt,
    isStreaming,
    setStreaming,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync conversations with Firestore for authenticated users across domains & devices
  useEffect(() => {
    if (!user || user.isAnonymous) return;
    const uid = user.uid;

    // Initial bidirectional sync (uploads local un-synced chats, pulls remote chats)
    useChatStore.getState().syncWithFirestore(uid);

    // Real-time Firestore subscription
    const unsubscribe = subscribeConversations(uid, (cloudConvs) => {
      if (useChatStore.getState().isStreaming) return;
      const state = useChatStore.getState();
      const deletedSet = new Set(state.deletedConversationIds || []);

      // Filter out any chats the user deleted
      const validCloudConvs = cloudConvs.filter((c) => !deletedSet.has(c.id));
      const current = state.conversations.filter((c) => !deletedSet.has(c.id));
      const currentMap = new Map(current.map((c) => [c.id, c]));
      let hasChanges = false;

      const merged = validCloudConvs.map((c) => {
        const loc = currentMap.get(c.id);
        if (!loc || (c.updatedAt && c.updatedAt > loc.updatedAt)) {
          hasChanges = true;
          return c;
        }
        return loc;
      });

      // Only preserve brand-new local chats (< 5 seconds old) that haven't hit the cloud yet
      const now = Date.now();
      for (const loc of current) {
        if (!validCloudConvs.some((c) => c.id === loc.id) && now - (loc.createdAt || 0) < 5000) {
          merged.push(loc);
        }
      }

      const sorted = merged.sort((a, b) => b.updatedAt - a.updatedAt);
      if (hasChanges || validCloudConvs.length !== current.length) {
        useChatStore.getState().setConversations(sorted);
        if (!useChatStore.getState().activeConversationId && sorted.length > 0) {
          useChatStore.getState().setActiveConversation(sorted[0].id);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch initial credits & available providers on mount
  useEffect(() => {
    let cancelled = false;

    // Check credits
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/ai/credits");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.remaining !== undefined) {
            setCreditsRemaining(data.remaining);
          }
        }
      } catch {
        // Silently ignore if not signed in or offline
      }
    };

    // Check available providers from server health endpoint
    const fetchProviders = async () => {
      try {
        const res = await fetch("/api/ai");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data.providers)) {
            setAvailableProviders(data.providers);
          }
        }
      } catch {
        // Fallback
      }
    };

    fetchCredits();
    fetchProviders();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Handle pending prompt from prompt library or quick cards
  useEffect(() => {
    if (pendingPrompt) {
      setInput(pendingPrompt);
      setPendingPrompt(null);
    }
  }, [pendingPrompt, setPendingPrompt]);

  // Ensure active conversation exists or initialize one if empty
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversation(conversations[0].id);
    }
  }, [activeConversationId, conversations, setActiveConversation]);

  // Global productivity keyboard shortcuts: Ctrl/Cmd + B for sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const activeConv = getActiveConversation();
  const messages = activeConv?.messages || [];

  // Start a new chat
  const handleNewChat = useCallback(() => {
    const newId = addConversation();
    setInput("");
    return newId;
  }, [addConversation]);

  // Send message
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    if (!user) {
      setShowSignInDialog(true);
      toast.info("Please sign in to chat with AI. You will receive 1,000 free credits every month!", {
        duration: 5000,
      });
      return;
    }

    let convId = activeConversationId;
    if (!convId || !activeConv) {
      convId = handleNewChat();
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    addMessage(convId, userMessage);
    setInput("");
    setStreaming(true);

    const assistantMsgId = `msg_${Date.now()}_a`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      provider: selectedProvider,
      model: selectedModel,
      timestamp: Date.now(),
      isStreaming: true,
    };

    addMessage(convId, initialAssistantMessage);

    // Get persona system prompt
    const persona =
      AI_PERSONAS.find((p) => p.id === activePersonaId) || AI_PERSONAS[0];
    const systemPrompt = activeConv?.systemPrompt || persona.systemPrompt;

    // Build context history
    const contextMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: trimmed },
    ];

    abortControllerRef.current = new AbortController();

    try {
      const providerArg =
        selectedProvider === "auto" ? undefined : (selectedProvider as AIProvider);

      const response = await completeViaServer({
        prompt: trimmed,
        systemPrompt,
        provider: providerArg,
        tier: "cheap",
      });

      updateMessage(convId, assistantMsgId, {
        content: response.text,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
        isStreaming: false,
      });

      if (response.creditsRemaining !== undefined) {
        setCreditsRemaining(response.creditsRemaining);
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Failed to get AI response";

      // If user is guest and server returned 401/insufficient credits, offer friendly sign in
      if (!user && (errMsg.includes("Authentication") || errMsg.includes("Sign in"))) {
        toast.error("Please sign in to chat with AI models.", {
          action: {
            label: "Sign In",
            onClick: () => setShowSignInDialog(true),
          },
        });
      } else {
        toast.error(errMsg);
      }

      updateMessage(convId, assistantMsgId, {
        content: `⚠️ **Unable to complete response:** ${errMsg}\n\n*Please ensure your API key or account credits are valid.*`,
        isStreaming: false,
      });
    } finally {
      setStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = async () => {
    if (!activeConv || messages.length === 0 || isStreaming) return;

    // Find last user message
    const lastUserIndex = [...messages]
      .reverse()
      .findIndex((m) => m.role === "user");

    if (lastUserIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserIndex;
    const userPrompt = messages[actualIndex].content;

    setStreaming(true);

    const assistantMsgId = `msg_${Date.now()}_regen`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      provider: selectedProvider,
      model: selectedModel,
      timestamp: Date.now(),
      isStreaming: true,
    };

    addMessage(activeConv.id, initialAssistantMessage);

    const persona =
      AI_PERSONAS.find((p) => p.id === activePersonaId) || AI_PERSONAS[0];

    try {
      const providerArg =
        selectedProvider === "auto" ? undefined : (selectedProvider as AIProvider);

      const response = await completeViaServer({
        prompt: userPrompt,
        systemPrompt: persona.systemPrompt,
        provider: providerArg,
        tier: "cheap",
      });

      updateMessage(activeConv.id, assistantMsgId, {
        content: response.text,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
        isStreaming: false,
      });

      if (response.creditsRemaining !== undefined) {
        setCreditsRemaining(response.creditsRemaining);
      }
      toast.success("Response regenerated");
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Failed to regenerate";
      toast.error(errMsg);
      updateMessage(activeConv.id, assistantMsgId, {
        content: `⚠️ ${errMsg}`,
        isStreaming: false,
      });
    } finally {
      setStreaming(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStreaming(false);
    toast.info("Generation stopped");
  };

  const handleFeedback = (messageId: string, feedback: "like" | "dislike") => {
    if (!activeConv) return;
    setMessageFeedback(activeConv.id, messageId, feedback);
    toast.success(
      feedback === "like"
        ? "Thank you for the positive feedback!"
        : "Feedback noted. We'll improve future responses."
    );
  };

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-none sm:rounded-2xl md:rounded-3xl border-0 sm:border border-border/60 bg-card/40">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs font-medium">Loading Chat Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full border-0 sm:border sm:border-border/60 rounded-none sm:rounded-2xl md:rounded-3xl overflow-hidden bg-card/40 shadow-xl backdrop-blur-xs">
      {/* Left Collapsible History Sidebar */}
      <ChatSidebar
        creditsRemaining={creditsRemaining}
        onNewChat={handleNewChat}
      />

      {/* Main Conversation Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/50">
        {/* Top Header */}
        <ChatHeader
          creditsRemaining={creditsRemaining}
          onNewChat={handleNewChat}
          availableProviders={availableProviders}
        />

        {/* Message Stream */}
        <ChatMessages
          messages={messages}
          isLoading={isStreaming}
          onSelectPrompt={(text) => {
            setInput(text);
          }}
          onRegenerate={handleRegenerate}
          onFeedback={handleFeedback}
          onOpenPromptLibrary={onOpenPromptLibrary}
        />

        {/* Bottom Gemini Floating Capsule Input Area */}
        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isStreaming}
          onSend={handleSend}
          onStop={handleStop}
          onClear={() => setInput("")}
          selectedProvider={selectedProvider}
          availableProviders={availableProviders}
          onProviderChange={(p) => {
            setProvider(p);
            if (activeConv) {
              updateConversation(activeConv.id, { provider: p });
            }
          }}
          activePersonaId={activePersonaId}
          onPersonaChange={(pId) => {
            setActivePersonaId(pId);
            if (activeConv) {
              updateConversation(activeConv.id, { personaId: pId });
            }
          }}
          onOpenPromptLibrary={onOpenPromptLibrary}
        />
      </div>

      {/* Sign In Dialog */}
      <SignInDialog
        open={showSignInDialog}
        onOpenChange={setShowSignInDialog}
      />
    </div>
  );
}