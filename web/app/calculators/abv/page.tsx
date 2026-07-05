import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { AbvCalculator } from "@/components/AbvCalculator";
import { Ornament } from "@/components/Ornament";

const TITLE = "Mead ABV calculator — alcohol from hydrometer OG and FG";
const DESCRIPTION =
  "Work out your mead's alcohol by volume from two hydrometer readings. Standard homebrew formula, a high-gravity variant for strong meads, and honest limits.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/calculators/abv` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/calculators/abv`, type: "website" },
};

export default function AbvCalculatorPage() {
  return (
    <div className="grid gap-8 reveal-stagger">
      <section className="grid gap-4 max-w-2xl">
        <p className="eyebrow text-on-wall">calculator</p>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-[1.05]">
          Mead <em className="display-accent">ABV</em> calculator.
        </h1>
        <p className="hero-sub text-on-wall">
          Two hydrometer readings — before and after fermentation — are all it takes. Measured
          readings beat any recipe projection.
        </p>
      </section>

      <Ornament />

      <div className="max-w-xl">
        <AbvCalculator />
      </div>

      <section className="grid gap-2 max-w-2xl text-sm text-[var(--ink-soft)]">
        <h2 className="text-xl font-display text-[var(--ink)]">Reading the result honestly</h2>
        <p>
          The headline number uses <span className="font-mono text-[13px]">(OG − FG) × 131.25</span>,
          the standard homebrew approximation. Above ~1.100 OG the calculator also shows a
          high-gravity empirical estimate, because density change stops being linear as alcohol
          climbs. Both are estimates — a home calculation can&apos;t certify a commercial label ABV.
        </p>
        <p>
          Using a refractometer after fermentation? Alcohol distorts the reading — don&apos;t convert
          final Brix to gravity directly; take the final reading with a hydrometer.
        </p>
        <p>
          A stable FG over 2–3 days is what says fermentation is done. Airlock bubbles don&apos;t.
        </p>
      </section>

      <p className="text-sm">
        <Link href="/" className="underline">Planning a batch? The planner estimates OG from your honey →</Link>
      </p>
    </div>
  );
}
