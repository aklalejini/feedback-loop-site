"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MeadForm } from "@/components/MeadForm";
import { SpriteVessel } from "@/components/SpriteVessel";
import { Timeline } from "@/components/Timeline";
import { BuyLink } from "@/components/BuyLink";
import { Ornament } from "@/components/Ornament";
import { AFFILIATE_KITS } from "@/lib/affiliate";
import { events } from "@/lib/analytics";
import { buildAllSamples, type SampleSpec } from "@/lib/samples";
import { loadMeads, upsertMead } from "@/lib/storage";
import { HONEYS, project, VESSELS, type Mead, type PhaseName, type VesselKind, type HoneyType } from "@/lib/mead";
import { STYLE_PROFILES, type StyleKind } from "@/lib/styles";

export default function HomePage() {
  const router = useRouter();
  const [meads, setMeads] = useState<Mead[]>([]);
  const [creating, setCreating] = useState(false);
  // Batch-list vessel size: bigger on desktop so the fermentation animation
  // (bubbles, foam, level) actually reads; compact on mobile where the row
  // stacks vertically.
  const [vesselSize, setVesselSize] = useState(120);

  useEffect(() => {
    setMeads(loadMeads());
  }, []);

  useEffect(() => {
    const update = () => setVesselSize(window.innerWidth >= 640 ? 168 : 132);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Build samples client-side so each card can preview its actual recipe
  // (vessel + honey colour + ABV + ready window).
  const samples = useMemo(() => buildAllSamples(), []);

  function handleSubmit(mead: Mead) {
    const next = upsertMead(mead);
    setMeads(next);
    setCreating(false);
    events.batchCreated({
      yeast: mead.yeast,
      vessel: mead.vessel,
      honey_type: mead.honeyType,
    });
  }

  function loadSample(spec: SampleSpec) {
    const built = samples.find((s) => s.spec.kind === spec.kind)?.mead;
    if (!built) return;
    upsertMead(built);
    events.sampleLoaded(spec.kind);
    router.push(`/mead/${built.id}`);
  }

  return (
    <div className="grid gap-10 reveal-stagger">
      <section className="grid gap-4">
        <p className="eyebrow text-on-wall">a brewer&apos;s workbench</p>
        <h1 className="text-5xl sm:text-6xl font-display font-semibold leading-[1.02] tracking-tight">
          Plan and track your <em className="display-accent">mead</em>.
        </h1>
        <p className="hero-sub text-on-wall">
          A quiet planner and a private journal — from your first jar to a brimming carboy.
          Free, runs in your browser, your batches live only on this device.
        </p>
      </section>

      <Ornament />

      <section className="grid gap-5">
        <div className="flex justify-between items-center">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-display font-semibold">Your batches</h2>
            {meads.length > 0 ? (
              <span className="text-xs text-[var(--muted)] italic">
                {meads.length} in the cellar
              </span>
            ) : null}
          </div>
          {!creating ? (
            <button onClick={() => setCreating(true)} className="btn px-4 py-2">
              New batch
            </button>
          ) : null}
        </div>

        {creating ? (
          <MeadForm onSubmit={handleSubmit} onCancel={() => setCreating(false)} submitLabel="Save batch" />
        ) : null}

        {meads.length === 0 && !creating ? (
          <EmptyCellar samples={samples} onLoad={loadSample} />
        ) : null}

        {meads.length > 0 ? (
          <ul className="grid gap-3 reveal-stagger">
            {meads.map((m) => (
              <BatchRow key={m.id} mead={m} vesselSize={vesselSize} />
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}

// ============================================================================
// Empty state: the cellar's first impression. Three vessels on a wooden shelf,
// candle pool warming the wall behind them, then four recipe cards a brand-new
// visitor can pick from to taste-test the planner.
// ============================================================================
function EmptyCellar({
  samples,
  onLoad,
}: {
  samples: ReturnType<typeof buildAllSamples>;
  onLoad: (spec: SampleSpec) => void;
}) {
  const shelf: VesselKind[] = ["jar-1gal", "jug-1gal", "jug-5gal"];
  return (
    <div className="grid gap-7">
      <div className="grid gap-3 text-center">
        <div className="cellar-shelf">
          <div className="pool" aria-hidden />
          <div className="vessels">
            {shelf.map((v) => (
              <SpriteVessel
                key={v}
                vessel={v}
                honeyType="wildflower"
                liters={0}
                phase="lag"
                size={104}
                animated={false}
              />
            ))}
          </div>
          <div className="plank" />
        </div>
        <h3 className="font-display text-3xl sm:text-4xl leading-tight">
          Your cellar is <em className="display-accent">empty</em>.
        </h3>
        <p className="text-[var(--ink-soft)] max-w-lg mx-auto leading-relaxed">
          Pick a recipe to taste-test the planner, or design your own with{" "}
          <strong className="text-[var(--ink)]">New batch</strong>. Each sample is a real working recipe —
          edit, copy, or delete it any time.
        </p>
      </div>

      <ul className="grid sm:grid-cols-2 gap-4 reveal-stagger">
        {samples.map(({ spec, mead }) => (
          <li key={spec.kind} className="contents">
            <RecipeCard spec={spec} mead={mead} onLoad={onLoad} />
          </li>
        ))}
      </ul>

      <p className="text-xs text-[var(--muted)] text-center flex items-baseline justify-center gap-2 flex-wrap">
        <span>No gear yet?</span>
        <BuyLink item={AFFILIATE_KITS[0]} text="A 1-gallon starter kit covers your first batch" />
      </p>
    </div>
  );
}

// One recipe card: vessel-stage hero, style tag, label + flavour line,
// honey + yeast metadata, and the takeaway as a "ready when" footer.
function RecipeCard({
  spec,
  mead,
  onLoad,
}: {
  spec: SampleSpec;
  mead: Mead;
  onLoad: (spec: SampleSpec) => void;
}) {
  const styleProfile = STYLE_PROFILES[spec.style as StyleKind];
  const honey = HONEYS[mead.honeyType as HoneyType];
  return (
    <button
      type="button"
      onClick={() => onLoad(spec)}
      className="recipe-card group"
      aria-label={`Load sample: ${spec.label}`}
    >
      <div className="vessel-stage" aria-hidden>
        <SpriteVessel
          vessel={spec.vessel}
          honeyType={mead.honeyType}
          juiceType={mead.juiceType}
          juiceL={mead.juiceL}
          liters={mead.waterL + (mead.juiceL ?? 0) + mead.honeyKg * 0.7}
          phase="primary"
          size={108}
          animated
        />
      </div>

      <span className="style-tag">
        <span aria-hidden style={{ background: spec.swatchColor }} className="inline-block h-2 w-2 rounded-sm border border-[rgba(0,0,0,0.5)]" />
        {styleProfile.label}
      </span>

      <div className="grid gap-1">
        <h4 className="font-display text-xl leading-tight">{spec.label}</h4>
        <p className="text-sm text-[var(--ink-soft)] leading-snug">{spec.endProduct}</p>
        <p className="text-[11px] text-[var(--muted)] mt-1">
          {honey.label} honey · {VESSELS[spec.vessel].label} · {mead.yeast}
        </p>
      </div>

      <div className="start-line">
        <span className="font-mono">{spec.takeaway}</span>
        <span className="start-cta">Start brewing →</span>
      </div>
    </button>
  );
}

// One batch in the list. Hovering (or focusing) a timeline phase previews that
// phase's animation on the (now larger) vessel; the vessel and timeline live
// side by side as siblings so the timeline's hover targets aren't nested inside
// the navigating link.
function BatchRow({ mead: m, vesselSize }: { mead: Mead; vesselSize: number }) {
  const [hoverPhase, setHoverPhase] = useState<PhaseName | null>(null);
  const proj = project(m);
  const ageDays = Math.floor((Date.now() - new Date(m.createdAt).getTime()) / 86400000);
  const displayPhase = hoverPhase ?? proj.currentPhase;
  return (
    <li className="pixel-card p-4 grid sm:grid-cols-[184px,minmax(0,1fr),minmax(0,1.7fr)] gap-4 sm:gap-6 items-center transition-transform hover:-translate-y-0.5">
      <Link href={`/mead/${m.id}`} className="block mx-auto sm:mx-0" aria-label={`Open ${m.name}`}>
        <SpriteVessel
          vessel={m.vessel}
          honeyType={m.honeyType}
          juiceType={m.juiceType}
          juiceL={m.juiceL}
          liters={m.waterL + (m.juiceL ?? 0) + m.honeyKg * 0.7}
          phase={displayPhase}
          size={vesselSize}
          animated
        />
      </Link>
      <Link href={`/mead/${m.id}`} className="grid gap-0.5 min-w-0 no-underline text-[var(--ink)]">
        <h3 className="font-display text-xl leading-tight text-balance">{m.name}</h3>
        <p className="text-xs text-[var(--muted)]">
          {HONEYS[m.honeyType].label} · {VESSELS[m.vessel].label} · {m.yeast}
        </p>
        <p className="text-xs mt-1">
          <strong className="capitalize">{proj.currentPhase}</strong>
          <span className="text-[var(--muted)]"> · </span>
          {proj.estABV.toFixed(1)}% ABV
          <span className="text-[var(--muted)]"> · </span>
          {ageDays}d in
        </p>
      </Link>
      <div className="min-w-0">
        <Timeline projection={proj} selectedPhase={hoverPhase} onHoverPhase={setHoverPhase} />
      </div>
    </li>
  );
}
