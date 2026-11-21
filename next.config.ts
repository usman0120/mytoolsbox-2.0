import type { NextConfig } from "next";

// Content Security Policy (blueprint section 15). Shipped as Report-Only first: browsers log
// violations without blocking anything. Switch the header name to "Content-Security-Policy"
// once a week of reports is clean.
const CONNECT = [
  "'self'",
  "https://*.googleapis.com",
  "https://*.firebaseio.com",
  "https://*.firebaseapp.com",
  "https://challenges.cloudflare.com",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  // On-device OCR (Tesseract) and video (ffmpeg.wasm) fetch their engines and language data:
  "https://cdn.jsdelivr.net",
  "https://unpkg.com",
  "https://tessdata.projectnaptha.com",
  // IP lookup tool
  "https://ipapi.co",
  "https://api.ipify.org",
];

function csp(connect: string[]) {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://challenges.cloudflare.com https://apis.google.com https://www.googletagmanager.com https://cdn.jsdelivr.net https://unpkg.com",
    "worker-src 'self' blob:",
    `connect-src ${connect.join(" ")}`,
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "frame-src https://challenges.cloudflare.com https://*.firebaseapp.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
    // Add "upgrade-insecure-requests" when switching to the enforcing header; browsers reject it in Report-Only.
  ].join("; ");
}

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Camera and microphone only for this site (scanner, recorder, speech tools); nothing else.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), display-capture=(self), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()" },
  // Allows the Google sign-in popup to talk back to the page.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...SECURITY_HEADERS, { key: "Content-Security-Policy-Report-Only", value: csp(CONNECT) }],
      },
      {
        // The API tester sends requests to whatever URL the user enters.
        source: "/dev/api-request-tester",
        headers: [{ key: "Content-Security-Policy-Report-Only", value: csp(["'self'", "https:", ...CONNECT.slice(1)]) }],
      },
      {
        // The service worker must never be served stale, or updates would not reach users.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
  // Keep production validation on fresh build-generated route types. The dev
  // cache is independent and can contain stale types from removed routes.
  typescript: {
    tsconfigPath: process.env.NODE_ENV === "production" ? "tsconfig.build.json" : "tsconfig.json",
  },
};

export default nextConfig;
