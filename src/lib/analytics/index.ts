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

  // Send to Google Analytics with dataLayer queue fallback
  if (typeof window.gtag === "function") {
    window.gtag("event", event, data);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      ...data,
    });
  }

  // Log in development for instant verification
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, data);
  }
}