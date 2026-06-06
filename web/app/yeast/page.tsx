import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { YEAST_PROFILES } from "@/lib/knowledge/yeasts";

const TITLE = "Mead yeast guide — strains, temperature, and alcohol tolerance";
const DESCRIPTION =
  "Sourced profiles of common mead yeast strains: temperature range, alcohol tolerance, nitrogen needs, and what each is best for.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/yeast` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/yeast`, type: "website" },
};

export default function YeastIndexPage() {
  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <p className="eyebrow">knowledge base</p>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-[1.05]">Mead yeast guide</h1>
        <p className="text-[var(--ink-soft)] max-w-2xl leading-relaxed">
          Picking a yeast sets your mead&apos;s alcohol ceiling, temperature window, and flavor. These
          profiles are drawn from manufacturer data — more strains are being added as they&apos;re sourced.
        </p>
      </section>

      <ul className="grid sm:grid-cols-2 gap-3">
        {YEAST_PROFILES.map((y) => (
          <li key={y.slug} className="pixel-card p-4 transition-transform hover:-translate-y-0.5">
            <Link href={`/yeast/${y.slug}`} className="grid gap-1.5 no-underline text-[var(--ink)]">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-xl leading-tight">{y.name}</h2>
                <span className="text-[11px] font-mono text-[var(--muted)] whitespace-nowrap">{y.alcoholTolerance}</span>
              </div>
              <p className="text-sm text-[var(--ink-soft)] leading-snug">{y.summary}</p>
              <p className="text-xs text-[var(--muted)]">{y.tempRange}</p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-sm">
        <Link href="/" className="underline">← Back to the planner</Link>
      </p>
    </div>
  );
}
