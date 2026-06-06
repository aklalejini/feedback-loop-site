import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { allYeastSlugs, getYeastProfile, YEAST_PROFILES } from "@/lib/knowledge/yeasts";

export function generateStaticParams() {
  return allYeastSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const y = getYeastProfile(params.slug);
  if (!y) return {};
  const title = `${y.name} for mead — temperature, tolerance, and uses`;
  return {
    title,
    description: y.summary,
    alternates: { canonical: `${SITE_URL}/yeast/${y.slug}` },
    openGraph: { title, description: y.summary, url: `${SITE_URL}/yeast/${y.slug}`, type: "article" },
  };
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <span className="eyebrow">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

export default function YeastDetailPage({ params }: { params: { slug: string } }) {
  const y = getYeastProfile(params.slug);
  if (!y) notFound();

  const others = YEAST_PROFILES.filter((o) => o.slug !== y.slug);

  return (
    <article className="grid gap-8">
      <header className="grid gap-2">
        <Link href="/yeast" className="text-sm text-[var(--muted)] no-underline hover:underline">
          ← Yeast guide
        </Link>
        <h1 className="text-4xl font-display leading-tight">{y.name}</h1>
        {y.aka ? <p className="text-sm text-[var(--muted)]">Also listed as {y.aka}</p> : null}
        <p className="text-[var(--ink-soft)] max-w-2xl leading-relaxed">{y.summary}</p>
      </header>

      <section className="pixel-card-sm p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Spec label="Type" value={y.category} />
        <Spec label="Temperature" value={y.tempRange} />
        <Spec label="Alcohol tolerance" value={y.alcoholTolerance} />
        <Spec label="Nitrogen" value={y.nitrogen} />
      </section>

      <section className="grid gap-2">
        <h2 className="text-2xl font-display">Flavor &amp; best uses</h2>
        <p className="text-[var(--ink-soft)]">{y.sensory}</p>
        <ul className="flex flex-wrap gap-2 mt-1">
          {y.bestFor.map((b) => (
            <li key={b} className="text-xs font-semibold border border-[var(--line)] rounded px-2 py-1">{b}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-2">
        <h2 className="text-2xl font-display">Good to know</h2>
        <ul className="grid gap-1.5 list-disc pl-5 text-[var(--ink-soft)]">
          {y.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <section className="pixel-card-sm p-4 grid gap-2">
        <p className="font-display text-lg">Plan a batch with {y.name}</p>
        <p className="text-sm text-[var(--ink-soft)]">
          Use the planner to project gravity, ABV, a fermentation timeline, and a nutrient schedule for your recipe.
        </p>
        <Link href="/" className="btn px-4 py-2 justify-self-start no-underline">Open the planner →</Link>
      </section>

      <section className="grid gap-2">
        <h2 className="text-xl font-display">Sources</h2>
        <ul className="grid gap-1 text-sm">
          {y.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline break-words">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-2 border-t border-[var(--line)] pt-5">
        <h2 className="text-xl font-display">Other strains</h2>
        <ul className="flex flex-wrap gap-3">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/yeast/${o.slug}`} className="underline">{o.name}</Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
