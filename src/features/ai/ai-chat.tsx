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
import { toast } from "sonner";
import { subscribeConversations } from "./chat-persistence";
import type { ChatMessage } from "./types";
import type { AIProvider } from "@/lib/ai";

const DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant. Provide accurate, clear responses in US English, formatted with markdown.";

export function AIChat() {
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
    setModel,
    updateConversation,
    isStreaming,
    setStreaming,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [creditBalance, setCreditBalance] = useState<{ uid: string; remaining: number } | null>(null);
  const creditsRemaining = creditBalance?.uid === user?.uid ? creditBalance?.remaining ?? null : null;
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const requestRef = useRef<{ cancelled: boolean; conversationId: string; messageId: string } | null>(null);

  useEffect(() => () => {
    const request = requestRef.current;
    if (request) {
      request.cancelled = true;
      updateMessage(request.conversationId, request.messageId, { content: "Stopped waiting for the response. The server request may still complete and use credits.", isStreaming: false });
      setStreaming(false);
    }
  }, [setStreaming, updateMessage]);


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
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch("/api/ai/credits", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && typeof data.remaining === "number") {
            setCreditBalance({ uid: user.uid, remaining: data.remaining });
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
    const refreshCredits = () => { void fetchCredits(); };
    window.addEventListener("credits-updated", refreshCredits);

    return () => {
      cancelled = true;
      window.removeEventListener("credits-updated", refreshCredits);
    };
  }, [user]);


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
      toast.info("Please sign in to chat with AI.", {
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

    const systemPrompt = DEFAULT_SYSTEM_PROMPT;

    // Build context history
    const contextMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: trimmed },
    ];

    const request = { cancelled: false, conversationId: convId, messageId: assistantMsgId };
    requestRef.current = request;

    try {
      const providerArg =
        selectedProvider === "auto" ? undefined : (selectedProvider as AIProvider);

      const response = await completeViaServer({
        prompt: JSON.stringify(contextMessages),
        systemPrompt,
        provider: providerArg,
        model: selectedModel === "auto" ? undefined : selectedModel || undefined,
        tier: "cheap",
      });
      if (request.cancelled) return;
      if (typeof response.text !== "string" || !response.text.trim()) throw new Error("The provider returned an empty response.");

      updateMessage(convId, assistantMsgId, {
        content: response.text,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
        isStreaming: false,
      });

      if (response.creditsRemaining !== undefined) {
        setCreditBalance({ uid: user.uid, remaining: response.creditsRemaining });
      }
    } catch (error) {
      if (request.cancelled) return;
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
        content: `Unable to complete response: ${errMsg}`,
        isStreaming: false,
      });
    } finally {
      if (requestRef.current === request) {
        setStreaming(false);
        requestRef.current = null;
      }
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = async () => {
    if (!activeConv || messages.length === 0 || isStreaming) return;
    if (!user) { setShowSignInDialog(true); return; }

    // Find last user message
    const lastUserIndex = [...messages]
      .reverse()
      .findIndex((m) => m.role === "user");

    if (lastUserIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserIndex;

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

    const request = { cancelled: false, conversationId: activeConv.id, messageId: assistantMsgId };
    requestRef.current = request;

    try {
      const providerArg =
        selectedProvider === "auto" ? undefined : (selectedProvider as AIProvider);

      const response = await completeViaServer({
        prompt: JSON.stringify(messages.slice(0, actualIndex + 1).map(({ role, content }) => ({ role, content }))),
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        provider: providerArg,
        model: selectedModel === "auto" ? undefined : selectedModel || undefined,
        tier: "cheap",
      });
      if (request.cancelled) return;
      if (typeof response.text !== "string" || !response.text.trim()) throw new Error("The provider returned an empty response.");

      updateMessage(activeConv.id, assistantMsgId, {
        content: response.text,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
        isStreaming: false,
      });

      if (response.creditsRemaining !== undefined) {
        setCreditBalance({ uid: user.uid, remaining: response.creditsRemaining });
      }
      toast.success("Response regenerated");
    } catch (error) {
      if (request.cancelled) return;
      const errMsg =
        error instanceof Error ? error.message : "Failed to regenerate";
      toast.error(errMsg);
      updateMessage(activeConv.id, assistantMsgId, {
        content: `Unable to regenerate: ${errMsg}`,
        isStreaming: false,
      });
    } finally {
      if (requestRef.current === request) {
        setStreaming(false);
        requestRef.current = null;
      }
    }
  };

  const handleStop = () => {
    const request = requestRef.current;
    if (!request) return;
    request.cancelled = true;
    updateMessage(request.conversationId, request.messageId, { content: "Stopped waiting for the response. The server request may still complete and use credits.", isStreaming: false });
    requestRef.current = null;
    setStreaming(false);
    toast.info("Stopped waiting. The server request may still use credits.");
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

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden">
      {/* Left Collapsible History Sidebar */}
      <ChatSidebar
        creditsRemaining={creditsRemaining}
        onNewChat={handleNewChat}
      />

      {/* Main Conversation Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
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
            setModel("auto");
            if (activeConv) {
              updateConversation(activeConv.id, { provider: p });
            }
          }}
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
