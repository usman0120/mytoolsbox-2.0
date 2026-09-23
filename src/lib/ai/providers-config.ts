// ---------------------------------------------------------------------------
// AI Providers Central Configuration & Dynamic Registry
// ---------------------------------------------------------------------------
// Defines all supported AI providers, model mappings, environment variables,
// and UI display metadata so that adding new API keys automatically makes
// them available across the UI without modifying components.
// ---------------------------------------------------------------------------

export interface AIProviderConfig {
  id: string;
  name: string;
  badge: string;
  modelLabel: string;
  description: string;
  envKeys: string[];
  color: string;
  tagline: string;
}

export const SUPPORTED_PROVIDERS: AIProviderConfig[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    badge: "Gemini",
    modelLabel: "Gemini 3 Flash",
    description: "Gemini 3 Flash • Fast, smart & multimodal reasoning",
    tagline: "Google's state-of-the-art multimodal model",
    envKeys: ["GEMINI_API_KEY", "NEXT_PUBLIC_GEMINI_API_KEY"],
    color: "text-blue-500",
  },
  {
    id: "groq",
    name: "Groq LPU Engine",
    badge: "Groq",
    modelLabel: "Groq GPT-OSS",
    description: "GPT-OSS 20B/120B • Ultra-fast LPU inference",
    tagline: "Lightning-fast responses powered by Groq LPUs",
    envKeys: ["GROQ_API_KEY", "NEXT_PUBLIC_GROQ_API_KEY"],
    color: "text-orange-500",
  },
  {
    id: "openai",
    name: "OpenAI",
    badge: "GPT-4o",
    modelLabel: "GPT-4o Mini",
    description: "GPT-4o Mini • High accuracy general purpose model",
    tagline: "Industry-standard accuracy for coding and creative tasks",
    envKeys: ["OPENAI_API_KEY"],
    color: "text-emerald-500",
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    badge: "Claude",
    modelLabel: "Claude 3.5 Haiku",
    description: "Claude 3.5 Haiku • Nuanced writing, coding & reasoning",
    tagline: "Anthropic's flagship for safety and natural dialogue",
    envKeys: ["CLAUDE_API_KEY"],
    color: "text-purple-500",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    badge: "DeepSeek",
    modelLabel: "DeepSeek Reasoner",
    description: "DeepSeek Reasoner / V3 • Open weights reasoning powerhouse",
    tagline: "High-performance reasoning and mathematical problem solving",
    envKeys: ["DEEPSEEK_API_KEY"],
    color: "text-cyan-500",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    badge: "Mistral",
    modelLabel: "Mistral Small",
    description: "Mistral Small • Efficient & balanced European LLM",
    tagline: "Fast and lightweight open-model intelligence",
    envKeys: ["MISTRAL_API_KEY"],
    color: "text-amber-500",
  },
];

/**
 * Helper to get a provider's display configuration by id.
 */
export function getProviderConfig(providerId: string): AIProviderConfig {
  const found = SUPPORTED_PROVIDERS.find((p) => p.id === providerId);
  if (found) return found;

  return {
    id: providerId,
    name: providerId.charAt(0).toUpperCase() + providerId.slice(1),
    badge: providerId.toUpperCase(),
    modelLabel: providerId,
    description: "Advanced AI Model",
    tagline: "AI completion engine",
    envKeys: [],
    color: "text-primary",
  };
}
