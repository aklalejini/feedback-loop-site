import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { BacksweetenCalculator } from "@/components/BacksweetenCalculator";
import { Ornament } from "@/components/Ornament";

const TITLE = "Mead backsweetening calculator — honey for a target gravity";
const DESCRIPTION =
  "How much honey to sweeten a finished mead to a target final gravity, with AHA sweetness bands and the stabilization warning that keeps bottles safe.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/calculators/backsweeten` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/calculators/backsweeten`, type: "website" },
};

export default function BacksweetenCalculatorPage() {
  return (
    <div className="grid gap-8 reveal-stagger">
      <section className="grid gap-4 max-w-2xl">
        <p className="eyebrow text-on-wall">calculator</p>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-[1.05]">
          <em className="display-accent">Backsweetening</em> calculator.
        </h1>
      </section>

      <Ornament />

      <div className="max-w-2xl">
        <BacksweetenCalculator />
      </div>

      <section className="grid gap-2 max-w-2xl text-sm text-[var(--ink-soft)]">
        <h2 className="text-xl font-display text-[var(--ink)]">Why the warning matters</h2>
        <p>
          Sweet mead in a sealed bottle restarts fermenting if viable yeast meets fermentable
          sugar — pressure builds until bottles overcarbonate or burst. Stabilize first:
          potassium metabisulfite plus potassium sorbate after fermentation is complete and the
          mead has cleared, or sterile filtration, or pasteurization. Sorbate stops yeast from
          reproducing but won&apos;t halt an active fermentation, so confirm the gravity is stable
          over 2–3 days before stabilizing, and re-check it for a week after sweetening. Cold
          storage only postpones the problem. For sweet sparkling mead, keg and force-carbonate
          instead of bottle conditioning.
        </p>
        <p>
          The math uses the same honey model as the batch planner (1 kg honey ≈ 0.319 gravity
          points per litre, and it adds ~0.7 L of volume per kg), so the suggestion accounts for
          its own dilution. It&apos;s an estimate — add in stages and taste.
        </p>
      </section>

      <section className="grid gap-1.5 max-w-2xl">
        <h2 className="text-xl font-display">Sources</h2>
        <ul className="grid gap-1 text-xs text-[var(--muted)]">
          <li>
            <a className="underline" href="https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/" target="_blank" rel="noopener">
              AHA — &quot;The Sweet Life&quot; (sweetness bands, finishing)
            </a>
          </li>
          <li>
            <a className="underline" href="https://winemakermag.com/technique/backsweetening" target="_blank" rel="noopener">
              WineMaker Magazine — Backsweetening technique
            </a>
          </li>
          <li>
            <a className="underline" href="https://www.extension.iastate.edu/wine/publications/using-potassium-sorbate-to-inhibit-yeast-growth-in-bottled-wines/" target="_blank" rel="noopener">
              Iowa State Extension — Using potassium sorbate
            </a>
          </li>
        </ul>
      </section>

      <p className="text-sm">
        <Link href="/calculators/abv" className="underline">Need the ABV first? OG &amp; FG calculator →</Link>
      </p>
    </div>
  );
}
