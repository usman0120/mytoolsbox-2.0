// ---------------------------------------------------------------------------
// AI Chat Types – conversation, message, prompt library, personas, comparisons
// ---------------------------------------------------------------------------

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  provider: string;
  model?: string;
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

export interface AIPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  iconName: string;
  gradient: string;
  iconColor: string;
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

export interface CompareModelOption {
  id: string;
  provider: string;
  model: string;
  name: string;
  badge: string;
}

export interface CompareResult {
  provider: string;
  model: string;
  text: string;
  latencyMs: number;
  usage?: {
    totalTokens: number;
  };
  isLoading: boolean;
  error?: string;
}

export interface ChatState {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  isSidebarOpen: boolean;
  isStreaming: boolean;
  selectedProvider: string;
  selectedModel: string;
  activePersonaId: string;
  customSystemPrompt: string;
  searchQuery: string;
  favoritePromptIds: string[];
  pendingPrompt: string | null;
}