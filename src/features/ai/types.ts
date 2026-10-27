// ---------------------------------------------------------------------------
// AI Chat Types – conversations, messages, and the prompt library
// ---------------------------------------------------------------------------

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  provider: string;
  model?: string;
  // Legacy export fields only; no persona selection or behavior remains.
  personaId?: string;
  systemPrompt?: string;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: number;
  isStreaming?: boolean;
  feedback?: "like" | "dislike" | null;
}

export interface PromptCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface PromptTemplate {
  id: string;
  categoryId: string;
  title: string;
  prompt: string;
  description: string;
  tags: string[];
  isFavorite?: boolean;
  placeholders?: string[];
  suggestedModel?: string;
}

export interface ChatState {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  isSidebarOpen: boolean;
  isStreaming: boolean;
  selectedProvider: string;
  selectedModel: string;
  searchQuery: string;
  favoritePromptIds: string[];
  pendingPrompt: string | null;
}
