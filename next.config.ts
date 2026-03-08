import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables standalone output for Docker (smaller image size, optimal for Cloud Run)
  output: "standalone",
};

export default nextConfig;
