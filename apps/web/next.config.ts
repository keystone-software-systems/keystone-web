import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  // @keystone/ui ships TypeScript source (no build step), so it needs to be
  // transpiled by Next.js rather than consumed as a pre-built package.
  transpilePackages: ["@keystone/ui"],
};

export default nextConfig;
