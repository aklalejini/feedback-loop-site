// Canonical site origin, used for SEO metadata (canonical URLs, OpenGraph),
// the sitemap, and robots. Override with NEXT_PUBLIC_SITE_URL in the Vercel
// project env if the domain changes; falls back to the production domain.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://meadbook.com"
).replace(/\/$/, "");

export const SITE_NAME = "Meadbook";
