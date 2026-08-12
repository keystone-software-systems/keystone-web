import type { MetadataRoute } from "next";

// Phase 0 has no public routes (login + dashboard only, both behind auth) —
// disallow everything for now. Once /submit ships (Phase 1), its
// indexability is a deliberate decision, not a default; see
// docs/intake-portal-design.md §11.7. Every other portal route stays
// noindexed regardless.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
