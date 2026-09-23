// ---------------------------------------------------------------------------
// Credit & Pricing Types
// ---------------------------------------------------------------------------

/** The user's subscription tier */
export type SubscriptionTier = "free" | "free_account" | "pro" | "pro_plus";

/** Operation categories for credit costing */
export type CreditOperation =
  | "simple_rewrite"      // 1 credit
  | "ai_summary"          // 5 credits
  | "complex_reasoning"   // 10 credits
  | "vision_analysis"     // 15 credits
  | "image_generation"    // 50 credits
  | "video_ai"            // 100+ credits
  | "diagram_generation"  // 10 credits
  | "planning"            // 10 credits
  | "project_ideas"       // 5 credits
  | "quiz_generation"     // 5 credits
  | "notes_generation"    // 5 credits
  | "code_explanation"    // 5 credits
  | "math_solving"        // 5 credits
  | "grammar_check"       // 1 credit
  | "paraphrase"          // 1 credit
  | "citation"            // 1 credit
  | "sql_assistant"       // 5 credits
  | "regex_builder"       // 5 credits
  | "doc_generation"      // 5 credits
  | "error_explanation"   // 5 credits
  | "farming_assistant"   // 5 credits
  | "fitness_coach"       // 20 credits
  | "nutrition_planner"   // 20 credits
  | "chat_message";       // 1 credit

// ---------------------------------------------------------------------------
// Credit Costs (based on actual API costs)
// ---------------------------------------------------------------------------

export const CREDIT_COSTS: Record<CreditOperation, number> = {
  simple_rewrite: 10,
  ai_summary: 15,
  complex_reasoning: 25,
  vision_analysis: 25,
  image_generation: 50,
  video_ai: 100,
  diagram_generation: 20,
  planning: 20,
  project_ideas: 10,
  quiz_generation: 15,
  notes_generation: 15,
  code_explanation: 20,
  math_solving: 20,
  grammar_check: 10,
  paraphrase: 15,
  citation: 5,
  sql_assistant: 20,
  regex_builder: 15,
  doc_generation: 20,
  error_explanation: 20,
  farming_assistant: 15,
  fitness_coach: 20,
  nutrition_planner: 20,
  chat_message: 10,
};

// ---------------------------------------------------------------------------
// Subscription Tiers
// ---------------------------------------------------------------------------

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  priceMonthly: number | null;  // null = free
  priceYearly: number | null;
  monthlyCredits: number;
  features: string[];
  limits: {
    maxFileSizeMB: number;
    batchOperations: boolean;
    cloudProcessing: boolean;
    ads: boolean;
    savedItems: number;
  };
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: "free",
    name: "Free",
    priceMonthly: null,
    priceYearly: null,
    monthlyCredits: 0,
    features: [
      "Most basic tools",
      "Unlimited local processing",
      "Basic calculators",
      "Basic PDF operations",
      "Basic image tools",
      "Basic developer tools",
    ],
    limits: {
      maxFileSizeMB: 10,
      batchOperations: false,
      cloudProcessing: false,
      ads: true,
      savedItems: 0,
    },
  },
  free_account: {
    tier: "free_account",
    name: "Free Account",
    priceMonthly: null,
    priceYearly: null,
    monthlyCredits: 1000,
    features: [
      "Everything in Free",
      "Favorites & history",
      "Saved results",
      "1,000 AI credits/month",
      "Personal preferences",
      "Saved templates",
    ],
    limits: {
      maxFileSizeMB: 25,
      batchOperations: false,
      cloudProcessing: false,
      ads: true,
      savedItems: 50,
    },
  },
  pro: {
    tier: "pro",
    name: "Pro",
    priceMonthly: 2.99,
    priceYearly: 29,
    monthlyCredits: 5000,
    features: [
      "Everything in Free Account",
      "5,000 AI credits/month",
      "Larger files (100MB)",
      "Cloud processing",
      "Advanced apps",
      "Batch operations",
      "No ads",
      "More saved items",
    ],
    limits: {
      maxFileSizeMB: 100,
      batchOperations: true,
      cloudProcessing: true,
      ads: false,
      savedItems: 500,
    },
  },
  pro_plus: {
    tier: "pro_plus",
    name: "Pro+",
    priceMonthly: 5.99,
    priceYearly: 59,
    monthlyCredits: 20000,
    features: [
      "Everything in Pro",
      "20,000 AI credits/month",
      "Larger files (500MB)",
      "Priority cloud processing",
      "All advanced apps",
      "Unlimited saved items",
      "Early access to new tools",
    ],
    limits: {
      maxFileSizeMB: 500,
      batchOperations: true,
      cloudProcessing: true,
      ads: false,
      savedItems: Infinity,
    },
  },
};

// ---------------------------------------------------------------------------
// Credit helpers
// ---------------------------------------------------------------------------

/** Map an AI model tier to its credit operation */
export function tierToCreditOperation(tier: string): CreditOperation {
  switch (tier) {
    case "cheap": return "simple_rewrite";
    case "reasoning": return "complex_reasoning";
    case "vision": return "vision_analysis";
    case "image": return "image_generation";
    default: return "simple_rewrite";
  }
}

/** Get credit cost for a given operation */
export function getCreditCost(operation: CreditOperation): number {
  return CREDIT_COSTS[operation] ?? 1;
}

/** Check if a user has enough credits */
export function hasEnoughCredits(
  available: number,
  operation: CreditOperation
): boolean {
  return available >= getCreditCost(operation);
}

/** Get the subscription plan for a tier */
export function getSubscriptionPlan(tier: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[tier];
}

/** Check if a feature requires Pro */
export function requiresPro(feature: string): boolean {
  const freeFeatures = [...SUBSCRIPTION_PLANS.free.features, ...SUBSCRIPTION_PLANS.free_account.features];
  return !freeFeatures.some(f => f.toLowerCase().includes(feature.toLowerCase()));
}