// Analytics event types
export type AnalyticsEvent =
  | "tool_opened"
  | "tool_used"
  | "tool_completed"
  | "tool_failed"
  | "tool_downloaded"
  | "tool_shared"
  | "tool_favorited"
  | "ai_request"
  | "ai_completed"
  | "upgrade_clicked"
  | "subscription_started"
  | "search_performed";

export function trackEvent(event: AnalyticsEvent, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  // Send to Google Analytics if available
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", event, data);
  }

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, data);
  }
}