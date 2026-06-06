"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MeadForm } from "@/components/MeadForm";
import { ObservationLog } from "@/components/ObservationLog";
import { NutrientSchedule } from "@/components/NutrientSchedule";
import { Timeline } from "@/components/Timeline";
import { SpriteVessel } from "@/components/SpriteVessel";
import { events } from "@/lib/analytics";
import { deleteMead, getMead, upsertMead } from "@/lib/storage";
import { fermentationRisks, gravitySource, project, YEASTS, type Mead, type Observation, type PhaseName } from "@/lib/mead";

export default function MeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [mead, setMead] = useState<Mead | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [previewPhase, setPreviewPhase] = useState<PhaseName | null>(null);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    const m = getMead(id);
    setMead(m ?? null);
    if (m) {
      const proj = project(m);
      const ageDays = Math.floor((Date.now() - new Date(m.createdAt).getTime()) / 86400000);
      events.batchViewed({ phase: proj.currentPhase, age_days: ageDays });
    }
  }, [params?.id]);

  if (mead === undefined) {
    return <p className="text-[var(--muted)]">Loading…</p>;
  }
  if (mead === null) {
    return (
      <div className="grid gap-3">
        <p>Batch not found. It may live in another browser, or have been deleted.</p>
        <Link href="/" className="underline">Back to all batches</Link>
      </div>
    );
  }

  const proj = project(mead);

  function addObservation(obs: Observation) {
    if (!mead) return;
    const next: Mead = { ...mead, observations: [...mead.observations, obs] };
    upsertMead(next);
    setMead(next);
    events.observationLogged({
      has_gravity: obs.gravity !== undefined,
      phase: project(next).currentPhase,
    });
  }

  function removeObservation(id: string) {
    if (!mead) return;
    const next: Mead = { ...mead, observations: mead.observations.filter((o) => o.id !== id) };
    upsertMead(next);
    setMead(next);
  }

  function handleEdit(updated: Mead) {
    upsertMead(updated);
    setMead(updated);
    setEditing(false);
  }

  function handleDelete() {
    if (!mead) return;
    if (!confirm(`Delete "${mead.name}"? This can't be undone.`)) return;
    deleteMead(mead.id);
    router.push("/");
  }

  if (editing) {
    return (
      <div className="grid gap-4">
        <h1 className="text-3xl font-display">Edit batch</h1>
        <MeadForm
          initial={mead}
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
          submitLabel="Save changes"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <header className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <Link href="/" className="text-sm text-[var(--muted)] no-underline hover:underline">← All batches</Link>
          <h1 className="text-4xl font-display mt-1 leading-tight">{mead.name}</h1>
          <p className="text-sm text-[var(--muted)]">
            Started {new Date(mead.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing(true)} className="btn-ghost px-3 py-2 text-sm">
            Edit recipe
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="btn-ghost px-3 py-2 text-sm text-red-700"
          >
            Delete
          </button>
        </div>
      </header>

      <section className="grid sm:grid-cols-[auto,1fr] gap-6 items-start">
        <div className="pixel-card-sm p-3 mx-auto sm:mx-0 bg-[var(--bg)]">
          <SpriteVessel
            vessel={mead.vessel}
            honeyType={mead.honeyType}
            liters={mead.waterL + mead.honeyKg * 0.7}
            phase={previewPhase ?? proj.currentPhase}
            size={200}
          />
        </div>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <p className="eyebrow text-[var(--ink-soft)]">
              {gravitySource(mead) === "measured" ? "Measured" : "Recipe estimate"}
            </p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Stat
                label={gravitySource(mead) === "measured" ? "Measured OG" : "Starting gravity"}
                value={proj.startingGravity.toFixed(3)}
              />
              <Stat label="Est. final gravity" value={proj.estFinalGravity.toFixed(3)} />
              <Stat label="Est. ABV" value={`${proj.estABV.toFixed(1)}%`} />
            </div>
          </div>
          {fermentationRisks(proj.startingGravity, YEASTS[mead.yeast]).map((r) => (
            <p
              key={r.kind}
              className="text-sm text-amber-900 bg-amber-50 border border-amber-300 rounded-md px-3 py-2"
            >
              {r.message}
            </p>
          ))}
          <Timeline
            projection={proj}
            selectedPhase={previewPhase}
            onSelectPhase={setPreviewPhase}
          />
          <p className="text-xs text-[var(--muted)]">
            Timeline is an estimate — confirm completion with a stable gravity reading over several
            days, not the calendar or airlock activity. Don&apos;t backsweeten or bottle a sweet mead
            until fermentation is stable and (if needed) chemically stabilized.
          </p>
          {previewPhase ? (
            <button
              type="button"
              onClick={() => setPreviewPhase(null)}
              className="justify-self-start text-xs underline text-[var(--muted)] hover:text-[var(--ink)]"
            >
              ← back to now
            </button>
          ) : (
            <p className="text-xs text-[var(--muted)]">Tip: click a phase above to preview the vessel at that point.</p>
          )}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl font-display">Nutrients</h2>
        <div className="pixel-card-sm p-4">
          <NutrientSchedule mead={mead} />
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl font-display">Observations</h2>
        <ObservationLog
          observations={mead.observations}
          onAdd={addObservation}
          onDelete={removeObservation}
        />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <span className="eyebrow">{label}</span>
      <span className="font-mono text-base">{value}</span>
    </div>
  );
}
