import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Navbar } from "@/components/navigation";
import { Footer } from "@/components/navigation";
import { AuthProvider } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/constants";
import { SkipLink } from "@/components/common/accessibility";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1d2e" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} - Free Online Tools & Utilities`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: "Free online tools for documents, images, development, calculations, and more. All processing happens in your browser - no uploads required.",
  keywords: ["online tools", "free tools", "pdf tools", "image tools", "developer tools", "calculators", "utilities"],
  authors: [{ name: SITE_CONFIG.name }],
  icons: {
    icon: "/mytoolsbox logo.png",
    apple: "/mytoolsbox logo.png",
  },
  openGraph: {
    title: `${SITE_CONFIG.name} - Free Online Tools`,
    description: "Free online tools for documents, images, development, and more.",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    type: "website",
    images: [
      {
        url: "/mytoolsbox logo.png",
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
    images: ["/mytoolsbox logo.png"],
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Google Analytics 4 Scripts */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <SkipLink />
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <TooltipProvider>
                <Suspense fallback={null}>
                  <Navbar />
                </Suspense>
                <main id="main-content" className="flex-1" role="main">
                  {children}
                </main>
                <Footer />
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
