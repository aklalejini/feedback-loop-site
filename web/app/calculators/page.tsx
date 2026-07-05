import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { Ornament } from "@/components/Ornament";

const TITLE = "Mead calculators — ABV and brewing math";
const DESCRIPTION =
  "Free mead-making calculators: work out alcohol by volume from hydrometer readings. No signup, nothing leaves your browser.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/calculators` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/calculators`, type: "website" },
};

// Hub for standalone calculators. Add new entries here as calculators ship
// (backsweetening, honey-to-gravity, ...), plus a sitemap route.
const CALCULATORS = [
  {
    href: "/calculators/abv",
    name: "ABV calculator",
    blurb: "Alcohol by volume from two hydrometer readings — with a high-gravity variant for strong meads.",
  },
];

export default function CalculatorsIndexPage() {
  return (
    <div className="grid gap-8 reveal-stagger">
      <section className="grid gap-4 max-w-2xl">
        <p className="eyebrow text-on-wall">brewing math</p>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-[1.05]">
          Mead <em className="display-accent">calculators</em>.
        </h1>
        <p className="hero-sub text-on-wall">
          Quick, honest brewing math. No signup, and nothing you type leaves your browser.
        </p>
      </section>

      <Ornament />

      <ul className="grid sm:grid-cols-2 gap-4">
        {CALCULATORS.map((c) => (
          <li key={c.href} className="pixel-card p-5 transition-transform hover:-translate-y-1">
            <Link href={c.href} className="grid gap-2 no-underline text-[var(--ink)]">
              <h2 className="font-display text-2xl leading-tight">{c.name}</h2>
              <p className="text-sm text-[var(--ink-soft)] leading-snug">{c.blurb}</p>
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
