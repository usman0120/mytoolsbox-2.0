import type { ToolCategory } from "./tool";

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  defaultCategory: ToolCategory | "all";
  emailNotifications: boolean;
  language: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  defaultCategory: "all",
  emailNotifications: false,
  language: "en",
};

export interface FavoriteItem {
  id: string;
  toolId: string;
  toolName: string;
  toolSlug: string;
  category: ToolCategory;
  productType?: "tool" | "app";
  addedAt: number; // timestamp
}

export interface HistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  toolSlug: string;
  category: ToolCategory;
  productType?: "tool" | "app";
  action: string; // e.g. "used", "downloaded", "converted"
  timestamp: number;
  details?: string; // brief description of what was done
}

export type AccountStatus = "active" | "disabled" | "pending_deletion";

export interface UserProfile {
  displayName: string;
  bio: string;
  website: string;
  location?: string;
  status?: AccountStatus;
  deletionRequestedAt?: number; // timestamp when deletion was requested
  deletionScheduledAt?: number; // timestamp when deletion will be executed (30 days later)
  disabledAt?: number;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_PROFILE: UserProfile = {
  displayName: "",
  bio: "",
  website: "",
  location: "",
  status: "active",
  createdAt: 0,
  updatedAt: 0,
};

// ---------------------------------------------------------------------------
// Usage tracking (per-period counters for rate limiting / quotas)
// ---------------------------------------------------------------------------

export interface UsageRecord {
  period: string; // e.g. "2026-09-19" (daily) or "2026-W38" (weekly)
  toolCount: number; // total tool invocations in this period
  aiCalls: number; // AI-specific calls
  fileUploadsMB: number; // total MB uploaded
}

// ---------------------------------------------------------------------------
// Saved items (saved tool outputs/results, distinct from favorites)
// ---------------------------------------------------------------------------

export interface SavedItem {
  id: string;
  toolId: string;
  toolName: string;
  toolSlug: string;
  category: ToolCategory;
  title: string; // user-given or auto-generated title
  resultData: string; // JSON-stringified result payload
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Feedback / Contact form submissions
// ---------------------------------------------------------------------------

export type FeedbackType = "suggestion" | "bug" | "feedback" | "question";

export type FeedbackStatus = "new" | "investigating" | "resolved" | "closed";

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  message: string;
  name: string;
  email: string;
  status: FeedbackStatus;
  createdAt: number;
  updatedAt: number;
}