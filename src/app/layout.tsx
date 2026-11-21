import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { compactCatalog } from "@/tools/catalog";
import { WorkspaceSync } from "@/lib/workspace/workspace-sync";
import { SiteHeader, SiteFooter, BottomNav, AskPalette, FileTray } from "@/components/shell";
import { AuthProvider } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/constants";
import { SkipLink } from "@/components/common/accessibility";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { Toaster } from "@/components/ui/sonner";
import { RequestNotice } from "@/components/common/request-notice";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Self-hosted fonts (blueprint section 6): Bricolage Grotesque headings, Geist UI, Geist Mono numbers/code.
const bricolage = localFont({
  src: "../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e10" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} – Get small jobs done. Free, private, no sign-up`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: ["online tools", "free tools", "pdf tools", "image tools", "developer tools", "calculators", "utilities"],
  authors: [{ name: SITE_CONFIG.name }],
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: `${SITE_CONFIG.name} - Free Online Tools`,
    description: "Free online tools for documents, images, development, and more.",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} - Free Online Tools`,
    description: "Free online tools for documents, images, development, and more.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_CONFIG.name,
  },
  other: {
    "distribution": "global",
    "rating": "general",
    "revisit-after": "1 days",
    "target": "all",
    "geo.region": "US",
    "geo.placename": "Worldwide",
    "HandheldFriendly": "True",
    "MobileOptimized": "320",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-US"
      className={`${bricolage.variable} ${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Google Analytics 4 Scripts & Route Navigation Tracker */}
        {GA_ID && <GoogleAnalytics measurementId={GA_ID} />}
        <SkipLink />
          <ThemeProvider>
            <AuthProvider>
              <TooltipProvider>
                <Suspense fallback={<div className="h-[var(--shell-header-height)] border-b" />}>
                  <SiteHeader />
                </Suspense>
                <main id="main-content" className="flex-1" role="main">
                  <Suspense fallback={null}><RequestNotice /></Suspense>
                  {children}
                </main>
                <SiteFooter />
                <BottomNav />
                <AskPalette />
                <FileTray catalog={compactCatalog()} />
                <WorkspaceSync />
                <Toaster closeButton position="top-center" />
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
