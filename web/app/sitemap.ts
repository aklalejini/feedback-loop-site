import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { allYeastSlugs } from "@/lib/knowledge/yeasts";

// Statically generated sitemap. Add new knowledge-base routes here as entity
// types are added (honey, troubleshooting, …).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/yeast", "/gear"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const yeastRoutes = allYeastSlugs().map((slug) => ({
    url: `${SITE_URL}/yeast/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...yeastRoutes];
}
