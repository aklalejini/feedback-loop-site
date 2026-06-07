"use client";
import {
  NITROGEN_NEED_LABELS,
  nutrientAdditionStatus,
  tosnaSchedule,
  type AdditionStatus,
} from "@/lib/nutrients";
import type { Mead } from "@/lib/mead";

interface Props {
  mead: Mead;
  // When set, the schedule becomes an actionable checklist (detail page).
  interactive?: boolean;
  done?: number[];
  onToggle?: (index: number) => void;
}

const STATUS_TAG: Record<AdditionStatus, { label: string; cls: string } | null> = {
  done: null,
  overdue: { label: "overdue", cls: "text-red-800 bg-red-50 border-red-300" },
  due: { label: "due today", cls: "text-amber-900 bg-amber-50 border-amber-300" },
  upcoming: null,
};

// Date-column weight/colour per status, so the column tells you what to do now.
const STATUS_DATE_CLS: Record<AdditionStatus, string> = {
  done: "text-[var(--muted)] line-through",
  overdue: "text-red-800 font-bold",
  due: "text-amber-900 font-bold",
  upcoming: "text-[var(--ink-soft)]",
};

// Read-only by default; an actionable checklist when `interactive` is set.
export function NutrientSchedule({ mead, interactive = false, done = [], onToggle }: Props) {
  const schedule = tosnaSchedule(mead);
  if (!schedule) return null;

  const now = new Date();
  const doneCount = schedule.additions.filter((_, i) => done.includes(i)).length;
  // The earliest not-yet-added addition is the immediate action — highlight it
  // so the checklist points at "what to do next" even when nothing is overdue.
  const nextIdx = interactive ? schedule.additions.findIndex((_, i) => !done.includes(i)) : -1;
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <p className="eyebrow text-[var(--ink-soft)]">Nutrients · TOSNA (Fermaid O)</p>
        <span className="text-xs text-[var(--muted)]">
          {interactive ? (
            <strong className="text-[var(--ink-soft)]">{doneCount} of {schedule.additions.length} added</strong>
          ) : (
            <>{NITROGEN_NEED_LABELS[schedule.nitrogenNeed]} nitrogen need</>
          )}
        </span>
      </div>

      <p className="font-mono text-sm">
        {schedule.totalGrams.toFixed(1)} g total
        <span className="text-[var(--muted)]"> · </span>
        {schedule.perAdditionGrams.toFixed(1)} g × {schedule.additions.length}
      </p>

      {/* column headers */}
      <div
        className={`grid ${interactive ? "grid-cols-[1.5rem,1fr,4rem,4.5rem]" : "grid-cols-[1fr,4rem,4.5rem]"} gap-x-3 items-end border-b border-[var(--line)] pb-1`}
      >
        {interactive ? <span aria-hidden /> : null}
        <span className="eyebrow text-[10px]">Addition</span>
        <span className="eyebrow text-[10px] text-right">Amount</span>
        <span className="eyebrow text-[10px] text-right">Date</span>
      </div>

      <ul className="grid gap-1.5">
        {schedule.additions.map((a, i) => {
          const isDone = done.includes(i);
          const status = nutrientAdditionStatus(a.at, now, isDone);
          const tag = interactive ? STATUS_TAG[status] : null;
          const isNext = i === nextIdx && status === "upcoming";
          return (
            <li
              key={a.label}
              className={`grid ${interactive ? "grid-cols-[1.5rem,1fr,4rem,4.5rem]" : "grid-cols-[1fr,4rem,4.5rem]"} gap-x-3 items-center text-sm ${
                isNext ? "border-l-2 border-[var(--accent)] pl-1 -ml-1.5 rounded-sm" : ""
              }`}
            >
              {interactive ? (
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggle?.(i)}
                  aria-label={`Mark ${a.label} added`}
                  className="h-4 w-4 accent-[var(--accent)] cursor-pointer"
                />
              ) : null}

              <div className="min-w-0">
                <p className={`leading-tight ${isDone ? "line-through text-[var(--muted)]" : ""}`}>
                  {a.label}
                  {tag ? (
                    <span className={`ml-2 align-middle text-[10px] font-semibold border rounded px-1 py-0.5 ${tag.cls}`}>
                      {tag.label}
                    </span>
                  ) : null}
                  {isNext ? (
                    <span className="ml-2 align-middle text-[10px] font-semibold text-[var(--accent-deep)]">next up</span>
                  ) : null}
                </p>
                {a.note ? <p className="text-xs text-[var(--muted)] leading-tight">{a.note}</p> : null}
              </div>

              <span className={`font-mono tabular-nums text-right ${isDone ? "text-[var(--muted)] line-through" : "text-[var(--ink-soft)]"}`}>
                {a.grams.toFixed(1)} g
              </span>
              <span className={`font-mono tabular-nums text-right whitespace-nowrap ${interactive ? STATUS_DATE_CLS[status] : "text-[var(--ink-soft)]"}`}>
                {fmtDate(a.at)}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-[var(--muted)]">
        TOSNA is a widely-used community meadmaking protocol (Mead Made Right), not a lab YAN
        measurement. Degas gently before adding nutrients to active mead to avoid foam-over, and
        watch your gravity — finish additions by the one-third sugar break.
      </p>
    </div>
  );
}
