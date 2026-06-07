"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MeadForm } from "@/components/MeadForm";
import { SpriteVessel } from "@/components/SpriteVessel";
import { Timeline } from "@/components/Timeline";
import { events } from "@/lib/analytics";
import { buildSampleMead, SAMPLES, type SampleSpec } from "@/lib/samples";
import { loadMeads, upsertMead } from "@/lib/storage";
import { HONEYS, project, VESSELS, type Mead, type PhaseName } from "@/lib/mead";

export default function HomePage() {
  const router = useRouter();
  const [meads, setMeads] = useState<Mead[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setMeads(loadMeads());
  }, []);

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
    const sample = buildSampleMead(spec);
    upsertMead(sample);
    events.sampleLoaded(spec.kind);
    router.push(`/mead/${sample.id}`);
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <p className="eyebrow">a brewer&apos;s workbench</p>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-[1.05]">Plan and track your mead.</h1>
        <p className="text-[var(--ink-soft)] max-w-2xl leading-relaxed">
          Design a batch, watch a projected fermentation timeline unfold, and log observations as it
          progresses. Nothing leaves your browser — your batches live in local storage on this device.
        </p>
      </section>

      <section className="grid gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-display font-semibold">Your batches</h2>
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
          <div className="pixel-card p-6 sm:p-8 grid gap-4">
            <div className="text-center grid gap-1">
              <p className="text-[var(--ink-soft)]">
                No batches yet. Design your own with{" "}
                <strong className="text-[var(--ink)]">New batch</strong>,
                or load a sample below to see how the planner works.
              </p>
              <p className="text-xs text-[var(--muted)]">
                Each sample is a clearly-labeled starting recipe — pick by what you want it to taste like.
                You can delete or edit it anytime.
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {SAMPLES.map((spec) => (
                <li key={spec.kind}>
                  <button
                    type="button"
                    onClick={() => loadSample(spec)}
                    className="opt w-full p-3 grid gap-1 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="inline-block h-3 w-3 rounded-sm border border-[var(--ink)]"
                        style={{ background: spec.swatchColor }}
                      />
                      <span className="font-display text-lg leading-tight">{spec.label}</span>
                    </span>
                    <span className="text-sm text-[var(--ink-soft)] leading-snug">{spec.endProduct}</span>
                    <span className="text-xs text-[var(--muted)] font-mono">{spec.takeaway}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {meads.length > 0 ? (
          <ul className="grid gap-3">
            {meads.map((m) => (
              <BatchRow key={m.id} mead={m} />
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}

// One batch in the list. Hovering (or focusing) a timeline phase previews that
// phase's animation on the (now larger) vessel; the vessel and timeline live
// side by side as siblings so the timeline's hover targets aren't nested inside
// the navigating link.
function BatchRow({ mead: m }: { mead: Mead }) {
  const [hoverPhase, setHoverPhase] = useState<PhaseName | null>(null);
  const proj = project(m);
  const ageDays = Math.floor((Date.now() - new Date(m.createdAt).getTime()) / 86400000);
  const displayPhase = hoverPhase ?? proj.currentPhase;
  return (
    <li className="pixel-card p-4 grid sm:grid-cols-[124px,minmax(0,200px),minmax(0,1fr)] gap-4 sm:gap-6 items-center transition-transform hover:-translate-y-0.5">
      <Link href={`/mead/${m.id}`} className="block mx-auto sm:mx-0" aria-label={`Open ${m.name}`}>
        <SpriteVessel
          vessel={m.vessel}
          honeyType={m.honeyType}
          liters={m.waterL + (m.juiceL ?? 0) + m.honeyKg * 0.7}
          phase={displayPhase}
          size={120}
          animated
        />
      </Link>
      <Link href={`/mead/${m.id}`} className="grid gap-0.5 min-w-0 no-underline text-[var(--ink)]">
        <h3 className="font-display text-xl leading-tight truncate">{m.name}</h3>
        <p className="text-xs text-[var(--muted)] truncate">
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
