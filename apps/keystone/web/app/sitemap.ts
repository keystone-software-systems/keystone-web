import type { MetadataRoute } from "next";
import { solutions } from "@/app/solutions/content";

const SITE_URL = "https://keystone.systems";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const solutionRoutes = solutions.map((s) => ({
    url: `${SITE_URL}/solutions/${s.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...solutionRoutes];
}
