"use client";
import { NITROGEN_NEED_LABELS, tosnaSchedule } from "@/lib/nutrients";
import type { Mead } from "@/lib/mead";

// Read-only display of the TOSNA Fermaid O schedule for a batch. Returns null
// when the must is empty. The nitrogen need comes from the batch (set in the
// planner) or the strain default.
export function NutrientSchedule({ mead }: { mead: Mead }) {
  const schedule = tosnaSchedule(mead);
  if (!schedule) return null;

  const date = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="eyebrow text-[var(--ink-soft)]">Nutrients · TOSNA (Fermaid O)</p>
        <span className="text-xs text-[var(--muted)]">
          {NITROGEN_NEED_LABELS[schedule.nitrogenNeed]} nitrogen need
        </span>
      </div>

      <p className="font-mono text-sm">
        {schedule.totalGrams.toFixed(1)} g total
        <span className="text-[var(--muted)]"> · </span>
        {schedule.perAdditionGrams.toFixed(1)} g × 4 additions
      </p>

      <ol className="grid gap-1 text-sm">
        {schedule.additions.map((a) => (
          <li key={a.label} className="flex justify-between gap-3 border-b border-[var(--line)] pb-1">
            <span>
              {a.label}
              {a.note ? <span className="text-[var(--muted)]"> — {a.note}</span> : null}
            </span>
            <span className="font-mono tabular-nums whitespace-nowrap">
              {a.grams.toFixed(1)} g · {date(a.at)}
            </span>
          </li>
        ))}
      </ol>

      <p className="text-xs text-[var(--muted)]">
        TOSNA is a widely-used community meadmaking protocol (Mead Made Right), not a lab YAN
        measurement. Degas gently before adding nutrients to active mead to avoid foam-over, and
        watch your gravity — finish additions by the one-third sugar break.
      </p>
    </div>
  );
}
