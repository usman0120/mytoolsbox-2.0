// ---------------------------------------------------------------------------
// AI Chat Store – Zustand state management with LocalStorage persistence
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChatConversation, ChatMessage } from "./types";
import { createNewConversation } from "./chat-persistence";

interface ChatStore {
  // Conversations
  conversations: ChatConversation[];
  activeConversationId: string | null;

  // UI State
  isSidebarOpen: boolean;
  isStreaming: boolean;
  selectedProvider: string;
  selectedModel: string;
  activePersonaId: string;
  customSystemPrompt: string;
  searchQuery: string;
  favoritePromptIds: string[];
  pendingPrompt: string | null;

  // Actions
  setConversations: (conversations: ChatConversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addConversation: (conversation?: ChatConversation) => string;
  updateConversation: (id: string, updates: Partial<ChatConversation>) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  pinConversation: (id: string) => void;
  archiveConversation: (id: string) => void;
  duplicateConversation: (id: string) => string;
  clearAllConversations: () => void;

  // Message Actions
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<ChatMessage>
  ) => void;
  setMessageFeedback: (
    conversationId: string,
    messageId: string,
    feedback: "like" | "dislike" | null
  ) => void;

  // UI Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setActivePersonaId: (personaId: string) => void;
  setCustomSystemPrompt: (prompt: string) => void;
  setSearchQuery: (query: string) => void;
  toggleFavoritePrompt: (promptId: string) => void;
  setPendingPrompt: (prompt: string | null) => void;

  // Helpers
  getActiveConversation: () => ChatConversation | undefined;
  getPinnedConversations: () => ChatConversation[];
  getFilteredConversations: () => ChatConversation[];
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isSidebarOpen: true,
      isStreaming: false,
      selectedProvider: "auto",
      selectedModel: "auto",
      activePersonaId: "general",
      customSystemPrompt: "",
      searchQuery: "",
      favoritePromptIds: ["code-1", "write-1", "biz-1", "edu-1"],
      pendingPrompt: null,

      setConversations: (conversations) => set({ conversations }),

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addConversation: (conversation) => {
        const state = get();
        const newConv =
          conversation ??
          createNewConversation(state.selectedProvider, state.selectedModel);
        newConv.personaId = state.activePersonaId;
        newConv.systemPrompt = state.customSystemPrompt;

        set({
          conversations: [newConv, ...state.conversations],
          activeConversationId: newConv.id,
        });
        return newConv.id;
      },

      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          ),
        })),

      deleteConversation: (id) =>
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id);
          return {
            conversations: filtered,
            activeConversationId:
              state.activeConversationId === id
                ? filtered[0]?.id ?? null
                : state.activeConversationId,
          };
        }),

      renameConversation: (id, title) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title: title.trim() || "Untitled Chat", updatedAt: Date.now() } : c
          ),
        })),

      pinConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c
          ),
        })),

      archiveConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isArchived: !c.isArchived } : c
          ),
        })),

      duplicateConversation: (id) => {
        const state = get();
        const original = state.conversations.find((c) => c.id === id);
        if (!original) return "";

        const copyId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const copyConv: ChatConversation = {
          ...original,
          id: copyId,
          title: `${original.title} (Copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isPinned: false,
          messages: original.messages.map((m) => ({
            ...m,
            id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          })),
        };

        set({
          conversations: [copyConv, ...state.conversations],
          activeConversationId: copyConv.id,
        });
        return copyConv.id;
      },

      clearAllConversations: () =>
        set({
          conversations: [],
          activeConversationId: null,
        }),

      addMessage: (conversationId, message) =>
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const updatedMessages = [...c.messages, message];
            const isFirstUserMsg =
              c.messages.filter((m) => m.role === "user").length === 0 &&
              message.role === "user";

            const newTitle =
              isFirstUserMsg && (!c.title || c.title === "New Chat")
                ? message.content.slice(0, 50).trim() +
                  (message.content.length > 50 ? "..." : "")
                : c.title;

            return {
              ...c,
              messages: updatedMessages,
              title: newTitle,
              updatedAt: Date.now(),
            };
          }),
        })),

      updateMessage: (conversationId, messageId, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, ...updates } : m
                  ),
                  updatedAt: Date.now(),
                }
              : c
          ),
        })),

      setMessageFeedback: (conversationId, messageId, feedback) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, feedback } : m
                  ),
                }
              : c
          ),
        })),

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      setStreaming: (streaming) => set({ isStreaming: streaming }),

      setProvider: (provider) => set({ selectedProvider: provider }),

      setModel: (model) => set({ selectedModel: model }),

      setActivePersonaId: (personaId) => set({ activePersonaId: personaId }),

      setCustomSystemPrompt: (prompt) => set({ customSystemPrompt: prompt }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      toggleFavoritePrompt: (promptId) =>
        set((state) => {
          const exists = state.favoritePromptIds.includes(promptId);
          return {
            favoritePromptIds: exists
              ? state.favoritePromptIds.filter((id) => id !== promptId)
              : [...state.favoritePromptIds, promptId],
          };
        }),

      setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),

      getActiveConversation: () => {
        const state = get();
        return state.conversations.find(
          (c) => c.id === state.activeConversationId
        );
      },

      getPinnedConversations: () => {
        return get().conversations.filter((c) => c.isPinned && !c.isArchived);
      },

      getFilteredConversations: () => {
        const state = get();
        const query = state.searchQuery.toLowerCase().trim();
        const nonArchived = state.conversations.filter((c) => !c.isArchived);
        if (!query) {
          return nonArchived.sort((a, b) => b.updatedAt - a.updatedAt);
        }
        return nonArchived
          .filter(
            (c) =>
              c.title.toLowerCase().includes(query) ||
              c.messages.some((m) => m.content.toLowerCase().includes(query))
          )
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },
    }),
    {
      name: "mytoolsbox_ai_chat_store_v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
        activePersonaId: state.activePersonaId,
        customSystemPrompt: state.customSystemPrompt,
        favoritePromptIds: state.favoritePromptIds,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);