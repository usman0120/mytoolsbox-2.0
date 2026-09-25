"use client";

import { useEffect, Suspense, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

interface GoogleAnalyticsProps {
  measurementId: string;
}

// Global declaration for window.gtag and dataLayer
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Tracks route changes in Next.js App Router (Single Page Application transitions).
 * Ensures that every client-side page navigation fires a page_view to GA4 with full URL & title.
 */
function AnalyticsNavigationTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!measurementId || typeof window === "undefined") return;

    // Build complete URL
    const queryString = searchParams?.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

    // Helper to send GA config and page_view
    const sendPageView = () => {
      if (typeof window.gtag === "function") {
        window.gtag("config", measurementId, {
          page_path: pagePath,
          page_location: window.location.href,
          page_title: document.title,
        });

        // Trigger explicit page_view event on client transitions
        if (!isFirstRender.current) {
          window.gtag("event", "page_view", {
            page_path: pagePath,
            page_location: window.location.href,
            page_title: document.title,
          });
        }
        isFirstRender.current = false;
      }
    };

    // If gtag is already ready, send immediately.
    // If gtag is still loading asynchronously, push to dataLayer or wait a tick.
    if (typeof window.gtag === "function") {
      sendPageView();
    } else {
      // Initialize dataLayer queue if not yet initialized
      window.dataLayer = window.dataLayer || [];
      if (typeof window.gtag !== "function") {
        window.gtag = function () {
          // eslint-disable-next-line prefer-rest-params
          window.dataLayer.push(arguments);
        };
      }
      sendPageView();
    }
  }, [pathname, searchParams, measurementId]);

  return null;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) return null;

  return (
    <>
      {/* 1. Preconnect to Google Analytics & Google Tag Manager domains for ultra-fast connection */}
      <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />

      {/* 2. Google Tag Manager / gtag.js library */}
      <Script
        id="gtag-base"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />

      {/* 3. Inline gtag bootstrap script with immediate global window.gtag definition */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname + window.location.search,
              page_location: window.location.href,
              page_title: document.title,
              send_page_view: true
            });
          `,
        }}
      />

      {/* 4. Client-side SPA navigation tracker for Next.js App Router */}
      <Suspense fallback={null}>
        <AnalyticsNavigationTracker measurementId={measurementId} />
      </Suspense>
    </>
  );
}
