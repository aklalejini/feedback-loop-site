import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { RESOURCE_GROUPS } from "@/lib/knowledge/resources";
import { Ornament } from "@/components/Ornament";

const TITLE = "Mead-making resources — reputable references and research";
const DESCRIPTION =
  "A curated list of established mead references: brewing-association guides, peer-reviewed fermentation studies, yeast and nutrient data sheets, and US labeling regulations — the sources Meadbook's guidance is built on.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/resources` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/resources`, type: "website" },
};

export default function ResourcesPage() {
  return (
    <div className="grid gap-8 reveal-stagger">
      <section className="grid gap-4 max-w-2xl">
        <p className="eyebrow text-on-wall">references</p>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-[1.05]">
          Mead <em className="display-accent">resources</em>.
        </h1>
        <p className="hero-sub text-on-wall">
          The sources Meadbook&apos;s own numbers are built on — peer-reviewed studies, brewing
          associations, manufacturer data, and winemaking institutes. No SEO-farm blogs.
        </p>
        <nav aria-label="Sections" className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--accent-glow)]">
          {RESOURCE_GROUPS.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="underline">{g.title}</a>
          ))}
        </nav>
      </section>

      <Ornament />

      {RESOURCE_GROUPS.map((group) => (
        <section key={group.id} id={group.id} className="grid gap-3 scroll-mt-24">
          <div className="grid gap-1">
            <h2 className="text-2xl font-display">{group.title}</h2>
            <p className="text-sm text-[var(--ink-soft)]">{group.intro}</p>
          </div>
          <ul className="grid gap-2">
            {group.items.map((r) => (
              <li key={r.url} className="pixel-card-sm p-3">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener nofollow"
                  className="grid gap-1 no-underline text-[var(--ink)] group"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-base group-hover:underline">
                      {r.title}
                      {r.pdf ? <span className="ml-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">PDF</span> : null}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--accent-glow)] whitespace-nowrap">Visit ↗</span>
                  </span>
                  <span className="text-xs text-[var(--ink-soft)]">{r.note}</span>
                  <span className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                    <span className="font-mono uppercase tracking-wider border border-[var(--line)] rounded px-1.5">{r.tag}</span>
                    <span>{r.publisher}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="pixel-card-sm p-4 grid gap-2">
        <p className="text-sm text-[var(--ink-soft)]">
          A note on trust: some widely-used community protocols (like TOSNA) come from expert
          practice rather than controlled trials. They&apos;re useful and popular — Meadbook just
          doesn&apos;t present them as settled science.
        </p>
      </section>

      <p className="text-sm">
        <Link href="/" className="underline">← Back to the planner</Link>
      </p>
    </div>
  );
}
