// Daily AI allowance and protection limits (blueprint section 13).
export const AI_LIMITS = {
  /** Daily AI units for signed-out users (device ID + IP). */
  anonymousDaily: 10,
  /** Daily AI units for signed-in users. */
  signedInDaily: 40,
  /** Global daily cap across all users; kept below providers' free-tier limits. */
  globalDaily: 1200,
  /** Sliding-window rate limit per identity. */
  perMinute: 6,
  /** Max prompt length in characters. */
  maxPromptChars: 60_000,
} as const;
