import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { AFFILIATE_CATEGORIES } from "@/lib/affiliate";
import { BuyLink } from "@/components/BuyLink";
import { Ornament } from "@/components/Ornament";

const TITLE = "Gear & ingredients for mead-making";
const DESCRIPTION =
  "What you actually need to plan, brew, and bottle a mead batch — from your first 1-gallon jar to a 5-gallon carboy, with notes on each pick.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/gear` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/gear`, type: "article" },
};

export default function GearPage() {
  return (
    <article className="grid gap-10 reveal-stagger">
      <header className="grid gap-4 max-w-2xl">
        <p className="eyebrow text-on-wall">brewer&apos;s gear list</p>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-[1.05]">
          What you need to <em className="display-accent">make</em> mead.
        </h1>
        <p className="hero-sub text-on-wall">
          A working list organised by what you grab first. Some links are affiliate; if you buy
          something, Meadbook earns a small commission at no extra cost to you.
        </p>
        <nav aria-label="Sections" className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--accent-glow)]">
          {AFFILIATE_CATEGORIES.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="underline">
              {c.title}
            </a>
          ))}
        </nav>
      </header>

      <Ornament />

      {AFFILIATE_CATEGORIES.map((c) => (
        <section key={c.id} id={c.id} className="grid gap-3 scroll-mt-24">
          <div className="grid gap-1">
            <h2 className="text-2xl font-display">{c.title}</h2>
            <p className="text-sm text-[var(--ink-soft)]">{c.intro}</p>
          </div>
          <ul className="grid gap-2">
            {c.items.map((item) => (
              <li key={item.key} className="pixel-card-sm p-3">
                <BuyLink item={item} variant="row" />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="pixel-card-sm p-4 grid gap-2">
        <p className="font-display text-lg">Ready to plan a batch?</p>
        <p className="text-sm text-[var(--ink-soft)]">
          Pick a vessel, a honey, and a yeast — the planner does gravity, ABV, the fermentation
          timeline, and the nutrient schedule.
        </p>
        <Link href="/" className="btn px-4 py-2 justify-self-start no-underline">Open the planner →</Link>
      </section>

      <p className="text-xs text-[var(--muted)]">
        Disclosure: this page contains affiliate links to mead-making gear and ingredients.
        As an Amazon Associate, Meadbook earns from qualifying purchases. It costs you nothing
        extra, and it helps keep the planner free.
      </p>
    </article>
  );
}
