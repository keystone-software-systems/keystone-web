import type { MetadataRoute } from "next";

// This app is never publicly linked and is auth-gated end to end;
// belt-and-suspenders alongside the `robots: { index: false }` metadata in
// app/layout.tsx.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
