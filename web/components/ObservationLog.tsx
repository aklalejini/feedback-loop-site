"use client";
import { useState } from "react";
import type { Observation } from "@/lib/mead";

interface Props {
  observations: Observation[];
  onAdd: (obs: Observation) => void;
  onDelete: (id: string) => void;
}

export function ObservationLog({ observations, onAdd, onDelete }: Props) {
  const [gravity, setGravity] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="grid gap-4">
      <form
        className="grid sm:grid-cols-[120px,1fr,auto] gap-2 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          const g = gravity.trim() === "" ? undefined : Number(gravity);
          if (g !== undefined && (Number.isNaN(g) || g < 0.99 || g > 1.2)) return;
          onAdd({
            id: typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : Math.random().toString(36).slice(2),
            at: new Date().toISOString(),
            gravity: g,
            note: note.trim() || undefined,
          });
          setGravity("");
          setNote("");
        }}
      >
        <div className="grid gap-1">
          <label htmlFor="gravity" className="eyebrow text-[var(--ink-soft)]">
            Gravity
          </label>
          <input
            id="gravity"
            type="number"
            step={0.001}
            min={0.99}
            max={1.2}
            placeholder="e.g. 1.024"
            value={gravity}
            onChange={(e) => setGravity(e.target.value)}
            className="in tabular-nums"
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor="note" className="eyebrow text-[var(--ink-soft)]">
            Note
          </label>
          <input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="airlock activity, taste, racked, etc."
            className="in"
          />
        </div>
        <button type="submit" className="btn px-5 py-2 self-end">
          Log
        </button>
      </form>

      {observations.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No observations yet. Log a gravity reading or a tasting note to update the projection.</p>
      ) : (
        <ul className="grid gap-2">
          {[...observations]
            .sort((a, b) => b.at.localeCompare(a.at))
            .map((o) => (
              <li
                key={o.id}
                className="flex justify-between items-start pixel-card-sm px-3 py-2"
              >
                <div className="grid gap-0.5">
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(o.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                  {o.gravity !== undefined ? (
                    <span className="font-mono text-sm">SG {o.gravity.toFixed(3)}</span>
                  ) : null}
                  {o.note ? <span className="text-sm">{o.note}</span> : null}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(o.id)}
                  className="text-xs text-[var(--muted)] hover:text-red-700"
                  aria-label={`Delete observation from ${o.at}`}
                >
                  delete
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
