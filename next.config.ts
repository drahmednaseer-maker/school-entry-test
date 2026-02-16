import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We use serverExternalPackages to ensure better-sqlite3 (native) is handled correctly
  serverExternalPackages: ['better-sqlite3'],
  // Disabling standalone to use the standard build/start flow which is easier to debug on Railway
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
