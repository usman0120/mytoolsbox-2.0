import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production validation on fresh build-generated route types. The dev
  // cache is independent and can contain stale types from removed routes.
  typescript: {
    tsconfigPath: process.env.NODE_ENV === "production" ? "tsconfig.build.json" : "tsconfig.json",
  },
};

export default nextConfig;
