// ---------------------------------------------------------------------------
// Abuse Prevention System
// ---------------------------------------------------------------------------
// Protects against guest abuse, bots, and malicious usage without
// burdening normal users. CAPTCHA only triggers when suspicious.
//
// Layers:
//   1. IP-based rate limiting (sliding window)
//   2. Request throttling (token bucket)
//   3. File size restrictions (per-tier)
//   4. AI request limits (per-IP + per-user)
//   5. Temporary processing tokens (CSRF protection)
//   6. Suspicion scoring (triggers CAPTCHA only when needed)
//   7. Guest-specific restrictions
// ---------------------------------------------------------------------------

import type { SubscriptionTier } from "@/lib/ai/credits";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AbuseContext {
  ip: string;
  userId?: string;
  isGuest: boolean;
  userAgent?: string;
  tier: SubscriptionTier;
  path: string;
  timestamp: number;
}

export interface AbuseCheckResult {
  allowed: boolean;
  reason?: string;
  code?: AbuseBlockCode;
  requiresCaptcha: boolean;
  suspicionScore: number;    // 0-100, higher = more suspicious
  retryAfterMs?: number;
}

export type AbuseBlockCode =
  | "IP_RATE_LIMITED"
  | "IP_BLOCKED"
  | "GUEST_LIMIT_EXCEEDED"
  | "THROTTLED"
  | "SUSPICIOUS_ACTIVITY"
  | "INVALID_TOKEN"
  | "FILE_TOO_LARGE_GUEST"
  | "AI_LIMIT_EXCEEDED";

// ---------------------------------------------------------------------------
// IP-based rate limiting (sliding window)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  windowStart: number;
  totalRequests: number;     // All-time for this window period
  blockedUntil?: number;
}

const ipRateLimitStore = new Map<string, RateLimitEntry>();

/** Per-IP rate limits (stricter for guests) */
const IP_RATE_LIMITS = {
  authenticated: { maxRequests: 200, windowMs: 60000 },    // 200 req/min
  guest: { maxRequests: 30, windowMs: 60000 },              // 30 req/min
  ai: { maxRequests: 5, windowMs: 60000 },                  // 5 AI req/min for guests
};

/** IPs that are permanently or temporarily blocked */
const blockedIPs = new Set<string>();
const tempBlockedIPs = new Map<string, number>(); // IP → unblock timestamp

// ---------------------------------------------------------------------------
// Token bucket throttler
// ---------------------------------------------------------------------------

interface TokenBucket {
  tokens: number;
  maxTokens: number;
  refillRate: number;       // tokens per ms
  lastRefill: number;
}

const tokenBuckets = new Map<string, TokenBucket>();

const BUCKET_CONFIGS = {
  authenticated: { maxTokens: 100, refillPerSec: 50 },
  guest: { maxTokens: 15, refillPerSec: 5 },
  ai: { maxTokens: 3, refillPerSec: 0.5 },
};

// ---------------------------------------------------------------------------
// Suspicion scoring
// ---------------------------------------------------------------------------

interface SuspicionEntry {
  score: number;
  lastRequest: number;
  requestCount: number;
  blockedCount: number;
  captchaVerified: boolean;
  captchaVerifiedAt: number;
}

const suspicionStore = new Map<string, SuspicionEntry>();

/** Behaviors that increase suspicion score */
const SUSPICION_WEIGHTS = {
  rapidRequests: 15,         // >10 requests in 1 second
  noUserAgent: 10,           // Missing User-Agent header
  knownBadUA: 20,            // Known bot/scraper UA
  fileUploadGuest: 10,       // Guest trying to upload files
  aiRequestGuest: 15,        // Guest trying AI without auth
  rateLimitHit: 25,          // Hit a rate limit
  blockedPreviously: 30,     // Was blocked before
  unusualPath: 5,            // Probing unusual paths
  largePayload: 10,          // Unusually large request body
};

/** Thresholds */
const CAPTCHA_THRESHOLD = 50;    // Require CAPTCHA at this score
const BLOCK_THRESHOLD = 80;      // Block entirely at this score
const SCORE_DECAY_PER_MINUTE = 2; // How fast suspicion decays

// ---------------------------------------------------------------------------
// Processing tokens (CSRF protection for expensive operations)
// ---------------------------------------------------------------------------

interface ProcessingToken {
  token: string;
  userId: string;
  operation: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

const processingTokens = new Map<string, ProcessingToken>();

const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// ---------------------------------------------------------------------------
// Known bad User-Agent patterns
// ---------------------------------------------------------------------------

const KNOWN_BAD_UA_PATTERNS = [
  /headless/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
  /scraper/i,
  /crawler/i,
  /spider/i,
  /bot/i,
  /scan/i,
  /wget/i,
  /curl/i,
  /python-requests/i,
  /go-http-client/i,
  /axios/i,
  /node-fetch/i,
];

// ---------------------------------------------------------------------------
// Unusual paths that suggest probing
// ---------------------------------------------------------------------------

const UNUSUAL_PATHS = [
  "/wp-admin",
  "/wp-login",
  "/.env",
  "/.git",
  "/admin",
  "/phpmyadmin",
  "/config",
  "/backup",
  "/sql",
  "/shell",
  "/debug",
  "/test",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function isKnownBadUA(userAgent?: string): boolean {
  if (!userAgent) return false;
  return KNOWN_BAD_UA_PATTERNS.some((pattern) => pattern.test(userAgent));
}

function isUnusualPath(path: string): boolean {
  return UNUSUAL_PATHS.some((p) => path.toLowerCase().startsWith(p));
}

// ---------------------------------------------------------------------------
// IP Rate Limiting
// ---------------------------------------------------------------------------

function checkIPRateLimit(ctx: AbuseContext): { allowed: boolean; retryAfterMs?: number } {
  // Check if IP is blocked
  if (blockedIPs.has(ctx.ip)) {
    return { allowed: false };
  }

  const tempBlock = tempBlockedIPs.get(ctx.ip);
  if (tempBlock && Date.now() < tempBlock) {
    return { allowed: false, retryAfterMs: tempBlock - Date.now() };
  }

  // Get or create rate limit entry
  const now = Date.now();
  const limits = ctx.isGuest ? IP_RATE_LIMITS.guest : IP_RATE_LIMITS.authenticated;
  let entry = ipRateLimitStore.get(ctx.ip);

  if (!entry || now - entry.windowStart > limits.windowMs) {
    entry = { count: 1, windowStart: now, totalRequests: (entry?.totalRequests ?? 0) + 1 };
    ipRateLimitStore.set(ctx.ip, entry);
    return { allowed: true };
  }

  entry.count++;
  entry.totalRequests++;

  if (entry.count > limits.maxRequests) {
    // Temp block for 5 minutes if exceeding limit
    tempBlockedIPs.set(ctx.ip, now + 5 * 60 * 1000);
    return { allowed: false, retryAfterMs: 5 * 60 * 1000 };
  }

  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Token Bucket Throttling
// ---------------------------------------------------------------------------

function checkThrottle(ctx: AbuseContext): { allowed: boolean; retryAfterMs?: number } {
  const key = ctx.isGuest ? `guest:${ctx.ip}` : `user:${ctx.userId ?? ctx.ip}`;
  const config = ctx.isGuest ? BUCKET_CONFIGS.guest : BUCKET_CONFIGS.authenticated;
  const now = Date.now();

  let bucket = tokenBuckets.get(key);
  if (!bucket) {
    bucket = { tokens: config.maxTokens, maxTokens: config.maxTokens, refillRate: config.refillPerSec / 1000, lastRefill: now };
    tokenBuckets.set(key, bucket);
  }

  // Refill tokens
  const elapsed = now - bucket.lastRefill;
  bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + elapsed * bucket.refillRate);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    const waitMs = Math.ceil((1 - bucket.tokens) / bucket.refillRate);
    return { allowed: false, retryAfterMs: waitMs };
  }

  bucket.tokens -= 1;
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Suspicion Scoring
// ---------------------------------------------------------------------------

function updateSuspicionScore(ctx: AbuseContext, event: keyof typeof SUSPICION_WEIGHTS): number {
  let entry = suspicionStore.get(ctx.ip);
  const now = Date.now();

  if (!entry) {
    entry = {
      score: 0,
      lastRequest: now,
      requestCount: 0,
      blockedCount: 0,
      captchaVerified: false,
      captchaVerifiedAt: 0,
    };
  }

  // Decay score over time
  const minutesSinceLast = (now - entry.lastRequest) / 60000;
  entry.score = Math.max(0, entry.score - minutesSinceLast * SCORE_DECAY_PER_MINUTE);

  // Add weight for this event
  entry.score += SUSPICION_WEIGHTS[event];
  entry.lastRequest = now;
  entry.requestCount++;

  if (event === "blockedPreviously") {
    entry.blockedCount++;
  }

  suspicionStore.set(ctx.ip, entry);
  return entry.score;
}

function getSuspicionScore(ip: string): number {
  return suspicionStore.get(ip)?.score ?? 0;
}

function markCaptchaVerified(ip: string): void {
  const entry = suspicionStore.get(ip);
  if (entry) {
    entry.captchaVerified = true;
    entry.captchaVerifiedAt = Date.now();
    entry.score = Math.max(0, entry.score - 30); // Reduce score after CAPTCHA
    suspicionStore.set(ip, entry);
  }
}

// ---------------------------------------------------------------------------
// Processing Tokens
// ---------------------------------------------------------------------------

export function createProcessingToken(userId: string, operation: string): string {
  const token = generateToken();
  const now = Date.now();

  processingTokens.set(token, {
    token,
    userId,
    operation,
    createdAt: now,
    expiresAt: now + TOKEN_EXPIRY_MS,
    used: false,
  });

  return token;
}

export function validateProcessingToken(token: string, userId: string, operation: string): boolean {
  const entry = processingTokens.get(token);
  if (!entry) return false;
  if (entry.used) return false;
  if (Date.now() > entry.expiresAt) {
    processingTokens.delete(token);
    return false;
  }
  if (entry.userId !== userId || entry.operation !== operation) return false;

  entry.used = true;
  processingTokens.delete(token);
  return true;
}

// ---------------------------------------------------------------------------
// Main Abuse Check Pipeline
// ---------------------------------------------------------------------------

export function checkAbuse(ctx: AbuseContext): AbuseCheckResult {
  const now = Date.now();

  // 1. Check if IP is blocked
  if (blockedIPs.has(ctx.ip)) {
    return {
      allowed: false,
      reason: "Access denied.",
      code: "IP_BLOCKED",
      requiresCaptcha: false,
      suspicionScore: 100,
    };
  }

  // 2. Check for known bad User-Agent
  if (isKnownBadUA(ctx.userAgent)) {
    updateSuspicionScore(ctx, "knownBadUA");
    const score = getSuspicionScore(ctx.ip);
    if (score >= BLOCK_THRESHOLD) {
      blockedIPs.add(ctx.ip);
      return {
        allowed: false,
        reason: "Access denied.",
        code: "IP_BLOCKED",
        requiresCaptcha: false,
        suspicionScore: score,
      };
    }
  }

  // 3. Check for unusual paths
  if (isUnusualPath(ctx.path)) {
    updateSuspicionScore(ctx, "unusualPath");
  }

  // 4. Check missing User-Agent
  if (!ctx.userAgent) {
    updateSuspicionScore(ctx, "noUserAgent");
  }

  // 5. IP rate limit
  const rateCheck = checkIPRateLimit(ctx);
  if (!rateCheck.allowed) {
    updateSuspicionScore(ctx, "rateLimitHit");
    return {
      allowed: false,
      reason: "Too many requests. Please slow down.",
      code: "IP_RATE_LIMITED",
      requiresCaptcha: getSuspicionScore(ctx.ip) >= CAPTCHA_THRESHOLD,
      suspicionScore: getSuspicionScore(ctx.ip),
      retryAfterMs: rateCheck.retryAfterMs,
    };
  }

  // 6. Token bucket throttle
  const throttleCheck = checkThrottle(ctx);
  if (!throttleCheck.allowed) {
    return {
      allowed: false,
      reason: "Request throttled. Please wait.",
      code: "THROTTLED",
      requiresCaptcha: false,
      suspicionScore: getSuspicionScore(ctx.ip),
      retryAfterMs: throttleCheck.retryAfterMs,
    };
  }

  // 7. Guest-specific restrictions
  if (ctx.isGuest) {
    // Guest AI limits
    const aiKey = `ai:guest:${ctx.ip}`;
    const aiEntry = ipRateLimitStore.get(aiKey);
    const aiLimits = IP_RATE_LIMITS.ai;

    if (aiEntry && now - aiEntry.windowStart < aiLimits.windowMs && aiEntry.count >= aiLimits.maxRequests) {
      updateSuspicionScore(ctx, "aiRequestGuest");
      return {
        allowed: false,
        reason: "AI request limit reached for guests. Sign up for more.",
        code: "AI_LIMIT_EXCEEDED",
        requiresCaptcha: false,
        suspicionScore: getSuspicionScore(ctx.ip),
      };
    }
  }

  // 8. Check suspicion score
  const score = getSuspicionScore(ctx.ip);
  if (score >= BLOCK_THRESHOLD) {
    blockedIPs.add(ctx.ip);
    return {
      allowed: false,
      reason: "Suspicious activity detected. Access denied.",
      code: "SUSPICIOUS_ACTIVITY",
      requiresCaptcha: false,
      suspicionScore: score,
    };
  }

  if (score >= CAPTCHA_THRESHOLD) {
    return {
      allowed: true, // Allow but require CAPTCHA verification
      requiresCaptcha: true,
      suspicionScore: score,
    };
  }

  return {
    allowed: true,
    requiresCaptcha: false,
    suspicionScore: score,
  };
}

// ---------------------------------------------------------------------------
// Guest file size check
// ---------------------------------------------------------------------------

export function checkGuestFileSize(fileSizeBytes: number): AbuseCheckResult {
  const MAX_GUEST_FILE = 5 * 1024 * 1024; // 5MB for guests
  if (fileSizeBytes > MAX_GUEST_FILE) {
    return {
      allowed: false,
      reason: `File too large for guests (max 5MB). Sign up for larger uploads.`,
      code: "FILE_TOO_LARGE_GUEST",
      requiresCaptcha: false,
      suspicionScore: 0,
    };
  }
  return { allowed: true, requiresCaptcha: false, suspicionScore: 0 };
}

// ---------------------------------------------------------------------------
// Cleanup (call periodically)
// ---------------------------------------------------------------------------

export function cleanupAbuseStores(): void {
  const now = Date.now();

  // Clean rate limit entries older than 5 minutes
  for (const [key, entry] of ipRateLimitStore) {
    if (now - entry.windowStart > 5 * 60 * 1000) {
      ipRateLimitStore.delete(key);
    }
  }

  // Clean temp blocked IPs
  for (const [ip, unblockAt] of tempBlockedIPs) {
    if (now >= unblockAt) {
      tempBlockedIPs.delete(ip);
    }
  }

  // Clean expired processing tokens
  for (const [token, entry] of processingTokens) {
    if (now > entry.expiresAt || entry.used) {
      processingTokens.delete(token);
    }
  }

  // Clean suspicion entries older than 1 hour
  for (const [ip, entry] of suspicionStore) {
    if (now - entry.lastRequest > 60 * 60 * 1000) {
      suspicionStore.delete(ip);
    }
  }

  // Clean token buckets older than 10 minutes
  for (const [key, bucket] of tokenBuckets) {
    if (now - bucket.lastRefill > 10 * 60 * 1000) {
      tokenBuckets.delete(key);
    }
  }
}

// ---------------------------------------------------------------------------
// Admin: get abuse stats
// ---------------------------------------------------------------------------

export function getAbuseStats(): {
  blockedIPs: number;
  tempBlockedIPs: number;
  highSuspicionIPs: number;
  activeRateLimitEntries: number;
  activeTokens: number;
} {
  return {
    blockedIPs: blockedIPs.size,
    tempBlockedIPs: tempBlockedIPs.size,
    highSuspicionIPs: Array.from(suspicionStore.values()).filter((e) => e.score >= CAPTCHA_THRESHOLD).length,
    activeRateLimitEntries: ipRateLimitStore.size,
    activeTokens: processingTokens.size,
  };
}

export function getBlockedIPs(): string[] {
  return [...blockedIPs, ...tempBlockedIPs.keys()];
}

export function unblockIP(ip: string): void {
  blockedIPs.delete(ip);
  tempBlockedIPs.delete(ip);
  suspicionStore.delete(ip);
}

export { markCaptchaVerified, getSuspicionScore };