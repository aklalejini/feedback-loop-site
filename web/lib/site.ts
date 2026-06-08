// Canonical site origin, used for SEO metadata (canonical URLs, OpenGraph),
// the sitemap, and robots. Override with NEXT_PUBLIC_SITE_URL if the domain
// changes; falls back to the current Vercel deployment.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://feedback-loop-site.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Meadbook";
