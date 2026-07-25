import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  // @keystone/db ships TypeScript source (no build step), so it needs to be
  // transpiled by Next.js rather than consumed as a pre-built package.
  transpilePackages: ["@keystone/db"],
};

export default nextConfig;
