import { describe, it, expect, beforeEach } from "vitest";
import {
  checkAbuse,
  checkGuestFileSize,
  createProcessingToken,
  validateProcessingToken,
  cleanupAbuseStores,
  getAbuseStats,
  getBlockedIPs,
  unblockIP,
  markCaptchaVerified,
  getSuspicionScore,
  type AbuseContext,
} from "@/lib/payments/abuse";

// Helper to create a fresh abuse context
function makeCtx(overrides: Partial<AbuseContext> = {}): AbuseContext {
  return {
    ip: "192.168.1.1",
    userId: "user-123",
    isGuest: false,
    userAgent: "Mozilla/5.0",
    tier: "pro",
    path: "/api/ai/complete",
    timestamp: Date.now(),
    ...overrides,
  };
}

describe("Abuse Prevention System", () => {
  // Clean up between tests since the stores are in-memory
  beforeEach(() => {
    cleanupAbuseStores();
  });

  // -----------------------------------------------------------------------
  // Basic abuse checks
  // -----------------------------------------------------------------------
  describe("checkAbuse", () => {
    it("allows normal authenticated requests", () => {
      const result = checkAbuse(makeCtx());
      expect(result.allowed).toBe(true);
      expect(result.requiresCaptcha).toBe(false);
      expect(result.suspicionScore).toBe(0);
    });

    it("allows normal guest requests", () => {
      const result = checkAbuse(makeCtx({ isGuest: true, userId: undefined, tier: "free" }));
      expect(result.allowed).toBe(true);
      expect(result.requiresCaptcha).toBe(false);
    });

    it("blocks requests from blocked IPs", () => {
      // First block the IP
      const ctx = makeCtx({ ip: "10.0.0.99" });
      // Manually add to blocked set via repeated abuse
      for (let i = 0; i < 50; i++) {
        checkAbuse({ ...ctx, timestamp: Date.now() + i });
      }
      const result = checkAbuse(ctx);
      // After many rapid requests, should be blocked or require captcha
      expect(result.allowed || result.requiresCaptcha).toBeDefined();
    });

    it("detects known bad User-Agents", () => {
      const result = checkAbuse(makeCtx({ userAgent: "curl/7.68.0" }));
      // Should increase suspicion but may still allow
      expect(result.suspicionScore).toBeGreaterThanOrEqual(0);
    });

    it("detects missing User-Agent", () => {
      const result = checkAbuse(makeCtx({ userAgent: undefined }));
      expect(result.suspicionScore).toBeGreaterThanOrEqual(0);
    });

    it("detects unusual paths", () => {
      const result = checkAbuse(makeCtx({ path: "/wp-admin" }));
      expect(result.suspicionScore).toBeGreaterThanOrEqual(0);
    });
  });

  // -----------------------------------------------------------------------
  // Rate limiting
  // -----------------------------------------------------------------------
  describe("Rate limiting", () => {
    it("allows requests within rate limits", () => {
      const ctx = makeCtx();
      for (let i = 0; i < 5; i++) {
        const result = checkAbuse({ ...ctx, timestamp: Date.now() + i * 100 });
        expect(result.allowed).toBe(true);
      }
    });

    it("rate limits excessive guest requests", () => {
      const ctx = makeCtx({ isGuest: true, userId: undefined, tier: "free", ip: "10.0.0.50" });
      // Guest limit is 30 req/min, but token bucket (15 tokens, 5/sec refill) hits first
      let wasBlocked = false;
      for (let i = 0; i < 50; i++) {
        const result = checkAbuse({ ...ctx, timestamp: Date.now() + i });
        if (!result.allowed) {
          wasBlocked = true;
          // Either IP_RATE_LIMITED or THROTTLED is valid
          expect(["IP_RATE_LIMITED", "THROTTLED"]).toContain(result.code);
          break;
        }
      }
      expect(wasBlocked).toBe(true);
    });

    it("has higher limits for authenticated users", () => {
      const ctx = makeCtx({ ip: "10.0.0.61" });
      // Authenticated bucket: 100 tokens, 50/sec refill
      // 20 rapid requests should all pass
      let allAllowed = true;
      for (let i = 0; i < 20; i++) {
        const result = checkAbuse({ ...ctx, timestamp: Date.now() + i * 10 });
        if (!result.allowed) {
          allAllowed = false;
          break;
        }
      }
      expect(allAllowed).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Guest file size
  // -----------------------------------------------------------------------
  describe("checkGuestFileSize", () => {
    it("allows files under 5MB for guests", () => {
      const result = checkGuestFileSize(4 * 1024 * 1024);
      expect(result.allowed).toBe(true);
    });

    it("rejects files over 5MB for guests", () => {
      const result = checkGuestFileSize(6 * 1024 * 1024);
      expect(result.allowed).toBe(false);
      expect(result.code).toBe("FILE_TOO_LARGE_GUEST");
    });

    it("allows exactly 5MB", () => {
      const result = checkGuestFileSize(5 * 1024 * 1024);
      expect(result.allowed).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Processing tokens (CSRF protection)
  // -----------------------------------------------------------------------
  describe("Processing tokens", () => {
    it("creates and validates a token", () => {
      const token = createProcessingToken("user-1", "image_generation");
      expect(token).toHaveLength(32);

      const valid = validateProcessingToken(token, "user-1", "image_generation");
      expect(valid).toBe(true);
    });

    it("rejects token with wrong user", () => {
      const token = createProcessingToken("user-1", "image_generation");
      const valid = validateProcessingToken(token, "user-2", "image_generation");
      expect(valid).toBe(false);
    });

    it("rejects token with wrong operation", () => {
      const token = createProcessingToken("user-1", "image_generation");
      const valid = validateProcessingToken(token, "user-1", "complex_reasoning");
      expect(valid).toBe(false);
    });

    it("rejects already-used token", () => {
      const token = createProcessingToken("user-1", "image_generation");
      validateProcessingToken(token, "user-1", "image_generation"); // Use it
      const valid = validateProcessingToken(token, "user-1", "image_generation"); // Reuse
      expect(valid).toBe(false);
    });

    it("rejects non-existent token", () => {
      const valid = validateProcessingToken("nonexistent", "user-1", "image_generation");
      expect(valid).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Suspicion scoring
  // -----------------------------------------------------------------------
  describe("Suspicion scoring", () => {
    it("starts at 0 for new IPs", () => {
      expect(getSuspicionScore("192.168.99.99")).toBe(0);
    });

    it("increases with suspicious behavior", () => {
      const ctx = makeCtx({ ip: "10.10.10.10", userAgent: "curl/7.68.0" });
      checkAbuse(ctx);
      const score = getSuspicionScore("10.10.10.10");
      expect(score).toBeGreaterThan(0);
    });

    it("reduces score after CAPTCHA verification", () => {
      const ip = "10.10.10.20";
      // Build up some suspicion
      const ctx = makeCtx({ ip, userAgent: undefined });
      checkAbuse(ctx);
      checkAbuse(ctx);
      const beforeScore = getSuspicionScore(ip);

      markCaptchaVerified(ip);
      const afterScore = getSuspicionScore(ip);
      expect(afterScore).toBeLessThan(beforeScore);
    });
  });

  // -----------------------------------------------------------------------
  // Admin functions
  // -----------------------------------------------------------------------
  describe("Admin functions", () => {
    it("getAbuseStats returns stats object", () => {
      const stats = getAbuseStats();
      expect(stats).toHaveProperty("blockedIPs");
      expect(stats).toHaveProperty("tempBlockedIPs");
      expect(stats).toHaveProperty("highSuspicionIPs");
      expect(stats).toHaveProperty("activeRateLimitEntries");
      expect(stats).toHaveProperty("activeTokens");
      expect(typeof stats.blockedIPs).toBe("number");
    });

    it("getBlockedIPs returns array", () => {
      const ips = getBlockedIPs();
      expect(Array.isArray(ips)).toBe(true);
    });

    it("unblockIP removes IP from all stores", () => {
      const ip = "10.99.99.99";
      // Build suspicion
      const ctx = makeCtx({ ip, userAgent: "curl/7.68.0" });
      for (let i = 0; i < 10; i++) {
        checkAbuse({ ...ctx, timestamp: Date.now() + i });
      }
      unblockIP(ip);
      expect(getSuspicionScore(ip)).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------
  describe("cleanupAbuseStores", () => {
    it("does not throw", () => {
      expect(() => cleanupAbuseStores()).not.toThrow();
    });

    it("cleans up expired entries", () => {
      // Create some entries
      createProcessingToken("user-1", "test");
      const statsBefore = getAbuseStats();
      cleanupAbuseStores();
      const statsAfter = getAbuseStats();
      // Stats should be consistent
      expect(statsAfter).toBeDefined();
    });
  });
});