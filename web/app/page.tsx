"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MeadForm } from "@/components/MeadForm";
import { events } from "@/lib/analytics";
import { loadMeads, upsertMead } from "@/lib/storage";
import { HONEYS, project, VESSELS, type Mead } from "@/lib/mead";

export default function HomePage() {
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

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <h1 className="text-3xl font-display font-semibold">Plan and track your mead.</h1>
        <p className="text-[var(--muted)] max-w-2xl">
          Design a batch, get a projected fermentation timeline, log observations as it
          progresses. Nothing leaves your browser — your batches live in local storage on
          this device.
        </p>
      </section>

      <section className="grid gap-3">
        <div className="flex justify-between items-baseline">
          <h2 className="text-xl font-semibold">Your batches</h2>
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="px-4 py-2 rounded bg-[var(--accent)] text-white font-medium hover:opacity-90"
            >
              New batch
            </button>
          ) : null}
        </div>

        {creating ? (
          <MeadForm onSubmit={handleSubmit} onCancel={() => setCreating(false)} submitLabel="Save batch" />
        ) : null}

        {meads.length === 0 && !creating ? (
          <div className="border border-dashed border-[var(--line)] rounded-lg p-8 text-center text-[var(--muted)]">
            No batches yet. Click <strong>New batch</strong> to design your first one.
          </div>
        ) : null}

        {meads.length > 0 ? (
          <ul className="grid sm:grid-cols-2 gap-4">
            {meads.map((m) => {
              const proj = project(m);
              const ageDays = Math.floor(
                (Date.now() - new Date(m.createdAt).getTime()) / 86400000,
              );
              return (
                <li
                  key={m.id}
                  className="border border-[var(--line)] rounded-lg p-4 bg-white/40 hover:bg-white transition-colors"
                >
                  <Link href={`/mead/${m.id}`} className="grid gap-2 no-underline text-[var(--ink)]">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-display font-semibold text-lg">{m.name}</h3>
                      <span className="text-xs text-[var(--muted)]">{ageDays}d in</span>
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      {HONEYS[m.honeyType].label} · {VESSELS[m.vessel].label} · {m.yeast}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span>Phase: <strong>{proj.currentPhase}</strong></span>
                      <span>Est. ABV: <strong>{proj.estABV.toFixed(1)}%</strong></span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
