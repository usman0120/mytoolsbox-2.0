// ---------------------------------------------------------------------------
// Financial Safety Mechanism — Guard Pipeline
// ---------------------------------------------------------------------------
// Every expensive operation MUST pass through this pipeline before processing.
// This protects the business from runaway costs, abuse, and unexpected bills.
//
// Pipeline:
//   Can user perform operation?
//        ↓
//   Check authentication
//        ↓
//   Check plan
//        ↓
//   Check credits
//        ↓
//   Check file limits
//        ↓
//   Estimate provider cost
//        ↓
//   Process
// ---------------------------------------------------------------------------

import type { SubscriptionTier } from "@/lib/ai/credits";
import { SUBSCRIPTION_PLANS, getCreditCost, type CreditOperation } from "@/lib/ai/credits";
import { checkCredits, deductCredits, getUserTier } from "@/lib/credits/credit-service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GuardContext {
  userId?: string;
  isAuthenticated: boolean;
  tier: SubscriptionTier;
  operation: CreditOperation;
  fileSizeBytes?: number;
  estimatedTokens?: number;
  ip?: string;
}

export interface GuardResult {
  allowed: boolean;
  reason?: string;
  code?: GuardBlockCode;
  details?: GuardDetails;
}

export interface GuardDetails {
  tier: SubscriptionTier;
  creditsRemaining: number;
  creditsRequired: number;
  fileSizeMB?: number;
  maxFileSizeMB: number;
  estimatedCostUSD?: number;
  rateLimitRemaining?: number;
}

export type GuardBlockCode =
  | "NOT_AUTHENTICATED"
  | "PLAN_NOT_SUFFICIENT"
  | "INSUFFICIENT_CREDITS"
  | "FILE_TOO_LARGE"
  | "COST_EXCEEDS_LIMIT"
  | "RATE_LIMITED"
  | "ABUSE_DETECTED"
  | "TIMEOUT";

// ---------------------------------------------------------------------------
// Cost estimation (approximate, based on provider pricing)
// ---------------------------------------------------------------------------

/** Estimated cost per 1K tokens for each tier (USD) */
const TOKEN_COST_PER_1K: Record<string, number> = {
  cheap: 0.00015,       // ~GPT-4o-mini / Gemini Flash
  reasoning: 0.003,     // ~GPT-4o / Claude Sonnet
  vision: 0.005,        // Vision models cost more
  image: 0.04,          // Image generation
};

/** Maximum cost we'll allow per operation (USD) */
const MAX_COST_PER_OPERATION: Record<SubscriptionTier, number> = {
  free: 0,
  free_account: 0.05,
  pro: 0.50,
  pro_plus: 2.00,
};

// ---------------------------------------------------------------------------
// Rate limiting (simple in-memory, replace with Redis in production)
// ---------------------------------------------------------------------------

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<SubscriptionTier, { maxRequests: number; windowMs: number }> = {
  free: { maxRequests: 0, windowMs: 60000 },
  free_account: { maxRequests: 10, windowMs: 60000 },    // 10 AI requests/min
  pro: { maxRequests: 60, windowMs: 60000 },              // 60 AI requests/min
  pro_plus: { maxRequests: 120, windowMs: 60000 },        // 120 AI requests/min
};

// ---------------------------------------------------------------------------
// Timeout configuration
// ---------------------------------------------------------------------------

const OPERATION_TIMEOUTS: Partial<Record<CreditOperation, number>> = {
  simple_rewrite: 15000,       // 15s
  ai_summary: 30000,           // 30s
  complex_reasoning: 60000,    // 60s
  vision_analysis: 45000,      // 45s
  image_generation: 120000,    // 2min
  video_ai: 300000,            // 5min
  diagram_generation: 45000,   // 45s
  planning: 60000,             // 60s
};

// ---------------------------------------------------------------------------
// File size limits (per tier)
// ---------------------------------------------------------------------------

const FILE_SIZE_LIMITS: Record<SubscriptionTier, number> = {
  free: 10 * 1024 * 1024,        // 10MB
  free_account: 25 * 1024 * 1024, // 25MB
  pro: 100 * 1024 * 1024,         // 100MB
  pro_plus: 500 * 1024 * 1024,    // 500MB
};

// ---------------------------------------------------------------------------
// Guard pipeline
// ---------------------------------------------------------------------------

/**
 * Estimate the provider cost for an operation.
 */
export function estimateCost(operation: CreditOperation, estimatedTokens?: number): number {
  const tierMap: Record<string, string> = {
    simple_rewrite: "cheap",
    ai_summary: "cheap",
    complex_reasoning: "reasoning",
    vision_analysis: "vision",
    image_generation: "image",
    video_ai: "reasoning",
    diagram_generation: "reasoning",
    planning: "reasoning",
    project_ideas: "cheap",
    quiz_generation: "cheap",
    notes_generation: "cheap",
    code_explanation: "reasoning",
    math_solving: "reasoning",
    grammar_check: "cheap",
    paraphrase: "cheap",
    citation: "cheap",
    sql_assistant: "reasoning",
    regex_builder: "cheap",
    doc_generation: "cheap",
    error_explanation: "reasoning",
    farming_assistant: "cheap",
    chat_message: "cheap",
  };

  const tier = tierMap[operation] ?? "cheap";
  const tokens = estimatedTokens ?? 1000;
  return (tokens / 1000) * (TOKEN_COST_PER_1K[tier] ?? 0.00015);
}

/**
 * Check rate limit for a user/IP.
 */
function checkRateLimit(ctx: GuardContext): { allowed: boolean; remaining: number } {
  const key = ctx.userId ?? ctx.ip ?? "anonymous";
  const limits = RATE_LIMITS[ctx.tier];
  const now = Date.now();

  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + limits.windowMs });
    return { allowed: true, remaining: limits.maxRequests - 1 };
  }

  if (entry.count >= limits.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limits.maxRequests - entry.count };
}

/**
 * The main guard pipeline. Runs all checks in order.
 * Returns { allowed: true } if the operation can proceed,
 * or { allowed: false, reason, code } if blocked.
 */
export async function guardPipeline(ctx: GuardContext): Promise<GuardResult> {
  // 1. Check authentication
  if (!ctx.isAuthenticated && ctx.tier === "free") {
    // Free tier with no auth: only allow local-only operations (no AI)
    if (getCreditCost(ctx.operation) > 0) {
      return {
        allowed: false,
        reason: "AI features require an account. Sign up for free to get started.",
        code: "NOT_AUTHENTICATED",
        details: {
          tier: ctx.tier,
          creditsRemaining: 0,
          creditsRequired: getCreditCost(ctx.operation),
          maxFileSizeMB: FILE_SIZE_LIMITS[ctx.tier] / (1024 * 1024),
        },
      };
    }
  }

  // 2. Check plan limits
  const plan = SUBSCRIPTION_PLANS[ctx.tier];

  // 3. Check file size
  if (ctx.fileSizeBytes !== undefined) {
    const maxSize = FILE_SIZE_LIMITS[ctx.tier];
    if (ctx.fileSizeBytes > maxSize) {
      return {
        allowed: false,
        reason: `File too large (${(ctx.fileSizeBytes / (1024 * 1024)).toFixed(1)}MB). Max: ${maxSize / (1024 * 1024)}MB. Upgrade to Pro for larger files.`,
        code: "FILE_TOO_LARGE",
        details: {
          tier: ctx.tier,
          creditsRemaining: 0,
          creditsRequired: getCreditCost(ctx.operation),
          fileSizeMB: ctx.fileSizeBytes / (1024 * 1024),
          maxFileSizeMB: maxSize / (1024 * 1024),
        },
      };
    }
  }

  // 4. Check credits (if authenticated)
  if (ctx.userId && ctx.isAuthenticated) {
    const creditCheck = await checkCredits(ctx.userId, ctx.operation);
    if (!creditCheck.allowed) {
      return {
        allowed: false,
        reason: `Insufficient credits: need ${creditCheck.required}, have ${creditCheck.remaining}. Buy more credits or upgrade to Pro.`,
        code: "INSUFFICIENT_CREDITS",
        details: {
          tier: ctx.tier,
          creditsRemaining: creditCheck.remaining,
          creditsRequired: creditCheck.required,
          maxFileSizeMB: FILE_SIZE_LIMITS[ctx.tier] / (1024 * 1024),
        },
      };
    }
  }

  // 5. Estimate provider cost
  const estimatedCost = estimateCost(ctx.operation, ctx.estimatedTokens);
  const maxCost = MAX_COST_PER_OPERATION[ctx.tier];
  if (estimatedCost > maxCost) {
    return {
      allowed: false,
      reason: `Estimated cost ($${estimatedCost.toFixed(4)}) exceeds your plan limit ($${maxCost.toFixed(2)}). Upgrade to Pro for higher limits.`,
      code: "COST_EXCEEDS_LIMIT",
      details: {
        tier: ctx.tier,
        creditsRemaining: 0,
        creditsRequired: getCreditCost(ctx.operation),
        maxFileSizeMB: FILE_SIZE_LIMITS[ctx.tier] / (1024 * 1024),
        estimatedCostUSD: estimatedCost,
      },
    };
  }

  // 6. Rate limit
  const rateCheck = checkRateLimit(ctx);
  if (!rateCheck.allowed) {
    return {
      allowed: false,
      reason: "Rate limit exceeded. Please wait before making more requests.",
      code: "RATE_LIMITED",
      details: {
        tier: ctx.tier,
        creditsRemaining: 0,
        creditsRequired: getCreditCost(ctx.operation),
        maxFileSizeMB: FILE_SIZE_LIMITS[ctx.tier] / (1024 * 1024),
        rateLimitRemaining: 0,
      },
    };
  }

  // All checks passed
  return {
    allowed: true,
    details: {
      tier: ctx.tier,
      creditsRemaining: -1, // Will be determined after deduction
      creditsRequired: getCreditCost(ctx.operation),
      maxFileSizeMB: FILE_SIZE_LIMITS[ctx.tier] / (1024 * 1024),
      estimatedCostUSD: estimatedCost,
      rateLimitRemaining: rateCheck.remaining,
    },
  };
}

/**
 * Get the timeout for an operation.
 */
export function getOperationTimeout(operation: CreditOperation): number {
  return OPERATION_TIMEOUTS[operation] ?? 30000; // Default 30s
}

/**
 * Get the file size limit for a tier.
 */
export function getFileSizeLimit(tier: SubscriptionTier): number {
  return FILE_SIZE_LIMITS[tier];
}

/**
 * Clean up expired rate limit entries (call periodically).
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}