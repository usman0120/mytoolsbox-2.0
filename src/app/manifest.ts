import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyToolsBox - Free Online Tools & Utilities",
    short_name: "MyToolsBox",
    description: SITE_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#070b14",
    theme_color: "#3b82f6",
    lang: "en",
    dir: "auto",
    categories: ["productivity", "utilities", "developer", "education", "business"],
    icons: [
      {
        src: "/mytoolsbox logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/mytoolsbox logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
