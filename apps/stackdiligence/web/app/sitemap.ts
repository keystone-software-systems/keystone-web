import type { MetadataRoute } from "next";

const SITE_URL = "https://stackdiligence.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/what-we-assess", "/process", "/sample-report", "/about", "/contact"];

  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
}
