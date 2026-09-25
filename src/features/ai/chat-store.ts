// ---------------------------------------------------------------------------
// AI Chat Store – Zustand state management with LocalStorage & Firestore persistence
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChatConversation, ChatMessage } from "./types";
import {
  createNewConversation,
  fetchConversations,
  saveConversation,
  deleteConversation as deleteRemoteConversation,
  deleteAllConversations as deleteRemoteAllConversations,
} from "./chat-persistence";
import { getFirebaseAuth } from "@/lib/firebase";

function getCurrentUserId(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const auth = getFirebaseAuth();
    return auth?.currentUser?.uid ?? null;
  } catch {
    return null;
  }
}

interface ChatStore {
  // Conversations
  conversations: ChatConversation[];
  deletedConversationIds: string[];
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
  syncWithFirestore: (userId: string) => Promise<void>;

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
      deletedConversationIds: [],
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
          deletedConversationIds: (state.deletedConversationIds || []).filter((id) => id !== newConv.id),
          activeConversationId: newConv.id,
        });

        const uid = getCurrentUserId();
        if (uid) {
          saveConversation(uid, newConv).catch(() => {});
        }

        return newConv.id;
      },

      updateConversation: (id, updates) => {
        set((state) => {
          const next = state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          );
          const updatedConv = next.find((c) => c.id === id);
          const uid = getCurrentUserId();
          if (uid && updatedConv) {
            saveConversation(uid, updatedConv).catch(() => {});
          }
          return { conversations: next };
        });
      },

      deleteConversation: (id) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id);
          const nextDeleted = Array.from(new Set([...(state.deletedConversationIds || []), id]));
          const uid = getCurrentUserId();
          if (uid) {
            deleteRemoteConversation(uid, id).catch(() => {});
          }
          return {
            conversations: filtered,
            deletedConversationIds: nextDeleted,
            activeConversationId:
              state.activeConversationId === id
                ? filtered[0]?.id ?? null
                : state.activeConversationId,
          };
        });
      },

      renameConversation: (id, title) => {
        set((state) => {
          const next = state.conversations.map((c) =>
            c.id === id ? { ...c, title: title.trim() || "Untitled Chat", updatedAt: Date.now() } : c
          );
          const updatedConv = next.find((c) => c.id === id);
          const uid = getCurrentUserId();
          if (uid && updatedConv) {
            saveConversation(uid, updatedConv).catch(() => {});
          }
          return { conversations: next };
        });
      },

      pinConversation: (id) => {
        set((state) => {
          const next = state.conversations.map((c) =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c
          );
          const updatedConv = next.find((c) => c.id === id);
          const uid = getCurrentUserId();
          if (uid && updatedConv) {
            saveConversation(uid, updatedConv).catch(() => {});
          }
          return { conversations: next };
        });
      },

      archiveConversation: (id) => {
        set((state) => {
          const next = state.conversations.map((c) =>
            c.id === id ? { ...c, isArchived: !c.isArchived } : c
          );
          const updatedConv = next.find((c) => c.id === id);
          const uid = getCurrentUserId();
          if (uid && updatedConv) {
            saveConversation(uid, updatedConv).catch(() => {});
          }
          return { conversations: next };
        });
      },

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

        const uid = getCurrentUserId();
        if (uid) {
          saveConversation(uid, copyConv).catch(() => {});
        }

        return copyConv.id;
      },

      clearAllConversations: () => {
        const state = get();
        const allIds = state.conversations.map((c) => c.id);
        const nextDeleted = Array.from(new Set([...(state.deletedConversationIds || []), ...allIds]));
        const uid = getCurrentUserId();
        if (uid) {
          deleteRemoteAllConversations(uid).catch(() => {});
        }
        set({
          conversations: [],
          deletedConversationIds: nextDeleted,
          activeConversationId: null,
        });
      },

      syncWithFirestore: async (userId: string) => {
        if (!userId) return;
        try {
          const remoteConvs = await fetchConversations(userId);
          const state = get();
          const deletedSet = new Set(state.deletedConversationIds || []);

          // Purge any deleted conversations from remote Firestore
          for (const r of remoteConvs) {
            if (deletedSet.has(r.id)) {
              deleteRemoteConversation(userId, r.id).catch(() => {});
            }
          }

          // Filter out deleted conversations from remote and local
          const validRemoteConvs = remoteConvs.filter((c) => !deletedSet.has(c.id));
          const localConvs = state.conversations.filter((c) => !deletedSet.has(c.id));

          const remoteMap = new Map(validRemoteConvs.map((c) => [c.id, c]));

          // Save local un-synced conversations to Firestore
          for (const local of localConvs) {
            if (!remoteMap.has(local.id)) {
              await saveConversation(userId, local).catch(() => {});
            }
          }

          // Merge: remote takes precedence if newer, else local
          const mergedMap = new Map<string, ChatConversation>();
          for (const r of validRemoteConvs) {
            mergedMap.set(r.id, r);
          }
          for (const l of localConvs) {
            const existing = mergedMap.get(l.id);
            if (!existing || (l.updatedAt && l.updatedAt > existing.updatedAt)) {
              mergedMap.set(l.id, l);
            }
          }

          const merged = Array.from(mergedMap.values())
            .filter((c) => !deletedSet.has(c.id))
            .sort((a, b) => b.updatedAt - a.updatedAt);

          set({ conversations: merged });
          if (!get().activeConversationId && merged.length > 0) {
            set({ activeConversationId: merged[0].id });
          }
        } catch (err) {
          console.warn("Failed to sync conversations with Firestore:", err);
        }
      },

      addMessage: (conversationId, message) => {
        set((state) => {
          let updatedConv: ChatConversation | undefined;
          const next = state.conversations.map((c) => {
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

            updatedConv = {
              ...c,
              messages: updatedMessages,
              title: newTitle,
              updatedAt: Date.now(),
            };
            return updatedConv;
          });

          const uid = getCurrentUserId();
          if (uid && updatedConv) {
            saveConversation(uid, updatedConv).catch(() => {});
          }

          return { conversations: next };
        });
      },

      updateMessage: (conversationId, messageId, updates) => {
        set((state) => {
          let updatedConv: ChatConversation | undefined;
          const next = state.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            updatedConv = {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, ...updates } : m
              ),
              updatedAt: Date.now(),
            };
            return updatedConv;
          });

          const uid = getCurrentUserId();
          if (uid && updatedConv && !get().isStreaming) {
            saveConversation(uid, updatedConv).catch(() => {});
          }

          return { conversations: next };
        });
      },

      setMessageFeedback: (conversationId, messageId, feedback) => {
        set((state) => {
          let updatedConv: ChatConversation | undefined;
          const next = state.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            updatedConv = {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, feedback } : m
              ),
            };
            return updatedConv;
          });

          const uid = getCurrentUserId();
          if (uid && updatedConv) {
            saveConversation(uid, updatedConv).catch(() => {});
          }

          return { conversations: next };
        });
      },

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
        deletedConversationIds: state.deletedConversationIds || [],
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