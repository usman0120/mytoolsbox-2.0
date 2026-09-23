import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title")?.slice(0, 90) || "MyToolsBox";
    const description =
      searchParams.get("description")?.slice(0, 160) ||
      "Fast, private, client-side tools and utilities that run directly in your browser.";
    const category = searchParams.get("category") || "Tools";
    const badge = searchParams.get("badge") || "100% Client-Side";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 70px",
            backgroundColor: "#070b14",
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(59, 130, 246, 0.22) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(139, 92, 246, 0.22) 0%, transparent 45%)",
            color: "#ffffff",
            fontFamily: "sans-serif",
          }}
        >
          {/* Top Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#ffffff",
                  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
                }}
              >
                M
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px" }}>
                  MyToolsBox
                </span>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#60a5fa" }}>
                  .me
                </span>
              </div>
            </div>

            {/* Privacy Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "999px",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34d399",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              <span>🔒</span>
              <span>{badge}</span>
            </div>
          </div>

          {/* Center Main Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              maxWidth: "1050px",
            }}
          >
            {/* Category Tag */}
            <div style={{ display: "flex" }}>
              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.35)",
                  color: "#93c5fd",
                  fontSize: "14px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {category}
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: title.length > 35 ? "50px" : "58px",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-1.5px",
                margin: 0,
                color: "#f8fafc",
              }}
            >
              {title}
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: "22px",
                lineHeight: 1.45,
                color: "#94a3b8",
                margin: 0,
              }}
            >
              {description}
            </p>
          </div>

          {/* Bottom Trust Indicators */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "#cbd5e1" }}>
              <span style={{ color: "#38bdf8" }}>⚡</span>
              <span>Instant In-Browser Execution</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "#cbd5e1" }}>
              <span style={{ color: "#34d399" }}>🛡️</span>
              <span>Files Never Leave Your Device</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "#cbd5e1" }}>
              <span style={{ color: "#a78bfa" }}>✨</span>
              <span>Free & Unlimited Use</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Error generating OG image";
    return new Response(errorMsg, { status: 500 });
  }
}
