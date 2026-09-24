"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

interface GoogleAnalyticsProps {
  measurementId: string;
}

function AnalyticsNavigationTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId || typeof window === "undefined") return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // Push page_view event on route changes
    const win = window as unknown as {
      gtag?: (
        command: string,
        target: string,
        config?: Record<string, unknown>
      ) => void;
    };

    if (typeof win.gtag === "function") {
      win.gtag("config", measurementId, {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      });
      win.gtag("event", "page_view", {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [pathname, searchParams, measurementId]);

  return null;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <AnalyticsNavigationTracker measurementId={measurementId} />
      </Suspense>
    </>
  );
}
