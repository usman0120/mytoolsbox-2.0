import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Archivo, Geist_Mono, Newsreader } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Navbar } from "@/components/navigation";
import { Footer } from "@/components/navigation";
import { AuthProvider } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/constants";
import { SkipLink } from "@/components/common/accessibility";
import { I18nProvider } from "@/lib/i18n";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1513" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} - Free Online Tools & Utilities`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: "Online tools for documents, images, development, calculations, and more. Processing and access requirements vary by tool.",
  keywords: ["online tools", "free tools", "pdf tools", "image tools", "developer tools", "calculators", "utilities"],
  authors: [{ name: SITE_CONFIG.name }],
  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      "en": `${SITE_CONFIG.url}/en`,
      "es": `${SITE_CONFIG.url}/es`,
      "ur": `${SITE_CONFIG.url}/ur`,
      "fr": `${SITE_CONFIG.url}/fr`,
      "de": `${SITE_CONFIG.url}/de`,
      "pt": `${SITE_CONFIG.url}/pt`,
      "hi": `${SITE_CONFIG.url}/hi`,
      "ar": `${SITE_CONFIG.url}/ar`,
      "x-default": SITE_CONFIG.url,
    },
  },
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
      className={`${archivo.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Google Analytics 4 Scripts & Route Navigation Tracker */}
        {GA_ID && <GoogleAnalytics measurementId={GA_ID} />}
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
