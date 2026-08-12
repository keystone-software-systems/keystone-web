import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "../../.."),
  },
  // @keystone/db, @keystone/ui, and @keystone/admin-core ship TypeScript source (no build
  // step), so they need to be transpiled by Next.js rather than consumed pre-built.
  transpilePackages: ["@keystone/db", "@keystone/ui", "@keystone/admin-core"],
};

export default nextConfig;
