import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standard Next.js output (no standalone complexity)
  serverExternalPackages: ['better-sqlite3'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
