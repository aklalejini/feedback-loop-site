import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { YEAST_PROFILES } from "@/lib/knowledge/yeasts";
import { Ornament } from "@/components/Ornament";

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
    <div className="grid gap-8 reveal-stagger">
      <section className="grid gap-4">
        <p className="eyebrow text-on-wall">knowledge base</p>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-[1.05]">
          Mead yeast <em className="display-accent">guide</em>.
        </h1>
        <p className="hero-sub text-on-wall">
          Picking a yeast sets your mead&apos;s alcohol ceiling, its temperature window, and much of
          its flavour. Profiles drawn straight from manufacturer data.
        </p>
      </section>

      <Ornament />

      <ul className="grid sm:grid-cols-2 gap-4 reveal-stagger">
        {YEAST_PROFILES.map((y) => (
          <li key={y.slug} className="pixel-card p-5 transition-transform hover:-translate-y-1">
            <Link href={`/yeast/${y.slug}`} className="grid gap-2 no-underline text-[var(--ink)]">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-2xl leading-tight">{y.name}</h2>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-glow)] whitespace-nowrap">{y.alcoholTolerance}</span>
              </div>
              <p className="text-sm text-[var(--ink-soft)] leading-snug">{y.summary}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--muted)] mt-1">
                <span className="font-mono">{y.tempRange}</span>
                <span aria-hidden>·</span>
                <span>{y.nitrogen} nitrogen</span>
              </div>
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
